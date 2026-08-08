import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../services/api';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'degraded';

interface ConnectionState {
  status: ConnectionStatus;
  lastError: string | null;
  nextRetryIn: number;
  retryCount: number;
  isBackendReachable: boolean;
  isDeltaReachable: boolean;
}

const HEALTH_INTERVAL_MS = 30000; // 30s when connected
const RETRY_BASE_MS = 2000;
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

  // All mutable state lives in refs to avoid effect re-runs
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const healthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // ─── Cleanup all timers ─────────────────────────────
  const clearAllTimers = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (healthIntervalRef.current) {
      clearInterval(healthIntervalRef.current);
      healthIntervalRef.current = null;
    }
  }, []);

  // ─── Health check (stable ref, never recreated) ─────
  const checkHealthRef = useRef(async (): Promise<boolean> => {
    try {
      const res = await apiClient.get('/health', { timeout: 8000 });
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

      setState({
        status: 'disconnected',
        lastError: msg,
        nextRetryIn: 0,
        isBackendReachable: false,
        isDeltaReachable: false,
      });
      return false;
    }
  });

  // ─── Schedule retry with countdown ──────────────────
  const scheduleRetryRef = useRef((currentRetryCount: number) => {
    clearAllTimers();

    const delay = Math.min(
      RETRY_BASE_MS * Math.pow(1.5, currentRetryCount),
      RETRY_MAX_MS
    );

    let remaining = Math.ceil(delay / 1000);

    // Update countdown every second
    setState(s => ({ ...s, nextRetryIn: remaining }));

    countdownTimerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(countdownTimerRef.current!);
        countdownTimerRef.current = null;
      } else if (isMountedRef.current) {
        setState(s => ({ ...s, nextRetryIn: remaining }));
      }
    }, 1000);

    // Execute retry after delay
    retryTimerRef.current = setTimeout(async () => {
      retryTimerRef.current = null;
      const isHealthy = await checkHealthRef.current();

      if (!isMountedRef.current) return;

      if (!isHealthy) {
        setState(s => {
          const nextCount = s.retryCount + 1;
          scheduleRetryRef.current(nextCount);
          return { ...s, retryCount: nextCount };
        });
      }
    }, delay);
  });

  // ─── Force reconnect (manual) ───────────────────────
  const forceReconnect = useCallback(() => {
    clearAllTimers();
    setState(s => ({ ...s, status: 'connecting', nextRetryIn: 0, retryCount: 0 }));
    checkHealthRef.current().then(isHealthy => {
      if (!isHealthy && isMountedRef.current) {
        scheduleRetryRef.current(0);
      }
    });
  }, [clearAllTimers]);

  // ─── Main effect: runs ONCE on mount ────────────────
  useEffect(() => {
    isMountedRef.current = true;

    // Immediate first check
    checkHealthRef.current().then(isHealthy => {
      if (!isHealthy && isMountedRef.current) {
        setState(s => {
          scheduleRetryRef.current(s.retryCount);
          return s;
        });
      }
    });

    // Periodic health check (only when connected)
    healthIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return;
      checkHealthRef.current().then(isHealthy => {
        if (!isHealthy && isMountedRef.current) {
          setState(s => {
            scheduleRetryRef.current(s.retryCount);
            return s;
          });
        }
      });
    }, HEALTH_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- EMPTY dependency array = never re-runs

  return {
    ...state,
    forceReconnect,
    isOffline: state.status === 'disconnected',
    isDegraded: state.status === 'degraded',
  };
}
