
import React, { useState } from 'react';
import type { Alert } from '../types';
import { AlertSeverity } from '../types';


interface AlertsPanelProps {
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
}

const severityStyles = {
  [AlertSeverity.Critical]: 'bg-red-500/10 dark:bg-red-500/20 border-accent-red text-red-700 dark:text-red-300',
  [AlertSeverity.Warning]: 'bg-yellow-500/10 dark:bg-yellow-500/20 border-accent-yellow text-yellow-700 dark:text-yellow-300',
  [AlertSeverity.Info]: 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-400 text-blue-700 dark:text-blue-300',
};

const AlertItem: React.FC<{ alert: Alert; onDismiss: (id: string) => void }> = ({ alert, onDismiss }) => {
  return (
    <div className={`p-3 rounded-lg border-l-4 ${severityStyles[alert.severity]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-light-text dark:text-white">{alert.type}</p>
          <p className="text-sm">{alert.message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {alert.cameraName} - {alert.timestamp.toLocaleTimeString()}
          </p>
        </div>
        <button onClick={() => onDismiss(alert.id)} className="text-gray-400 hover:text-light-text dark:hover:text-white transition-colors">
          Dismiss
        </button>
      </div>
    </div>
  );
};


const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, setAlerts }) => {
  const [filter, setFilter] = useState<AlertSeverity | 'All'>('All');

  const handleDismiss = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'All') return true;
    return alert.severity === filter;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-light-border dark:border-gray-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">

            <h3 className="text-lg font-bold">Live Alerts</h3>
          </div>
          {alerts.length > 0 &&
            <span className="bg-accent-red text-white text-xs font-bold px-2 py-1 rounded-full">{alerts.length}</span>
          }
        </div>
        <div className="flex items-center gap-2 mt-3">
          {(['All', ...Object.values(AlertSeverity)] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${filter === sev
                ? 'bg-brand-blue text-white'
                : 'bg-gray-200 dark:bg-gray-light text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-brand-blue-light'
                }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => <AlertItem key={alert.id} alert={alert} onDismiss={handleDismiss} />)
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="font-medium">{alerts.length > 0 ? 'No alerts match filter.' : 'No new alerts.'}</p>
            <p className="text-xs mt-1">System operating normally.</p>
          </div>
        )}
      </div>

      <div className="border-t border-light-border dark:border-gray-light bg-gray-50 dark:bg-gray-800/50 p-4">
        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Alert Guide</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-light-text dark:text-white">Critical</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Immediate security threats, violence, or system failures requiring urgent action.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-light-text dark:text-white">Warning</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Potential hazards, loitering, or capacity thresholds near limits.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7.25-2.25a.75.75 0 0 1 1.5 0v.625c0 .2.115.385.295.474l1.875.938a.75.75 0 0 1-.67 1.342L12.25 10.45v3.3a.75.75 0 0 1-1.5 0V10.25a.75.75 0 0 1 .455-.694l1.37-.685V7.75Z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-light-text dark:text-white">Info</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">General system updates, entry/exit logs, and routine maintenance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;