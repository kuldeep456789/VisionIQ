import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Camera, Alert } from '../types';
import AlertsPanel from './AlertsPanel';
import AnalyzerView from './AnalyzerView';

const PPE_CAMERA_ID = 'ppe-detection';
const ppeCamera: Camera = {
  id: PPE_CAMERA_ID,
  name: 'On-Site Analysis',
  location: 'Local Device',
};

const DashboardStatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string; }> = ({ icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-all duration-200 hover:shadow-md h-full">
    <div className={`p-3 rounded-lg ${color} text-white shadow-sm`}>
      {icon || <div className="w-6 h-6" />}
    </div>
    <div>
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<Camera>(ppeCamera);
  const [liveObjectCount, setLiveObjectCount] = useState<number>(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Resizable Layout State
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(70);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStatsUpdate = useCallback((count: number) => {
    setLiveObjectCount(count);
  }, []);

  const handleAlert = useCallback((newAlert: Alert) => {
    setAlerts(prev => {
      const isDuplicate = prev.some(a =>
        a.type === newAlert.type &&
        a.severity === newAlert.severity &&
        (newAlert.timestamp.getTime() - a.timestamp.getTime() < 5000)
      );

      if (isDuplicate) return prev;
      return [newAlert, ...prev].slice(0, 50);
    });
  }, []);

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((mouseMoveEvent.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth >= 30 && newWidth <= 80) {
        setLeftPanelWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);


  return (
    <div className="flex flex-col h-full font-sans overflow-hidden" ref={containerRef}>
      <div className="mb-6 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time overview of your security analytics.</p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full font-medium border border-blue-100 dark:border-blue-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            System Operational
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardStatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg>}
            label="Active Cameras"
            value={1}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <DashboardStatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>}
            label="Critical Alerts"
            value={alerts.filter(a => a.severity === 'Critical').length}
            color="bg-gradient-to-br from-red-500 to-red-600"
          />
          <DashboardStatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>}
            label="Live Occupancy"
            value={liveObjectCount}
            color="bg-gradient-to-br from-amber-500 to-amber-600"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-0 overflow-hidden relative">

        <div
          className="flex flex-col gap-6 overflow-y-auto pr-0 lg:pr-2 pb-4 min-h-0"
          style={{ flexBasis: `${leftPanelWidth}%`, flexGrow: 0, flexShrink: 0 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-h-[500px] lg:h-[calc(100%-180px)]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Detection Feed
              </h3>
              <div className="text-xs text-gray-500">
                {selectedCamera.name} ({selectedCamera.location})
              </div>
            </div>
            <div className="flex-1 relative bg-black">
              <AnalyzerView
                camera={selectedCamera}
                onStatsUpdate={handleStatsUpdate}
                onAlert={handleAlert}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 shrink-0">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Available Cameras</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedCamera(ppeCamera)}
                className={`p-3 rounded-lg text-left transition-all duration-200 border ${selectedCamera?.id === PPE_CAMERA_ID ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 ring-1 ring-blue-500' : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold text-sm ${selectedCamera?.id === PPE_CAMERA_ID ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}>{ppeCamera.name}</span>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{ppeCamera.location}</div>
              </button>
            </div>
          </div>
        </div>

        <div
          className="hidden lg:flex w-4 cursor-col-resize items-center justify-center hover:bg-blue-500/10 transition-colors group z-10 -ml-2 -mr-2 relative"
          onMouseDown={startResizing}
        >
          <div className={`w-1 h-12 rounded-full transition-colors ${isResizing ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500'}`}></div>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-w-[300px] min-h-[400px] mt-4 lg:mt-0 lg:ml-2">
          <AlertsPanel alerts={alerts} setAlerts={setAlerts} />
        </div>

      </div>

      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize user-select-none opacity-0"></div>
      )}
    </div>
  );
};
export default Dashboard;