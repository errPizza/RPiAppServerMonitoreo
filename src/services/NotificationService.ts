import { AlertLevel } from '../models';

export interface NotificationService { configure(): Promise<void>; setCategoryEnabled(level: AlertLevel, enabled: boolean): Promise<void>; }
export class DisabledNotificationService implements NotificationService {
  async configure() {}
  async setCategoryEnabled(_level: AlertLevel, _enabled: boolean) {}
}
