import { EventEmitter } from 'events';
import { AppEventType } from '@algoapp/shared';

class AppEventBusEmitter extends EventEmitter {}

const emitter = new AppEventBusEmitter();
emitter.setMaxListeners(100);

export class AppEventBus {
  public static publish(type: AppEventType, payload: unknown): void {
    emitter.emit(type, payload);
  }

  public static subscribe(type: AppEventType, handler: (payload: any) => void): void {
    emitter.on(type, handler);
  }

  public static unsubscribe(type: AppEventType, handler: (payload: any) => void): void {
    emitter.off(type, handler);
  }
}
