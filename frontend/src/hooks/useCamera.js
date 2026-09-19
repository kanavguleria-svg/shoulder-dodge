import { useState, useEffect, useRef } from 'react';

export function useCamera() {
  const videoRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });

  useEffect(() => {
    let stream = null;
    let isMounted = true;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            if (isMounted && videoRef.current) {
              const width = videoRef.current.videoWidth || 640;
              const height = videoRef.current.videoHeight || 480;
              setVideoDimensions({ width, height });
              setCameraReady(true);
            }
          };
        }
      } catch (err) {
        if (isMounted) {
          console.error('Camera access error:', err);
          setCameraError(err.message);
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { videoRef, cameraReady, cameraError, videoDimensions };
}

