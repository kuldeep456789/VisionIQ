import React, { useState, useEffect, useCallback } from 'react';
import mockApi from '../services/api';
import type { Camera, CameraData, Alert } from '../types';
import CameraView from './CameraView';
import AlertsPanel from './AlertsPanel';
import AnalyzerView from './AnalyzerView';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { WifiIcon } from './icons/WifiIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { UserHardHatIcon } from './icons/UserHardHatIcon';
import { BellIcon } from './icons/BellIcon';
import { UsersIcon } from './icons/UsersIcon';

const PPE_CAMERA_ID = 'ppe-detection';
const ppeCamera: Camera = {
  id: PPE_CAMERA_ID,
  name: 'On-Site Analysis',
  location: 'Local Device',
};

const DashboardStatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string; }> = ({ icon, label, value, color }) => (
    <div className="bg-light-secondary dark:bg-gray-medium p-4 rounded-lg shadow-lg flex items-center space-x-4 transition-transform transform hover:-translate-y-1">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
            <div className="text-2xl font-bold text-light-text dark:text-white">{value}</div>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [liveData, setLiveData] = useState<Record<string, CameraData>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const fetchedCameras = await mockApi.fetchCameras();
      setCameras(fetchedCameras);
      if (fetchedCameras.length > 0) {
        setSelectedCamera(fetchedCameras[0]);
      }
      setLoading(false);
    };
    init();
  }, []);

  const fetchLiveData = useCallback(async () => {
    if (cameras.length > 0) {
      const dataPromises = cameras.map(cam => mockApi.fetchCameraData(cam.id as number));
      const newLiveData = await Promise.all(dataPromises);
      setLiveData(prevData => {
        const updatedData = { ...prevData };
        newLiveData.forEach(data => {
            updatedData[data.cameraId] = data;
        });
        return updatedData;
      });
    }
  }, [cameras]);

  const fetchAlerts = useCallback(async () => {
      const newAlert = await mockApi.fetchNewAlert();
      if (newAlert) {
          setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);
      }
  }, []);

  useEffect(() => {
    fetchLiveData();
    const dataInterval = setInterval(fetchLiveData, 3000);
    const alertInterval = setInterval(fetchAlerts, 5000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(alertInterval);
    };
  }, [fetchLiveData, fetchAlerts]);
  
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    // Camera Data
    csvContent += "Live Camera Data\r\n";
    csvContent += "Camera ID,Name,Location,Crowd Count,Density (/m²),Entries,Exits\r\n";
    cameras.forEach(cam => {
      const data = liveData[cam.id as number];
      const row = [
        cam.id,
        cam.name,
        cam.location,
        data?.crowdCount ?? 'N/A',
        data?.density ?? 'N/A',
        data?.entryCount ?? 'N/A',
        data?.exitCount ?? 'N/A',
      ].join(',');
      csvContent += row + "\r\n";
    });

    csvContent += "\r\n"; // Spacer

    // Alerts Data
    csvContent += "Live Alerts\r\n";
    csvContent += "Alert ID,Timestamp,Camera ID,Camera Name,Type,Severity,Message\r\n";
    alerts.forEach(alert => {
      // Sanitize message to avoid breaking CSV format
      const message = `"${alert.message.replace(/"/g, '""')}"`;
      const row = [
        alert.id,
        alert.timestamp.toISOString(),
        alert.cameraId,
        alert.cameraName,
        alert.type,
        alert.severity,
        message,
      ].join(',');
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `visioniq_live_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="text-center p-10">Loading cameras...</div>;
  }
  
  const renderMainView = () => {
    if (!selectedCamera) {
      return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Select a camera to view feed.</div>;
    }

    if (selectedCamera.id === PPE_CAMERA_ID) {
      return <AnalyzerView camera={ppeCamera} />;
    }

    const data = liveData[selectedCamera.id as number];
    if (data) {
       return <CameraView camera={selectedCamera} data={data} />;
    }

    return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Loading camera data...</div>;
  }

  // FIX: Explicitly type `sum` to resolve incorrect type inference of `unknown`.
  const totalPeople = Object.values(liveData).reduce((sum: number, data: CameraData) => sum + (data.crowdCount || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Main Content: Camera View and Camera List */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* At-a-glance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardStatCard icon={<VideoCameraIcon className="w-6 h-6 text-white"/>} label="Total Cameras" value={cameras.length + 1} color="bg-blue-500" />
            <DashboardStatCard icon={<BellIcon className="w-6 h-6 text-white"/>} label="Active Alerts" value={alerts.length} color="bg-accent-red" />
            <DashboardStatCard icon={<UsersIcon className="w-6 h-6 text-white"/>} label="Total People Monitored" value={totalPeople} color="bg-accent-yellow" />
        </div>

        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Live Dashboard</h2>
            <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-brand-blue-light hover:bg-brand-blue text-white rounded-md transition-colors"
            >
                <ArrowDownTrayIcon className="w-5 h-5"/>
                Export CSV
            </button>
        </div>

        {/* Camera View */}
        <div className="bg-light-secondary dark:bg-gray-medium rounded-lg shadow-lg overflow-hidden flex-grow">
          {renderMainView()}
        </div>
        
        {/* Camera List */}
        <div className="bg-light-secondary dark:bg-gray-medium rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-bold mb-3 border-b border-light-border dark:border-gray-light pb-2">Camera Feeds</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* PPE Detection Camera */}
                <button 
                    onClick={() => setSelectedCamera(ppeCamera)}
                    className={`p-3 rounded-lg text-left transition-all duration-200 ${selectedCamera?.id === PPE_CAMERA_ID ? 'bg-brand-blue shadow-md text-white' : 'bg-gray-100 dark:bg-gray-light hover:bg-blue-100 dark:hover:bg-brand-blue-light'}`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserHardHatIcon className="w-5 h-5 text-yellow-400"/>
                            <span className="font-semibold">{ppeCamera.name}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ppeCamera.location}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                        Live, Image & Video Analysis
                    </p>
                </button>
                
                {/* Remote Cameras */}
                {cameras.map(cam => {
                    const isOnline = !!liveData[cam.id as number];
                    return (
                        <button 
                            key={cam.id} 
                            onClick={() => setSelectedCamera(cam)}
                            className={`p-3 rounded-lg text-left transition-all duration-200 ${selectedCamera?.id === cam.id ? 'bg-brand-blue shadow-md text-white' : 'bg-gray-100 dark:bg-gray-light hover:bg-blue-100 dark:hover:bg-brand-blue-light'}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <VideoCameraIcon className="w-5 h-5"/>
                                    <span className="font-semibold">{cam.name}</span>
                                </div>
                                {/* FIX: Replaced the `title` prop with a nested `<title>` element to fix a TypeScript error and improve accessibility. */}
                                <WifiIcon 
                                    className={`w-5 h-5 ${isOnline ? 'text-accent-green animate-pulse-fast' : 'text-accent-red'}`}
                                >
                                    <title>{`Status: ${isOnline ? 'Online' : 'Offline'}`}</title>
                                </WifiIcon>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{cam.location}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                                Crowd: {liveData[cam.id as number]?.crowdCount ?? '...'}
                            </p>
                        </button>
                    )
                })}
            </div>
        </div>
      </div>
      
      {/* Side Panel: Alerts */}
      <div className="lg:col-span-4 bg-light-secondary dark:bg-gray-medium rounded-lg shadow-lg">
        <AlertsPanel alerts={alerts} setAlerts={setAlerts}/>
      </div>
    </div>
  );
};

export default Dashboard;