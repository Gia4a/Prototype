import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';


export interface CameraCaptureHandle {
  stopCamera: () => void;
}

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
}


const CameraCapture = forwardRef<CameraCaptureHandle, CameraCaptureProps>(({ onCapture }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Start camera automatically on mount, and expose stopCamera to parent
  useEffect(() => {
    let active = true;
    const startCamera = async () => {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          setStreaming(true);
        }
      } catch (err) {
        setError('Camera access denied or not available.');
      }
    };
    startCamera();
    return () => {
      active = false;
      stopCamera();
    };
    // eslint-disable-next-line
  }, []);

  useImperativeHandle(ref, () => ({
    stopCamera
  }));
  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  function stopCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        onCapture(imageData);
        stopCamera();
      }
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <div>
        <video ref={videoRef} autoPlay playsInline style={{ width: 240, height: 180, border: '1px solid #ccc', background: '#000' }} />
        <br />
        <button type="button" onClick={capturePhoto} style={{ marginRight: '10px' }} disabled={!streaming}>
          Capture
        </button>
        <button type="button" onClick={() => { stopCamera(); onCapture(''); }}>
          Cancel
        </button>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
});

export default CameraCapture;
