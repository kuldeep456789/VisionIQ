
import type { Camera, Alert, CameraData, HistoricalDataPoint, Zone, HeatmapPoint } from '../types';
import { AlertSeverity } from '../types';

const MOCK_CAMERAS: Camera[] = [
    { id: 1, name: 'Main Entrance', location: 'Lobby' },
    { id: 2, name: 'Hallway A', location: 'Floor 1' },
    { id: 3, name: 'Parking Lot', location: 'Exterior' },
    { id: 4, name: 'Cafeteria', location: 'Ground Floor' },
];

const MOCK_ZONES: Record<number, Zone[]> = {
    1: [
        { id: 'z1-1', name: 'Restricted Area', x: 70, y: 10, width: 25, height: 40, color: 'rgba(229, 62, 62, 0.4)' },
        { id: 'z1-2', name: 'High Priority', x: 5, y: 50, width: 30, height: 45, color: 'rgba(214, 158, 46, 0.4)' }
    ],
    3: [
        { id: 'z3-1', name: 'No Loitering', x: 10, y: 10, width: 80, height: 20, color: 'rgba(49, 130, 206, 0.4)' }
    ]
};

const ALERT_TYPES: Alert['type'][] = ['Overcrowding', 'Intrusion', 'Loitering', 'Fall Detected', 'Aggression'];

const generateRandomAlert = (): Alert => ({
    id: `alert-${Date.now()}-${Math.random()}`,
    timestamp: new Date(),
    cameraId: MOCK_CAMERAS[Math.floor(Math.random() * MOCK_CAMERAS.length)].id,
    cameraName: MOCK_CAMERAS[Math.floor(Math.random() * MOCK_CAMERAS.length)].name,
    message: `Abnormal activity detected near ${MOCK_CAMERAS[Math.floor(Math.random() * MOCK_CAMERAS.length)].location}.`,
    type: ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)],
    severity: Object.values(AlertSeverity)[Math.floor(Math.random() * 3)],
});

const generateHeatmap = (points: number = 20): HeatmapPoint[] => {
    return Array.from({ length: points }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        intensity: Math.random(),
    }));
};

const mockApi = {
    fetchCameras: async (): Promise<Camera[]> => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_CAMERAS), 500));
    },

    fetchCameraData: async (cameraId: number): Promise<CameraData> => {
        return new Promise(resolve => setTimeout(() => resolve({
            cameraId,
            crowdCount: Math.floor(Math.random() * 150) + 10,
            density: parseFloat((Math.random() * 2).toFixed(2)),
            heatmap: generateHeatmap(),
            zones: MOCK_ZONES[cameraId] || [],
            flowDirection: { x: Math.random() - 0.5, y: Math.random() - 0.5 },
            entryCount: Math.floor(Math.random() * 500),
            exitCount: Math.floor(Math.random() * 500),
        }), 300));
    },

    fetchNewAlert: async (): Promise<Alert | null> => {
        return new Promise(resolve => setTimeout(() => {
            resolve(null);
        }, 1000));
    },

    fetchHistoricalData: async (): Promise<HistoricalDataPoint[]> => {
        const data: HistoricalDataPoint[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                crowd_count: Math.floor(Math.random() * 200) + 50,
                alerts: Math.floor(Math.random() * 15),
            });
        }
        return new Promise(resolve => setTimeout(() => resolve(data), 800));
    }
};

export default mockApi;
