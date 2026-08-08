import { Router } from 'express';
import { MarketScannerService } from '../modules/live-trading/services/MarketScannerService.js';
import { deltaSyncService } from '../modules/delta-exchange/index.js';

const router = Router();

router.get('/telemetry', (_req, res) => {
  res.json({
    success: true,
    data: MarketScannerService.getTelemetry(),
    deltaConnected: deltaSyncService.isConnected?.() || false,
  });
});

router.get('/stats', (_req, res) => {
  res.json({
    success: true,
    data: MarketScannerService.getStats(),
  });
});

router.get('/state', (_req, res) => {
  res.json({
    success: true,
    state: MarketScannerService.getState(),
  });
});

router.post('/control', (req, res) => {
  const { action, symbol } = req.body; 
  
  if (symbol) {
    if (action === 'start' || action === 'resume') MarketScannerService.setPairStatus(symbol, 'RUNNING');
    if (action === 'pause') MarketScannerService.setPairStatus(symbol, 'PAUSED');
    if (action === 'stop') MarketScannerService.setPairStatus(symbol, 'STOPPED');
  } else {
    switch (action) {
      case 'start':
        MarketScannerService.setState('RUNNING');
        break;
      case 'pause':
        MarketScannerService.setState('PAUSED');
        break;
      case 'resume':
        MarketScannerService.setState('RUNNING');
        break;
      case 'stop':
        MarketScannerService.setState('STOPPED');
        break;
    }
  }
  
  res.json({ success: true, state: MarketScannerService.getState() });
});

export default router;
