import { Server } from 'socket.io';
import { newsEmitter } from './newsAggregator.service.js';
import { logger } from '../../../logger/index.js';

export function setupNewsWebSocket(io: Server) {
  const newsNs = io.of('/news');

  newsNs.on('connection', (socket) => {
    logger.info(`[WS:News] Client connected: ${socket.id}`);
    
    socket.on('subscribe-ticker', (ticker: string) => {
      socket.join(`ticker-${ticker.toUpperCase()}`);
    });

    socket.on('disconnect', () => {
      logger.info(`[WS:News] Client disconnected: ${socket.id}`);
    });
  });

  // Push new articles to all connected clients
  newsEmitter.on('new-article', (article) => {
    newsNs.emit('new-article', article);
    
    // Also emit to ticker-specific rooms
    if (article.tickers) {
      for (const ticker of article.tickers) {
        newsNs.to(`ticker-${ticker}`).emit('new-article', article);
      }
    }
  });

  // Heartbeat
  setInterval(() => {
    newsNs.emit('ping', { timestamp: Date.now() });
  }, 30000);
}
