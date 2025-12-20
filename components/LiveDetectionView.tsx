import React, { useRef, useState, useEffect } from 'react';
import { detectObjects } from '../services/detectionService';

interface Detection {
    label: string;
    box: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

const LiveDetectionView: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [detections, setDetections] = useState<Detection[]>([]);
    const [stats, setStats] = useState<{ [key: string]: number }>({});
    const [error, setError] = useState<string | null>(null);
    const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Start camera
    const startCamera = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: 640, height: 480 }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            setError('Failed to access camera. Please allow camera permissions.');
            console.error('Camera error:', err);
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // Capture frame and send to backend
    const captureAndDetect = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        try {
            // Send to backend
            const results = await detectObjects(imageData);
            setDetections(results);

            // Calculate stats
            const counts: { [key: string]: number } = {};
            results.forEach((det: Detection) => {
                counts[det.label] = (counts[det.label] || 0) + 1;
            });
            setStats(counts);

            // Draw detections
            drawDetections(results);
        } catch (err) {
            console.error('Detection error:', err);
            setError('Detection failed. Please check backend connection.');
        }
    };

    // Draw bounding boxes and labels
    const drawDetections = (dets: Detection[]) => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw each detection
        dets.forEach((det) => {
            const x = det.box.x * canvas.width;
            const y = det.box.y * canvas.height;
            const w = det.box.width * canvas.width;
            const h = det.box.height * canvas.height;

            // Draw box
            ctx.strokeStyle = det.label === 'person' ? '#00ff00' : '#ff0000';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);

            // Draw label background
            ctx.fillStyle = det.label === 'person' ? '#00ff00' : '#ff0000';
            const textWidth = ctx.measureText(det.label).width;
            ctx.fillRect(x, y - 25, textWidth + 10, 25);

            // Draw label text
            ctx.fillStyle = '#000000';
            ctx.font = '16px Arial';
            ctx.fillText(det.label, x + 5, y - 7);
        });
    };

    // Start/Stop detection
    const toggleDetection = async () => {
        if (isDetecting) {
            // Stop detection
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
                detectionIntervalRef.current = null;
            }
            stopCamera();
            setIsDetecting(false);
            setDetections([]);
            setStats({});
        } else {
            // Start detection
            await startCamera();
            setIsDetecting(true);

            // Run detection every 500ms
            detectionIntervalRef.current = setInterval(() => {
                captureAndDetect();
            }, 500);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
            stopCamera();
        };
    }, []);

    return (
        <div className="live-detection-container" style={{ padding: '20px' }}>
            <h1>Real-Time Crowd Detection</h1>

            {/* Error message */}
            {error && (
                <div style={{
                    padding: '10px',
                    backgroundColor: '#fee',
                    color: '#c00',
                    borderRadius: '5px',
                    marginBottom: '10px'
                }}>
                    {error}
                </div>
            )}

            {/* Control button */}
            <button
                onClick={toggleDetection}
                style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: isDetecting ? '#dc3545' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginBottom: '20px'
                }}
            >
                {isDetecting ? 'Stop Detection' : 'Start Detection'}
            </button>

            {/* Video and Canvas container */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <video
                    ref={videoRef}
                    style={{
                        width: '640px',
                        height: '480px',
                        backgroundColor: '#000',
                        display: isDetecting ? 'block' : 'none'
                    }}
                />
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '640px',
                        height: '480px',
                        pointerEvents: 'none'
                    }}
                />
            </div>

            {/* Detection Stats */}
            {isDetecting && (
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '5px'
                }}>
                    <h3>Detection Statistics</h3>
                    <div style={{ fontSize: '18px' }}>
                        <strong>Total Detections:</strong> {detections.length}
                    </div>
                    {Object.entries(stats).map(([label, count]) => (
                        <div key={label} style={{ fontSize: '16px', marginTop: '5px' }}>
                            <strong>{label}:</strong> {count}
                        </div>
                    ))}
                    {stats.person && (
                        <div style={{
                            fontSize: '20px',
                            marginTop: '10px',
                            color: '#007bff',
                            fontWeight: 'bold'
                        }}>
                            👥 People Count: {stats.person}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveDetectionView;