import { NotificationDto, NotificationSeverity } from '@algoapp/shared';
import { AppEventBus } from './appEventBus.service.js';

let notificationsStore: NotificationDto[] = [
  {
    id: 'NOTIF-1',
    type: 'SYSTEM_STARTUP',
    title: 'Real-Time Event Bus Online',
    message: 'AlgoApp Pro v2 continuous trading operations bus initialized.',
    severity: 'SUCCESS',
    read: false,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'NOTIF-2',
    type: 'EXCHANGE_SYNC',
    title: 'Delta Exchange Synchronized',
    message: 'Sandbox / Production connection status: 100% matched.',
    severity: 'INFO',
    read: false,
    timestamp: new Date().toISOString(),
  },
];

export class NotificationCenterService {
  public static async notify(
    type: string,
    title: string,
    message: string,
    severity: NotificationSeverity = 'INFO'
  ): Promise<NotificationDto> {
    const notif: NotificationDto = {
      id: `NOTIF-${Date.now()}`,
      type,
      title,
      message,
      severity,
      read: false,
      timestamp: new Date().toISOString(),
    };

    notificationsStore.unshift(notif);
    AppEventBus.publish('NOTIFICATION_GENERATED', notif);
    return notif;
  }

  public async getNotifications(severityFilter?: NotificationSeverity): Promise<NotificationDto[]> {
    if (!severityFilter) return notificationsStore;
    return notificationsStore.filter((n) => n.severity === severityFilter);
  }

  public async markAsRead(id: string): Promise<boolean> {
    const target = notificationsStore.find((n) => n.id === id);
    if (target) {
      target.read = true;
      return true;
    }
    return false;
  }
}
