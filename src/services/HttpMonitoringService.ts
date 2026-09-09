import { environment } from '../config/environment';
import { Alert, DashboardData, LogEntry, RemoteCommand } from '../models';
import { MonitoringService } from './MonitoringService';

/** API adapter placeholder. Add token retrieval through a secure-storage implementation here. */
export class HttpMonitoringService implements MonitoringService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), environment.requestTimeoutMs);
    try {
      const response = await fetch(`${environment.apiBaseUrl}${path}`, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...options.headers } });
      if (!response.ok) throw new Error(`Monitoring API returned ${response.status}`);
      return response.json() as Promise<T>;
    } finally { clearTimeout(timer); }
  }
  getDashboard() { return this.request<DashboardData>('/dashboard'); }
  getLogs() { return this.request<LogEntry[]>('/logs'); }
  getAlerts() { return this.request<Alert[]>('/alerts'); }
  sendCommand(command: RemoteCommand) { return this.request<{ message: string }>('/commands', { method: 'POST', body: JSON.stringify(command) }); }
}
