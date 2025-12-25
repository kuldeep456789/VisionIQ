import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Camera, DetectionResult } from '../types';
import { detectObjects } from '../services/detectionService';
import { addToHistory } from '../services/historyService';
import liveDtImage from './Pages/image/liveDt.jpg';
import imageAnaImage from './Pages/image/imageAna.png';
import videoAImage from './Pages/image/videoA.png';

// Helper to generate a consistent color from a string label
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
}

interface AnalyzerViewProps {
    camera: Camera;
    onStatsUpdate?: (count: number) => void;
}

type AnalysisMode = 'selection' | 'live' | 'image' | 'video';

const SelectionCard: React.FC<{ title: string; description: string; imageUrl: string; onClick: () => void; }> = ({ title, description, imageUrl, onClick }) => (
    <div
        onClick={onClick}
        className="group relative flex flex-col items-center justify-end p-6 bg-light-secondary dark:bg-gray-medium rounded-lg shadow-lg transition-all transform hover:scale-105 cursor-pointer h-64 overflow-hidden"
    >
        <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>

        <div className="relative text-white text-center z-10 transform transition-transform duration-300 group-hover:-translate-y-2">
            <h3 className="text-xl font-bold mb-2 shadow-sm">{title}</h3>
            <p className="text-sm text-gray-200 font-medium">{description}</p>
        </div>
    </div>
);



const AnalyzerView: React.FC<AnalyzerViewProps> = ({ camera, onStatsUpdate }) => {
    const [mode, setMode] = useState<AnalysisMode>('selection');

    // States for Live Detection
    const liveVideoRef = useRef<HTMLVideoElement>(null);
    const liveCanvasRef = useRef<HTMLCanvasElement>(null);
    const [liveError, setLiveError] = useState<string | null>(null);
    const [liveAnalysisError, setLiveAnalysisError] = useState<string | null>(null);
    const [liveDetections, setLiveDetections] = useState<DetectionResult[]>([]);
    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const [isLiveStarting, setIsLiveStarting] = useState<boolean>(false);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [graphData, setGraphData] = useState<any[]>([]);
    const liveAnalysisLoopRef = useRef<number | undefined>(undefined);
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
    const streamRef = useRef<MediaStream | null>(null); // Ref to hold stream for cleanup without triggering re-renders

    // States for Uploader
    const [image, setImage] = useState<string | null>(null);
    const [video, setVideo] = useState<string | null>(null);
    const [imageDetections, setImageDetections] = useState<DetectionResult[]>([]);
    const [videoDetections, setVideoDetections] = useState<DetectionResult[]>([]);
    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
    const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [videoError, setVideoError] = useState<string | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const uploadedVideoRef = useRef<HTMLVideoElement>(null);
    const imageCanvasRef = useRef<HTMLCanvasElement>(null);
    const videoCanvasRef = useRef<HTMLCanvasElement>(null);
    const videoAnalysisLoopRef = useRef<number | undefined>(undefined);
    const lastDetectionsRef = useRef<DetectionResult[]>([]);
    const nextTrackIdRef = useRef<number>(1);

    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === "class") {
                    setIsDarkMode((mutation.target as HTMLElement).classList.contains('dark'));
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    const saveToHistory = (type: 'live' | 'image' | 'video', detections: DetectionResult[]) => {
        const objectCounts = detections.reduce((acc, det) => {
            acc[det.label] = (acc[det.label] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        addToHistory({
            type,
            description: `${type.charAt(0).toUpperCase() + type.slice(1)} analysis with ${detections.length} objects.`,
            objectCount: detections.length,
            details: objectCounts
        });
    };

    // --- Generic Drawing Logic ---
    const drawDetections = useCallback((
        ctx: CanvasRenderingContext2D,
        detections: DetectionResult[],
        width: number,
        height: number
    ) => {
        ctx.clearRect(0, 0, width, height);
        detections.forEach(det => {
            const color = stringToColor(det.label);
            const label = det.trackId ? `${det.label} #${det.trackId}` : det.label;

            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(det.x, det.y, det.width, det.height);

            ctx.font = 'bold 14px sans-serif';
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = color;
            ctx.fillRect(det.x, det.y, textWidth + 10, 20);
            ctx.fillStyle = 'white';
            ctx.fillText(label, det.x + 5, det.y + 15);
        });
    }, []);

    // --- Live Detection Logic ---
    const stopLiveAnalysis = useCallback(() => {
        setIsAnalyzing(false);
        if (liveAnalysisLoopRef.current) clearTimeout(liveAnalysisLoopRef.current);

        // Stop tracks on the stored activeStream using REF
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setActiveStream(null);

        if (liveVideoRef.current) {
            liveVideoRef.current.srcObject = null;
        }

        setIsCameraActive(false);
        setIsPaused(false);
    }, []); // Empty dependency array makes this stable!

    const analyzeLiveFrame = useCallback(async () => {
        const video = liveVideoRef.current;
        if (!video || video.paused || video.ended || video.videoWidth === 0) {
            return;
        }

        try {
            const frameCanvas = document.createElement('canvas');
            frameCanvas.width = video.videoWidth;
            frameCanvas.height = video.videoHeight;
            const ctx = frameCanvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);
            const base64ImageData = frameCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];

            console.log("Calling detectObjects...");
            const rawDetections = await detectObjects(base64ImageData);
            console.log("Received rawDetections:", rawDetections);

            const scaledDetections: DetectionResult[] = (rawDetections || []).map((det: any, index: number) => ({
                id: Date.now() + index,
                label: det.label,
                x: det.box.x * video.videoWidth,
                y: det.box.y * video.videoHeight,
                width: det.box.width * video.videoWidth,
                height: det.box.height * video.videoHeight,
            }));

            console.log("Scaled detections:", scaledDetections);
            setLiveDetections(scaledDetections);
            if (onStatsUpdate) {
                onStatsUpdate(scaledDetections.length);
            }
            setLiveAnalysisError(null);

            setGraphData(prevData => {
                const newDataPoint = {
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    'Total Objects': scaledDetections.length,
                };
                const updatedData = [...prevData, newDataPoint];
                return updatedData.length > 30 ? updatedData.slice(1) : updatedData;
            });
        } catch (err) {
            console.error("Analysis failed:", err);
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            setLiveAnalysisError(message);
        } finally {
            if (isAnalyzing && liveVideoRef.current && !liveVideoRef.current.paused) {
                // console.log("Scheduling next frame analysis...");
                liveAnalysisLoopRef.current = window.setTimeout(analyzeLiveFrame, 1000); // Reduced delay for smoother testing
            }
        }
    }, [isAnalyzing]);



    const startLiveCamera = useCallback(async () => {
        if (isLiveStarting) return;

        setLiveError(null);
        setLiveAnalysisError(null);
        setLiveDetections([]);
        setGraphData([]);

        // Cleanup existing stream if any
        if (activeStream) {
            activeStream.getTracks().forEach(track => track.stop());
            setActiveStream(null);
        }

        setIsLiveStarting(true);
        try {
            console.log("Requesting camera access...");
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 1280,
                    height: 720,
                    facingMode: facingMode
                }
            });
            console.log("Camera access granted.");

            // Store stream and activate camera UI (which renders the video element)
            streamRef.current = stream; // Store in ref for cleanup
            setActiveStream(stream);
            setIsCameraActive(true);
            setIsPaused(false);

        } catch (err) {
            console.error("Camera start error:", err);
            let message = 'Could not access camera. Please check permissions and try again.';
            if (err instanceof DOMException) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    message = 'Camera access denied. To fix this, please allow camera permission in your browser settings. You can usually find this by clicking the camera icon in your address bar.';
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    message = 'No camera found on this device.';
                } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    message = 'The camera is already in use by another application. Please close other apps or tabs using the camera.';
                }
            }
            setLiveError(message);
            setIsCameraActive(false);
        } finally {
            setIsLiveStarting(false);
        }
    }, [facingMode, isLiveStarting, activeStream]);

    // Effect to attach stream to video element once it's rendered
    useEffect(() => {
        let isMounted = true;
        if (isCameraActive && activeStream && liveVideoRef.current) {
            const video = liveVideoRef.current;
            console.log("Setting video srcObject...");
            video.srcObject = activeStream;
            video.play().then(() => {
                if (isMounted) {
                    console.log("Video playing...");
                    setIsAnalyzing(true);
                }
            }).catch(e => {
                // Ignore AbortError which happens if the component unmounts or stream changes
                if (isMounted && e.name !== 'AbortError') {
                    console.error("Video play error:", e);
                }
            });
        }
        return () => {
            isMounted = false;
        };
    }, [isCameraActive, activeStream]);

    // Trigger analysis when isAnalyzing becomes true
    useEffect(() => {
        if (isAnalyzing) {
            if (liveAnalysisLoopRef.current) clearTimeout(liveAnalysisLoopRef.current);
            analyzeLiveFrame();
        }
    }, [isAnalyzing, analyzeLiveFrame]);

    const handlePauseResumeToggle = () => {
        const video = liveVideoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPaused(false);
            if (isAnalyzing) {
                if (liveAnalysisLoopRef.current) clearTimeout(liveAnalysisLoopRef.current);
                analyzeLiveFrame();
            }
        } else {
            video.pause();
            setIsPaused(true);
            if (liveAnalysisLoopRef.current) clearTimeout(liveAnalysisLoopRef.current);
        }
    };

    const handleFlipCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    useEffect(() => {
        // If the camera is active when the facing mode changes, restart the camera
        // to apply the new setting.
        if (isCameraActive) {
            startLiveCamera();
        }
        // We only want this to run when facingMode changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facingMode]);

    useEffect(() => {
        if (isCameraActive && liveCanvasRef.current && liveVideoRef.current) {
            const canvas = liveCanvasRef.current;
            const video = liveVideoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) drawDetections(ctx, liveDetections, video.videoWidth, video.videoHeight);
        }
    }, [liveDetections, isCameraActive, drawDetections]);

    // --- Uploader Logic ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (type === 'image') {
                    setImage(event.target?.result as string);
                    setImageDetections([]);
                    setImageError(null);
                } else {
                    setVideo(event.target?.result as string);
                    setVideoDetections([]);
                    setVideoError(null);
                    if (isAnalyzingVideo) stopVideoAnalysis();
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async () => {
        if (!imageRef.current) return;
        setIsAnalyzingImage(true);
        setImageError(null);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = imageRef.current.naturalWidth;
            canvas.height = imageRef.current.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not get canvas context.");
            ctx.drawImage(imageRef.current, 0, 0);
            const base64ImageData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            const rawDetections = await detectObjects(base64ImageData);

            const scaledDetections = rawDetections.map((det: any, index: number) => ({
                id: Date.now() + index,
                label: det.label,
                x: det.box.x * imageRef.current!.naturalWidth,
                y: det.box.y * imageRef.current!.naturalHeight,
                width: det.box.width * imageRef.current!.naturalWidth,
                height: det.box.height * imageRef.current!.naturalHeight,
            }));

            if (scaledDetections.length === 0) {
                setImageError("No objects were detected in the image.");
            }
            if (scaledDetections.length === 0) {
                setImageError("No objects were detected in the image.");
            }
            setImageDetections(scaledDetections);
            // Auto-save image analysis
            saveToHistory('image', scaledDetections);

        } catch (error) {
            setImageError(error instanceof Error ? error.message : "An error occurred.");
        } finally {
            setIsAnalyzingImage(false);
        }
    };

    const stopVideoAnalysis = useCallback(() => {
        if (uploadedVideoRef.current) uploadedVideoRef.current.pause();
        if (videoAnalysisLoopRef.current) clearTimeout(videoAnalysisLoopRef.current);
        setIsAnalyzingVideo(false);
    }, []);

    const updateTrackedObjects = useCallback((newDets: DetectionResult[], lastDets: DetectionResult[], w: number, h: number): DetectionResult[] => {
        const MAX_DISTANCE = Math.sqrt(w * w + h * h) * 0.15;
        const getCenter = (det: DetectionResult) => ({ cx: det.x + det.width / 2, cy: det.y + det.height / 2 });
        const distance = (d1: DetectionResult, d2: DetectionResult) => Math.hypot(getCenter(d1).cx - getCenter(d2).cx, getCenter(d1).cy - getCenter(d2).cy);

        const unmatched = [...lastDets];
        const withIds: DetectionResult[] = [];

        newDets.forEach((newDet) => {
            let bestMatch: { index: number; dist: number } | null = null;
            unmatched.forEach((lastDet, index) => {
                if (lastDet.trackId && newDet.label === lastDet.label) {
                    const dist = distance(newDet, lastDet);
                    if (dist < MAX_DISTANCE && (!bestMatch || dist < bestMatch.dist)) {
                        bestMatch = { index, dist };
                    }
                }
            });

            if (bestMatch) {
                const matchedDet = unmatched[bestMatch.index];
                withIds.push({ ...newDet, trackId: matchedDet.trackId });
                unmatched.splice(bestMatch.index, 1);
            } else {
                withIds.push({ ...newDet, trackId: nextTrackIdRef.current++ });
            }
        });
        return withIds;
    }, []);

    const analyzeVideoFrame = useCallback(async () => {
        const video = uploadedVideoRef.current;
        if (!video || video.paused || video.ended) {
            stopVideoAnalysis();
            return;
        }
        try {
            const frameCanvas = document.createElement('canvas');
            frameCanvas.width = video.videoWidth;
            frameCanvas.height = video.videoHeight;
            const ctx = frameCanvas.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);
            const base64 = frameCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            const rawDetections = await detectObjects(base64);
            const scaled = (rawDetections || []).map((d: any, i: number) => ({
                id: Date.now() + i, label: d.label,
                x: d.box.x * video.videoWidth, y: d.box.y * video.videoHeight,
                width: d.box.width * video.videoWidth, height: d.box.height * video.videoHeight
            }));

            const tracked = updateTrackedObjects(scaled, lastDetectionsRef.current, video.videoWidth, video.videoHeight);
            lastDetectionsRef.current = tracked;
            setVideoDetections(tracked);
            videoAnalysisLoopRef.current = window.setTimeout(analyzeVideoFrame, 5000);
        } catch (err) {
            setVideoError(err instanceof Error ? err.message : "An error occurred.");
            stopVideoAnalysis();
        }
    }, [stopVideoAnalysis, updateTrackedObjects]);

    const handleVideoAnalysisToggle = () => {
        if (isAnalyzingVideo) {
            stopVideoAnalysis();
        } else {
            const video = uploadedVideoRef.current;
            if (!video) return;
            video.play();
            setIsAnalyzingVideo(true);
            setVideoError(null);
            lastDetectionsRef.current = [];
            nextTrackIdRef.current = 1;
            if (videoAnalysisLoopRef.current) clearTimeout(videoAnalysisLoopRef.current);
            analyzeVideoFrame();
        }
    };

    useEffect(() => {
        if (imageDetections.length > 0 && imageCanvasRef.current && imageRef.current) {
            const canvas = imageCanvasRef.current;
            const imageEl = imageRef.current;
            const setupCanvas = () => {
                canvas.width = imageEl.naturalWidth;
                canvas.height = imageEl.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) drawDetections(ctx, imageDetections, canvas.width, canvas.height);
            };
            if (imageEl.complete) setupCanvas();
            else imageEl.onload = setupCanvas;
        }
    }, [imageDetections, drawDetections]);

    useEffect(() => {
        const video = uploadedVideoRef.current;
        const canvas = videoCanvasRef.current;
        if (video && canvas && videoDetections) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) drawDetections(ctx, videoDetections, video.videoWidth, video.videoHeight);
        }
    }, [videoDetections, drawDetections]);

    // --- Component Lifecycle & Cleanup ---
    const handleModeChange = (newMode: AnalysisMode) => {
        // Stop any active analysis before switching
        stopLiveAnalysis();
        stopVideoAnalysis();
        setMode(newMode);
    };

    useEffect(() => {
        return () => {
            stopLiveAnalysis();
            stopVideoAnalysis();
        };
    }, [stopLiveAnalysis, stopVideoAnalysis]);


    // --- Render Logic ---
    const renderHeader = (title: string) => (
        <div className="p-4 border-b border-light-border dark:border-gray-light flex items-center gap-4">
            <button onClick={() => handleModeChange('selection')} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-light">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
            </button>
            <h3 className="text-xl font-bold">{title}</h3>
        </div>
    );

    const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
        <div className="bg-gray-100 dark:bg-gray-dark p-3 rounded-lg flex items-center space-x-3">
            <div className={`p-2 rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
                <div className="text-xl font-bold">{value}</div>
            </div>
        </div>
    );

    const renderObjectStats = (detections: DetectionResult[], isAnalyzing: boolean) => {
        const objectCounts = detections.reduce((acc, det) => {
            acc[det.label] = (acc[det.label] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return (
            <div className="flex flex-col gap-3">
                <h3 className="text-lg font-bold border-b border-light-border dark:border-gray-light pb-2">Analysis Results</h3>
                <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>} label="Total Objects Detected" value={detections.length} color="bg-blue-500" />
                <div className="text-sm mt-2 space-y-1 overflow-y-auto pr-2 max-h-48">
                    {Object.entries(objectCounts).length > 0 ? (
                        Object.entries(objectCounts).map(([label, count]) => (
                            <div key={label} className="flex justify-between items-center bg-gray-100 dark:bg-gray-dark p-1.5 rounded">
                                <span className="font-medium capitalize flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stringToColor(label) }}></span>
                                    {label}
                                </span>
                                <span className="font-bold bg-gray-200 dark:bg-gray-light px-2 rounded">{count}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 dark:text-gray-500 text-center pt-4">{isAnalyzing ? 'Searching...' : 'No objects detected.'}</p>
                    )}
                </div>
            </div>
        );
    };

    if (mode === 'selection') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-blue-500 mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg> */}
                <h2 className="text-2xl font-bold mb-2">{camera.name}</h2>
                {/* <p className="text-gray-500 dark:text-gray-400 mb-8">Perform real-time analysis or analyze media files for object detection.</p> */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    <SelectionCard
                        title="Live Object Detection"
                        description="Real-time analysis using your device camera."
                        imageUrl={liveDtImage}
                        onClick={() => handleModeChange('live')}
                    />
                    <SelectionCard
                        title="Analyze Image"
                        description="Upload and scan static images."
                        imageUrl={imageAnaImage}
                        onClick={() => handleModeChange('image')}
                    />
                    <SelectionCard
                        title="Analyze Video"
                        description="Process video files for frame-by-frame detection."
                        imageUrl={videoAImage}
                        onClick={() => handleModeChange('video')}
                    />
                </div>
            </div>
        );
    }

    if (mode === 'live') {
        const axisStrokeColor = isDarkMode ? '#a0aec0' : '#4a5568';
        const gridStrokeColor = isDarkMode ? '#4a5568' : '#e2e8f0';
        const tooltipContentStyle = { backgroundColor: isDarkMode ? '#2d3748' : '#ffffff', border: `1px solid ${gridStrokeColor}`, borderRadius: '0.5rem' };

        return (
            <div className="h-full flex flex-col">
                {renderHeader("Live Object Detection")}
                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    <div className="flex-grow flex flex-col bg-black relative overflow-hidden items-center justify-center">

                        {/* Live Detection Overlay */}
                        {isCameraActive && (
                            <div className="absolute top-4 left-4 z-20 bg-black/50 p-2 rounded text-white text-xs">
                                {isAnalyzing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span>Analyzing...</span>
                                    </div>
                                ) : (
                                    <span>Camera Active</span>
                                )}
                                {liveAnalysisError && (
                                    <div className="mt-1 text-red-400 font-bold bg-black/80 p-1 rounded">
                                        Error: {liveAnalysisError}
                                    </div>
                                )}
                            </div>
                        )}

                        {!isCameraActive ? (
                            <div className="text-center p-4">
                                {liveError ? (
                                    <div className="flex flex-col items-center justify-center text-red-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <h3 className="text-xl font-bold">Camera Error</h3>
                                        <p className="max-w-md">{liveError}</p>
                                        <button
                                            onClick={startLiveCamera}
                                            disabled={isLiveStarting}
                                            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-blue-light hover:bg-brand-blue rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {isLiveStarting ? 'Starting...' : 'Try Again'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-gray-500 mb-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
                                        </svg>
                                        <h3 className="text-xl font-bold text-white mb-2">Live Object Detection</h3>
                                        <p className="text-gray-400 mb-6">Start your camera to begin real-time analysis.</p>
                                        <button
                                            onClick={startLiveCamera}
                                            disabled={isLiveStarting}
                                            className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-accent-green hover:bg-green-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
                                            </svg>
                                            {isLiveStarting ? 'Starting...' : 'Start Camera'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <video ref={liveVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                <canvas ref={liveCanvasRef} className="absolute top-0 left-0 w-full h-full" />

                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 p-3 rounded-xl backdrop-blur-sm">
                                    <button
                                        onClick={handlePauseResumeToggle}
                                        className="text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                                        title={isPaused ? "Resume" : "Pause"}
                                    >
                                        {isPaused ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                            </svg>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleFlipCamera}
                                        className="text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                                        title="Flip Camera"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={stopLiveAnalysis}
                                        className="text-white p-2 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors"
                                        title="Stop Camera"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={stopLiveAnalysis}
                                        className="text-white p-2 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors"
                                        title="Stop Camera"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => {
                                            saveToHistory('live', liveDetections);
                                            alert("Snapshot saved to History!");
                                        }}
                                        className="text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                                        title="Save Snapshot"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        )}

                        {/* DEBUG OVERLAY - ALWAYS VISIBLE IN LIVE MODE */}
                        <div className="absolute top-16 left-4 bg-black/70 text-green-400 text-xs p-2 rounded font-mono pointer-events-none z-50">
                            <p>Status: {isAnalyzing ? 'Analyzing' : 'Standby'}</p>
                            <p>Cam Active: {String(isCameraActive)}</p>
                            <p>Starting: {String(isLiveStarting)}</p>
                            <p>Error: {liveError || 'None'}</p>
                            <p>Stream: {activeStream ? 'Active' : 'Null'}</p>
                            <p>Video Ref: {liveVideoRef.current ? 'Found' : 'Null'}</p>
                            <p>Video Size: {liveVideoRef.current?.videoWidth}x{liveVideoRef.current?.videoHeight}</p>
                            <p>ReadyState: {liveVideoRef.current?.readyState}</p>
                        </div>
                    </div>
                    <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-t md:border-t-0 md:border-l border-light-border dark:border-gray-light p-4 flex flex-col h-full overflow-hidden">
                        {renderObjectStats(liveDetections, isAnalyzing)}
                        <div className="flex-grow flex flex-col min-h-0 mt-4">
                            <h4 className="text-md font-semibold mb-2">Detection Trend</h4>
                            {isCameraActive && graphData.length > 1 ? (
                                <div className="flex-grow min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={graphData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                                            <XAxis dataKey="time" stroke={axisStrokeColor} fontSize={10} tick={{ fill: axisStrokeColor }} />
                                            <YAxis allowDecimals={false} stroke={axisStrokeColor} fontSize={10} tick={{ fill: axisStrokeColor }} />
                                            <Tooltip contentStyle={tooltipContentStyle} wrapperStyle={{ fontSize: '12px' }} />
                                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                                            <Line type="monotone" dataKey="Total Objects" stroke="#38b2ac" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex-grow flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-dark rounded-md"><p>{isCameraActive ? 'Collecting data...' : 'Start camera to see trend'}</p></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'image' || mode === 'video') {
        const isImageMode = mode === 'image';
        const currentIsAnalyzing = isImageMode ? isAnalyzingImage : isAnalyzingVideo;

        return (
            <div className="h-full flex flex-col">
                {renderHeader(isImageMode ? "Image Object Analysis" : "Video Object Analysis")}
                <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-light rounded-lg p-6 text-center relative">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Drag & drop or click to select a new {isImageMode ? 'image' : 'video'}</p>
                        <input type="file" accept={isImageMode ? "image/*" : "video/*"} onChange={(e) => handleFileChange(e, mode)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                    </div>

                    {(isImageMode ? image : video) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <div className="relative border rounded-lg overflow-hidden bg-gray-900 flex justify-center items-center">
                                    {isImageMode ? (
                                        <>
                                            <img ref={imageRef} src={image!} alt="Upload preview" className={`max-w-full max-h-[400px] object-contain transition-opacity ${isAnalyzingImage ? 'opacity-30' : ''}`} />
                                            <canvas ref={imageCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none"></canvas>
                                            {isAnalyzingImage && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 animate-spin mb-2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                    </svg>
                                                    <p className="font-semibold">Analyzing...</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <video ref={uploadedVideoRef} src={video!} controls className="max-w-full max-h-[400px] mx-auto" onEnded={stopVideoAnalysis} />
                                            <canvas ref={videoCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none"></canvas>
                                            {isAnalyzingVideo && <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">ANALYZING...</div>}
                                            <button
                                                onClick={() => {
                                                    saveToHistory('video', videoDetections);
                                                    alert("Video analysis saved to History!");
                                                }}
                                                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                                                title="Save Analysis"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex-grow space-y-4">
                                    {(isImageMode ? imageError : videoError) && (
                                        <div className="bg-red-500/10 text-red-500 dark:text-red-400 p-3 rounded-md text-sm font-medium">
                                            <strong>Analysis Failed:</strong> {isImageMode ? imageError : videoError}
                                        </div>
                                    )}
                                    {renderObjectStats(isImageMode ? imageDetections : videoDetections, currentIsAnalyzing)}
                                </div>
                                <button
                                    onClick={isImageMode ? analyzeImage : handleVideoAnalysisToggle}
                                    disabled={isImageMode ? isAnalyzingImage : false}
                                    className="w-full bg-brand-blue hover:bg-brand-blue-light text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isImageMode ? (isAnalyzingImage ? 'Analyzing...' : 'Analyze Image') : (isAnalyzingVideo ? 'Stop Analysis' : 'Analyze Video')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default AnalyzerView;