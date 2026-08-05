import { create } from 'zustand';

export interface DeltaStoreState {
  isConnected: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR';
  restStatus: string;
  wsStatus: string;
  latencyMs: number;
  lastHeartbeat: string | null;
  setConnectionStatus: (status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR') => void;
  setDetailedStatus: (restStatus: string, wsStatus: string) => void;
  setLatency: (ms: number) => void;
  recordHeartbeat: () => void;
}

export const useDeltaStore = create<DeltaStoreState>((set) => ({
  isConnected: false,
  status: 'DISCONNECTED',
  restStatus: 'UNCONFIGURED',
  wsStatus: 'DISCONNECTED',
  latencyMs: 0,
  lastHeartbeat: null,

  setConnectionStatus: (status) =>
    set({
      status,
      isConnected: status === 'CONNECTED',
    }),

  setDetailedStatus: (restStatus, wsStatus) =>
    set({
      restStatus,
      wsStatus,
      status: wsStatus === 'CONNECTED' && restStatus === 'CONNECTED' ? 'CONNECTED' : 'DISCONNECTED',
      isConnected: wsStatus === 'CONNECTED' && restStatus === 'CONNECTED',
    }),

  setLatency: (latencyMs) => set({ latencyMs }),

  recordHeartbeat: () =>
    set({
      lastHeartbeat: new Date().toISOString(),
    }),
}));
