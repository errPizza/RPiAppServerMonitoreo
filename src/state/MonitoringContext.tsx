import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, DashboardData, LogEntry, RemoteCommand } from '../models';
import { monitoringRepository } from '../repositories/MonitoringRepository';

type LoadState = 'loading' | 'loaded' | 'error' | 'offline' | 'unauthorized';
interface MonitoringContextValue { dashboard?: DashboardData; logs: LogEntry[]; alerts: Alert[]; state: LoadState; error?: string; refresh: () => Promise<void>; sendCommand: (command: RemoteCommand) => Promise<string>; }
const MonitoringContext = createContext<MonitoringContextValue | undefined>(undefined);

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const [dashboard, setDashboard] = useState<DashboardData>(); const [logs, setLogs] = useState<LogEntry[]>([]); const [alerts, setAlerts] = useState<Alert[]>([]);
  const [state, setState] = useState<LoadState>('loading'); const [error, setError] = useState<string>();
  const refresh = useCallback(async () => { setState(previous => previous === 'loaded' ? 'loaded' : 'loading'); setError(undefined); try { const [nextDashboard, nextLogs, nextAlerts] = await Promise.all([monitoringRepository.getDashboard(), monitoringRepository.getLogs(), monitoringRepository.getAlerts()]); setDashboard(nextDashboard); setLogs(nextLogs); setAlerts(nextAlerts); setState('loaded'); } catch (cause) { const message = cause instanceof Error ? cause.message : 'Unable to connect to monitoring API.'; setError(message); setState(message.includes('401') ? 'unauthorized' : 'error'); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const sendCommand = useCallback(async (command: RemoteCommand) => (await monitoringRepository.sendCommand(command)).message, []);
  const value = useMemo(() => ({ dashboard, logs, alerts, state, error, refresh, sendCommand }), [dashboard, logs, alerts, state, error, refresh, sendCommand]);
  return <MonitoringContext.Provider value={value}>{children}</MonitoringContext.Provider>;
}
export const useMonitoring = () => { const context = useContext(MonitoringContext); if (!context) throw new Error('useMonitoring must be used inside MonitoringProvider'); return context; };
