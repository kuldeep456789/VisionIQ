export interface Camera {
  id: number | string; // Allow string for special IDs like 'ppe-detection'
  name: string;
  location: string;
}

export enum AlertSeverity {
  Info = 'Info',
  Warning = 'Warning',
  Critical = 'Critical',
}

export interface Alert {
  id: string;
  timestamp: Date;
  cameraId: number | string;
  cameraName: string;
  message: string;
  type: 'Overcrowding' | 'Intrusion' | 'Loitering' | 'Fall Detected' | 'Aggression';
  severity: AlertSeverity;
}

export interface Zone {
  id: string;
  name: string;
  // Percentage values for positioning
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}

export interface CameraData {
  cameraId: number;
  crowdCount: number;
  density: number; // people per sq meter
  heatmap: HeatmapPoint[];
  zones: Zone[];
  flowDirection: {
    x: number;
    y: number;
  };
  entryCount: number;
  exitCount: number;
}

export interface HistoricalDataPoint {
  date: string;
  crowd_count: number;
  alerts: number;
}

export interface DetectionResult {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  trackId?: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  profilePicture?: string;
}