import { AppEventBus } from '../modules/realtime-operations/services/appEventBus.service.js';
import { AppEventType } from '@algoapp/shared';

type EventHandler = (payload: unknown) => void;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  public on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  public emit(event: string, payload?: unknown): void {
    // 1. Dispatch to local subscribers
    this.handlers.get(event)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[EventBus] Error handling event "${event}":`, err);
      }
    });

    // 2. Cross-bridge to AppEventBus
    try {
      AppEventBus.publish(event as AppEventType, payload);
    } catch {
      // ignore unmapped string events
    }
  }

  public clear(event?: string): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }
}

export const eventBus = new EventBus();

