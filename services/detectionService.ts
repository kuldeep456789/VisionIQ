// services/detectionService.ts

// Use environment variable or fallback to localhost
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:5000';

export interface Detection {
  label: string;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence?: number;
}

export interface HealthStatus {
  status: string;
  model: string;
}

/**
 * Sends image data to the local Python backend to detect objects.
 * @param base64ImageData - The base64-encoded image string (without the data URI prefix).
 * @returns A promise that resolves to an array of detected objects.
 */
export async function detectObjects(base64ImageData: string): Promise<Detection[]> {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/detect`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ image: base64ImageData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to detect objects');
    }

    const detections: Detection[] = await response.json();
    return detections;
  } catch (error) {
    console.error('Error calling detection backend:', error);
    throw error;
  }
}

/**
 * Check if backend server is healthy and model is loaded
 * @returns Health status information
 */
export async function checkHealth(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Health check failed with status: ${response.status}`);
    }

    const health: HealthStatus = await response.json();
    return health;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
}

export default {
  detectObjects,
  checkHealth,
};