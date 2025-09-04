import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface CameraCaptureHandle {
  stopCamera: () => void;
}

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
}

const CameraCapture = forwardRef<CameraCaptureHandle, CameraCaptureProps>(({ onCapture }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cleanup function to properly stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  };

  // Expose stopCamera to parent component
  useImperativeHandle(ref, () => ({
    stopCamera
  }));

  // Initialize camera on mount
  useEffect(() => {
    let isActive = true;
    
    const initCamera = async () => {
      setError(null);
      try {
        // Prioritize back camera for better bottle/label recognition
        const constraints = { 
          video: { 
            facingMode: 'environment', // Back camera for product scanning
            width: { ideal: 1280, max: 1920 }, // Higher resolution for better text recognition
            height: { ideal: 720, max: 1080 }
          } 
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (isActive && videoRef.current) {
          streamRef.current = stream;
          videoRef.current.srcObject = stream;
          
          // Wait for video to load
          videoRef.current.onloadedmetadata = () => {
            if (isActive) {
              setCameraReady(true);
            }
          };
        } else if (!isActive) {
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        if (isActive) {
          console.error('Camera initialization failed:', err);
          setError('Camera access required for alcohol recognition. Please allow camera permissions.');
        }
      }
    };

    initCamera();

    return () => {
      isActive = false;
      stopCamera();
    };
  }, []);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) {
      setError('Camera not ready. Please wait...');
      return;
    }

    setIsCapturing(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Use high resolution for better text/label recognition
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not access canvas');
      }

      // Capture the frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to high-quality JPEG for AI analysis
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      
      // Stop camera after capture (one-time use)
      stopCamera();
      
      // Send image to parent for AI processing
      onCapture(imageData);
      
    } catch (err) {
      console.error('Photo capture failed:', err);
      setError('Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCancel = () => {
    stopCamera();
    // No need to call onCapture for cancellation, just close
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      fontFamily: 'inherit',
      minHeight: 0,
    }}>
        {/* Camera preview - fills container */}
        <div style={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#000'
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              backgroundColor: '#000'
            }}
          />
          
          {/* Scanning guide overlay */}
          {cameraReady && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '280px',
              border: '2px solid #00ff00',
              borderRadius: '8px',
              pointerEvents: 'none'
            }}>
              <div style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#00ff00',
                fontSize: '14px',
                fontWeight: 'bold',
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: '4px 8px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                Position bottle here
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {!cameraReady && !error && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              gap: '10px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #333',
                borderTop: '3px solid #00ff00',
                borderRadius: '50%',
                animation: 'cameraSpin 1s linear infinite'
              }} />
              <div style={{ fontSize: '16px' }}>Initializing camera...</div>
            </div>
          )}
        </div>

        {/* Instructions - simplified */}
        {cameraReady && !error && (
          <div style={{ 
            color: '#ccc', 
            fontSize: '12px',
            textAlign: 'center',
            padding: '5px 0'
          }}>
            📸 Point camera at bottle label for best recognition
          </div>
        )}

        {/* Action buttons - simplified layout */}
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          justifyContent: 'center'
        }}>
          <button 
            type="button" 
            onClick={capturePhoto}
            disabled={!cameraReady || isCapturing}
            style={{
              padding: '10px 16px',
              backgroundColor: cameraReady && !isCapturing ? '#00ff00' : '#555',
              color: cameraReady && !isCapturing ? '#000' : '#ccc',
              border: 'none',
              borderRadius: '20px',
              cursor: cameraReady && !isCapturing ? 'pointer' : 'not-allowed',
              fontSize: '12px',
              fontWeight: 'bold',
              minWidth: '120px',
              transition: 'all 0.2s'
            }}
          >
            {isCapturing ? '📸 Processing...' : cameraReady ? '📸 Identify Drink' : 'Loading...'}
          </button>
          
          <button 
            type="button" 
            onClick={handleCancel}
            style={{
              padding: '10px 14px',
              backgroundColor: 'transparent',
              color: '#ff4444',
              border: '1px solid #ff4444',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Cancel
          </button>
        </div>

        {/* Error Display - simplified */}
        {error && (
          <div style={{ 
            color: '#ff4444', 
            fontSize: '11px',
            textAlign: 'center',
            backgroundColor: 'rgba(255,68,68,0.1)',
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid rgba(255,68,68,0.3)'
          }}>
            {error}
          </div>
        )}

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <style>{`
          @keyframes cameraSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
  );
});

CameraCapture.displayName = 'CameraCapture';

export default CameraCapture;