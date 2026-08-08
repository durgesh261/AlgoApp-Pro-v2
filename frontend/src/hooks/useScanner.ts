import { useEffect, useState } from 'react';
import { apiClient as api } from '../services/api';

export interface ScannerTelemetry {
  symbol: string;
  livePrice: number;
  activeOrderBlocksCount: number;
  orderBlockWidthPercent: number;
  scanState: string;
  latestConfidenceScore: number;
  lastScanAt: string;
  userStatus?: string;
}

export interface ScannerStats {
  ticks: number;
  signals: number;
  trades: number;
}

export function useScanner() {
  const [telemetry, setTelemetry] = useState<ScannerTelemetry[]>([]);
  const [stats, setStats] = useState<ScannerStats>({ ticks: 0, signals: 0, trades: 0 });
  const [scannerState, setScannerState] = useState<string>('IDLE');
  const [isConnected, setIsConnected] = useState(false);
  const [isDeltaConnected, setIsDeltaConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchScannerData() {
      try {
        const [telRes, statsRes, stateRes] = await Promise.all([
          api.get('/scanner/telemetry'),
          api.get('/scanner/stats'),
          api.get('/scanner/state'),
        ]);

        if (!mounted) return;

        setTelemetry(telRes.data?.data || []);
        setIsDeltaConnected(telRes.data?.deltaConnected || false);
        setStats(statsRes.data?.data || { ticks: 0, signals: 0, trades: 0 });
        setScannerState(stateRes.data?.state || 'IDLE');
        setIsConnected(true);
      } catch (err) {
        if (mounted) setIsConnected(false);
      }
    }

    fetchScannerData();
    const interval = setInterval(fetchScannerData, 2000); // Poll every 2s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const controlScanner = async (action: 'start' | 'pause' | 'resume' | 'stop', symbol?: string) => {
    try {
      await api.post('/scanner/control', { action, symbol });
      // Immediately optimistic update could go here
    } catch (error) {
      console.error('Failed to control scanner:', error);
    }
  };

  return { telemetry, stats, scannerState, isConnected, isDeltaConnected, controlScanner };
}
