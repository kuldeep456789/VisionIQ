
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => <AlertItem key={alert.id} alert={alert} onDismiss={handleDismiss} />)
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 text-center">

            <p>{alerts.length > 0 ? 'No alerts match the current filter.' : 'No new alerts.'}</p>
            {alerts.length === 0 && <p className="text-sm">System is operating normally.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;