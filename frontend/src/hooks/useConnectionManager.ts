import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../services/api';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'degraded';

interface ConnectionState {
  status: ConnectionStatus;
  lastConnected: Date | null;
  lastError: string | null;
  retryCount: number;
  nextRetryIn: number;
  isBackendReachable: boolean;
  isDeltaReachable: boolean;
}

const MAX_DELAY_MS = 30000;
const BASE_DELAY_MS = 2000;

export function useConnectionManager() {
  const [state, setState] = useState<ConnectionState>({
    status: 'connecting',
    lastConnected: null,
    lastError: null,
    retryCount: 0,
    nextRetryIn: 0,
    isBackendReachable: false,
    isDeltaReachable: false,
  });

  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  const clearTimers = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    if (!isMounted.current) return false;

    try {
      const res = await apiClient.get('/health', { timeout: 8000 });
      const data = res.data;

      if (data.status === 'ok' || data.status === 'degraded') {
        setState(prev => ({
          ...prev,
          status: data.status === 'ok' ? 'connected' : 'degraded',
          lastConnected: new Date(),
          lastError: data.status === 'ok' ? null : 'Some backend services are degraded',
          retryCount: 0,
          nextRetryIn: 0,
          isBackendReachable: true,
          isDeltaReachable: data.services?.deltaExchange === 'connected',
        }));
        return data.status === 'ok';
      }

      setState(prev => ({
        ...prev,
        status: 'degraded',
        lastError: 'Backend is running but some services are down',
        isBackendReachable: true,
        isDeltaReachable: data.services?.deltaExchange === 'connected',
      }));
      return false;
    } catch (err: any) {
      if (!isMounted.current) return false;

      const errorMsg =
        err.code === 'ECONNABORTED'
          ? 'Backend connection timed out'
          : err.code === 'ERR_NETWORK'
          ? 'Could not reach the backend API. Is it running?'
          : err.message || 'Unknown connection error';

      setState(prev => ({
        ...prev,
        status: 'disconnected',
        lastError: errorMsg,
        isBackendReachable: false,
        isDeltaReachable: false,
      }));
      return false;
    }
  }, []);

  const scheduleRetry = useCallback(
    (currentRetryCount: number) => {
      clearTimers();

      const delay = Math.min(BASE_DELAY_MS * Math.pow(1.5, currentRetryCount), MAX_DELAY_MS);
      let remaining = Math.ceil(delay / 1000);

      setState(prev => ({ ...prev, nextRetryIn: remaining, status: 'connecting' }));

      countdownRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(countdownRef.current!);
        } else {
          if (isMounted.current) {
            setState(s => ({ ...s, nextRetryIn: remaining }));
          }
        }
      }, 1000);

      retryTimerRef.current = setTimeout(() => {
        checkHealth().then(isHealthy => {
          if (!isHealthy && isMounted.current) {
            setState(s => {
              scheduleRetry(s.retryCount + 1);
              return { ...s, retryCount: s.retryCount + 1 };
            });
          }
        });
      }, delay);
    },
    [checkHealth, clearTimers]
  );

  useEffect(() => {
    isMounted.current = true;

    // Immediate first check
    checkHealth().then(isHealthy => {
      if (!isHealthy && isMounted.current) scheduleRetry(0);
    });

    // Periodic health check while connected (every 30s)
    const interval = setInterval(() => {
      if (isMounted.current) {
        checkHealth().then(isHealthy => {
          if (!isHealthy && isMounted.current) scheduleRetry(0);
        });
      }
    }, 30000);

    return () => {
      isMounted.current = false;
      clearTimers();
      clearInterval(interval);
    };
  }, [checkHealth, scheduleRetry, clearTimers]);

  const forceReconnect = useCallback(async () => {
    clearTimers();
    setState(prev => ({ ...prev, status: 'connecting', retryCount: 0, nextRetryIn: 0 }));
    const isHealthy = await checkHealth();
    if (!isHealthy && isMounted.current) scheduleRetry(0);
  }, [checkHealth, scheduleRetry, clearTimers]);

  return {
    ...state,
    forceReconnect,
    isOffline: state.status === 'disconnected',
    isDegraded: state.status === 'degraded',
  };
}
