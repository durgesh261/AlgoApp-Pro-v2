import { eventBus } from '../../../services/EventBus.js';
import { logger } from '../../../logger/index.js';

export interface NewsEvent {
  id: string;
  title: string;
  category: 'CPI' | 'PPI' | 'NFP' | 'FOMC' | 'ETF' | 'SEC' | 'DELTA' | 'INTEREST_RATE' | 'GENERAL';
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  publishedAt: Date;
  isBlocking: boolean;
}

/**
 * News Filter Engine
 * 
 * Strategy §21: Monitor high-impact news. Can prevent new entries.
 * 
 * Blocking categories: CPI, PPI, NFP, FOMC, Interest Rate, SEC announcements
 * Blocking window: 30 minutes before to 60 minutes after event
 */
export class NewsFilterEngine {
  private static blockingCategories = new Set([
    'CPI', 'PPI', 'NFP', 'FOMC', 'INTEREST_RATE', 'SEC'
  ]);
  
  private static readonly BLOCK_BEFORE_MINUTES = 30;
  private static readonly BLOCK_AFTER_MINUTES = 60;
  private static recentEvents: NewsEvent[] = [];

  /**
   * Check if new entries should be blocked right now.
   */
  public static isBlocking(): boolean {
    this.cleanupOldEvents();
    
    const now = new Date();
    
    for (const event of this.recentEvents) {
      if (!event.isBlocking) continue;
      
      const blockStart = new Date(event.publishedAt.getTime() - this.BLOCK_BEFORE_MINUTES * 60000);
      const blockEnd = new Date(event.publishedAt.getTime() + this.BLOCK_AFTER_MINUTES * 60000);
      
      if (now >= blockStart && now <= blockEnd) {
        logger.info(
          { event: event.title, category: event.category, until: blockEnd },
          'News filter BLOCKING new entries'
        );
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get current blocking status with details.
   */
  public static getStatus(): { isBlocking: boolean; activeEvents: NewsEvent[]; nextEvent?: NewsEvent } {
    this.cleanupOldEvents();
    
    const now = new Date();
    const activeEvents = this.recentEvents.filter(e => {
      if (!e.isBlocking) return false;
      const blockStart = new Date(e.publishedAt.getTime() - this.BLOCK_BEFORE_MINUTES * 60000);
      const blockEnd = new Date(e.publishedAt.getTime() + this.BLOCK_AFTER_MINUTES * 60000);
      return now >= blockStart && now <= blockEnd;
    });

    // Find next upcoming blocking event
    const upcoming = this.recentEvents
      .filter(e => e.isBlocking && e.publishedAt > now)
      .sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime())[0];

    const result: { isBlocking: boolean; activeEvents: NewsEvent[]; nextEvent?: NewsEvent } = {
      isBlocking: activeEvents.length > 0,
      activeEvents,
    };
    if (upcoming) {
      result.nextEvent = upcoming;
    }
    return result;
  }

  /**
   * Add a news event (from RSS, API, or manual input).
   */
  public static addEvent(event: NewsEvent): void {
    // Auto-determine if blocking
    if (this.blockingCategories.has(event.category) && event.impactLevel === 'HIGH') {
      event.isBlocking = true;
    }

    this.recentEvents.push(event);
    this.recentEvents.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    
    // Keep only last 100 events
    if (this.recentEvents.length > 100) {
      this.recentEvents = this.recentEvents.slice(0, 100);
    }

    if (event.isBlocking) {
      eventBus.emit('news:blocking_event', event);
    }

    logger.info({ event: event.title, category: event.category, blocking: event.isBlocking }, 'News event added');
  }

  /**
   * Fetch latest events from external sources.
   * Call this periodically (e.g., every 5 minutes).
   */
  public static async fetchLatestEvents(): Promise<void> {
    // TODO: Integrate with actual news APIs (CryptoPanic, CoinDesk RSS, etc.)
    // For now, this is a placeholder that loads from DB if available
    
    try {
      const { prisma } = await import('../../../db.js');
      const dbEvents = await prisma.newsEvent.findMany({
        where: {
          publishedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: 50,
      });

      for (const e of dbEvents) {
        this.addEvent({
          id: e.id,
          title: e.title,
          category: e.category as any,
          impactLevel: e.impactLevel as any,
          publishedAt: e.publishedAt,
          isBlocking: e.isBlocking,
        });
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to fetch news events from DB');
    }
  }

  private static cleanupOldEvents(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    this.recentEvents = this.recentEvents.filter(e => e.publishedAt > cutoff);
  }
}
