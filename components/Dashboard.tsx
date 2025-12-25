import React, { useState, useCallback } from 'react';
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
  <div className="bg-light-secondary dark:bg-gray-medium p-4 rounded-lg shadow-lg flex items-center space-x-4 transition-transform transform hover:-translate-y-1">
    <div className={`p-3 rounded-full ${color}`}>
      {icon || <div className="w-6 h-6" />}
    </div>
    <div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-light-text dark:text-white">{value}</div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<Camera>(ppeCamera);
  const [liveObjectCount, setLiveObjectCount] = useState<number>(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const handleStatsUpdate = useCallback((count: number) => {
    setLiveObjectCount(count);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-8 flex flex-col gap-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardStatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg>}
            label="Total Cameras"
            value={1}
            color="bg-blue-500"
          />
          <DashboardStatCard icon={null} label="Live Alerts" value={alerts.length} color="bg-accent-red" />
          <DashboardStatCard icon={null} label="Live Objects Detected" value={liveObjectCount} color="bg-accent-yellow" />
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Live Dashboard</h2>
        </div>

        <div className="bg-light-secondary dark:bg-gray-medium rounded-lg shadow-lg overflow-hidden flex-grow">
          <AnalyzerView camera={selectedCamera} onStatsUpdate={handleStatsUpdate} />
        </div>

        <div className="bg-light-secondary dark:bg-gray-medium rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-bold mb-3 border-b border-light-border dark:border-gray-light pb-2">Camera Feeds</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* PPE Detection Camera - On Site Analysis */}
            <button
              onClick={() => setSelectedCamera(ppeCamera)}
              className={`p-3 rounded-lg text-left transition-all duration-200 ${selectedCamera?.id === PPE_CAMERA_ID ? 'bg-brand-blue shadow-md text-white' : 'bg-gray-100 dark:bg-gray-light hover:bg-blue-100 dark:hover:bg-brand-blue-light'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{ppeCamera.name}</span>
                </div>
                <div className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Online
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ppeCamera.location}</p>
              <p className={`text-xs mt-2 ${selectedCamera?.id === PPE_CAMERA_ID ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                Live Objects: {liveObjectCount}
              </p>
            </button>
          </div>
        </div>
      </div>
      <div className="lg:col-span-4 bg-light-secondary dark:bg-gray-medium rounded-lg shadow-lg">
        <AlertsPanel alerts={alerts} setAlerts={setAlerts} />
      </div>
    </div>
  );
};
export default Dashboard;