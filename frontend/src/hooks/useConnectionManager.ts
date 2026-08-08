import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient as api } from '../services/api';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'degraded';

interface ConnectionState {
  status: ConnectionStatus;
  lastError: string | null;
  nextRetryIn: number;
  retryCount: number;
  isBackendReachable: boolean;
  isDeltaReachable: boolean;
}

const HEALTH_INTERVAL_MS = 30000;
const RETRY_BASE_MS = 3000;
const RETRY_MAX_MS = 30000;

export function useConnectionManager() {
  const [state, setState] = useState<ConnectionState>({
    status: 'connecting',
    lastError: null,
    nextRetryIn: 0,
    retryCount: 0,
    isBackendReachable: false,
    isDeltaReachable: false,
  });

  // Mutable refs for timer control
  const timersRef = useRef<{
    retry: ReturnType<typeof setTimeout> | null;
    countdown: ReturnType<typeof setInterval> | null;
    health: ReturnType<typeof setInterval> | null;
  }>({ retry: null, countdown: null, health: null });

  const isMountedRef = useRef(true);

  const clearTimers = useCallback(() => {
    if (timersRef.current.retry) clearTimeout(timersRef.current.retry);
    if (timersRef.current.countdown) clearInterval(timersRef.current.countdown);
    if (timersRef.current.health) clearInterval(timersRef.current.health);
    timersRef.current = { retry: null, countdown: null, health: null };
  }, []);

  // ─── Health check ───────────────────────────────────
  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const res = await api.get('/health', { timeout: 8000 });
      const data = res.data;

      const backendOk = data.status === 'ok';
      const deltaOk = data.services?.deltaExchange === 'connected';

      if (!isMountedRef.current) return false;

      if (backendOk) {
        setState({
          status: 'connected',
          lastError: null,
          nextRetryIn: 0,
          retryCount: 0,
          isBackendReachable: true,
          isDeltaReachable: deltaOk,
        });
        return true;
      } else {
        setState(prev => ({
          ...prev,
          status: 'degraded',
          lastError: 'Some backend services are degraded',
          isBackendReachable: true,
          isDeltaReachable: deltaOk,
        }));
        return false;
      }
    } catch (err: any) {
      const msg = err.code === 'ECONNABORTED'
        ? 'Backend connection timed out'
        : err.message || 'Could not reach the backend API';

      if (!isMountedRef.current) return false;

      setState(prev => ({
        ...prev,
        status: 'disconnected',
        lastError: msg,
        nextRetryIn: 0,
        retryCount: prev.retryCount,
        isBackendReachable: false,
        isDeltaReachable: false,
      }));
      return false;
    }
  }, []);

  // ─── Schedule retry ─────────────────────────────────
  const scheduleRetry = useCallback((attempt: number) => {
    clearTimers();

    const delay = Math.min(RETRY_BASE_MS * Math.pow(1.5, attempt), RETRY_MAX_MS);
    let remaining = Math.ceil(delay / 1000);

    setState(s => ({ ...s, nextRetryIn: remaining }));

    timersRef.current.countdown = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (timersRef.current.countdown) clearInterval(timersRef.current.countdown);
        timersRef.current.countdown = null;
      } else if (isMountedRef.current) {
        setState(s => ({ ...s, nextRetryIn: remaining }));
      }
    }, 1000);

    timersRef.current.retry = setTimeout(async () => {
      timersRef.current.retry = null;
      const isHealthy = await checkHealth();

      if (!isMountedRef.current) return;

      if (!isHealthy) {
        setState(s => ({ ...s, retryCount: attempt + 1 }));
        scheduleRetry(attempt + 1);
      }
    }, delay);
  }, [checkHealth, clearTimers]);

  // ─── Force reconnect ────────────────────────────────
  const forceReconnect = useCallback(() => {
    clearTimers();
    setState(s => ({ ...s, status: 'connecting', nextRetryIn: 0, retryCount: 0 }));
    checkHealth().then(isHealthy => {
      if (!isHealthy && isMountedRef.current) {
        scheduleRetry(0);
      }
    });
  }, [checkHealth, scheduleRetry, clearTimers]);

  // ─── Mount effect: runs ONCE ────────────────────────
  useEffect(() => {
    isMountedRef.current = true;

    checkHealth().then(isHealthy => {
      if (!isHealthy && isMountedRef.current) {
        scheduleRetry(0);
      }
    });

    timersRef.current.health = setInterval(() => {
      checkHealth().then(isHealthy => {
        if (!isHealthy && isMountedRef.current) {
          scheduleRetry(0);
        }
      });
    }, HEALTH_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearTimers();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    forceReconnect,
    isOffline: state.status === 'disconnected',
    isDegraded: state.status === 'degraded',
  };
}
