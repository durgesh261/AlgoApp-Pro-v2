import { Router } from 'express';
import { CopilotEngineService } from '../modules/copilot/services/copilotEngine.service.js';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, activeSymbol = 'BTCUSD.P', userId = 'default-user' } = req.body;
    
    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }

    const response = await CopilotEngineService.processQuery(userId, message, activeSymbol);
    
    res.json({
      success: true,
      data: response,
      history: CopilotEngineService.getHistory(userId),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/history', (req, res) => {
  const userId = (req.query.userId as string) || 'default-user';
  res.json({
    success: true,
    data: CopilotEngineService.getHistory(userId),
  });
});

router.delete('/history', (req, res) => {
  const userId = (req.query.userId as string) || 'default-user';
  CopilotEngineService.clearHistory(userId);
  res.json({ success: true, message: 'History cleared' });
});

export default router;
