import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Camera, CameraData } from '../types';


interface CameraViewProps {
  camera: Camera;
  data: CameraData;
}

const CameraView: React.FC<CameraViewProps> = ({ camera, data }) => {
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof DOMException) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        return 'Camera access denied. To fix this, please allow camera permission in your browser settings. You can usually find this by clicking the camera icon in your address bar.';
      }
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        return 'No camera found on this device.';
      }
      if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        return 'The camera is already in use by another application.';
      }
    }
    return 'Could not access the camera. Please check permissions and try again.';
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (isCameraActive || isStarting) return;
    stopCamera();
    setError(null);
    setIsStarting(true);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError(getErrorMessage(err));
        setIsCameraActive(false);
      } finally {
        setIsStarting(false);
      }
    } else {
      setError("Your browser does not support camera access.");
      setIsStarting(false);
    }
  }, [stopCamera, isStarting]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [camera.id, stopCamera]);


  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-light-border dark:border-gray-light flex justify-between items-center">
        <h2 className="text-xl font-bold">{camera.name} - {camera.location}</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-brand-blue-light hover:bg-brand-blue text-white rounded-md transition-colors"
          >

            {privacyMode ? 'Disable' : 'Enable'} Privacy
          </button>
          <button
            onClick={isCameraActive ? stopCamera : startCamera}
            disabled={isStarting}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait ${isCameraActive
              ? 'bg-accent-red hover:bg-red-600'
              : 'bg-accent-green hover:bg-green-600'
              }`}
          >
            {isCameraActive ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
              </svg>
            )}
            {isStarting ? 'Starting...' : (isCameraActive ? 'Stop Camera' : 'Start Camera')}
          </button>
        </div>
      </div>

      <div className="flex-grow bg-black relative overflow-hidden flex items-center justify-center">
        {isStarting ? (
          <div className="text-center text-white flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-gray-500 mb-4 animate-pulse-fast">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
            </svg>
            <h3 className="text-xl font-bold">Initializing Camera...</h3>
          </div>
        ) : error ? (
          <div className="text-center p-4">
            <div className="flex flex-col items-center justify-center text-red-400">

              <h3 className="text-xl font-bold">Camera Error</h3>
              <p className="max-w-md">{error}</p>
              <button
                onClick={startCamera}
                disabled={isStarting}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-blue-light hover:bg-brand-blue rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {isStarting ? 'Starting...' : 'Try Again'}
              </button>
            </div>
          </div>
        ) : isCameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-all duration-500 ${privacyMode ? 'blur-lg' : ''}`}
            />

          </>
        ) : (
          <div className="text-center p-4 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-gray-500 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">Camera is Off</h3>
            <p className="text-gray-400">Click "Start Camera" in the header to begin the feed.</p>
          </div>
        )}
      </div>


    </div>
  );
};

export default CameraView;