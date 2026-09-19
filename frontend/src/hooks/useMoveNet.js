import { useState, useEffect, useRef } from 'react';
import { GAME_CONFIG, KEYPOINTS } from '../constants/gameConfig';
import { drawSkeletonOverlay } from '../utils/renderer';

async function waitForGlobal(name, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (window[name]) return window[name];
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Timed out waiting for ${name} script to load`);
}

export function useMoveNet(videoRef, cameraReady, skeletonCanvasRef) {
  const [detectorReady, setDetectorReady] = useState(false);
  const [modelStatus, setModelStatus] = useState('Loading MoveNet (Lightning)…');
  const detectorRef = useRef(null);
  const poseDataRef = useRef({ left: null, right: null });
  const animFrameIdRef = useRef(null);

  // Initialize model
  useEffect(() => {
    let isMounted = true;

    async function loadModel() {
      try {
        const tf = await waitForGlobal('tf');
        const poseDetection = await waitForGlobal('poseDetection');
        await tf.ready();

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );

        if (!isMounted) return;
        detectorRef.current = detector;
        setDetectorReady(true);
        setModelStatus('Model ready ✔');
      } catch (err) {
        console.error('Failed to load MoveNet model:', err);
        if (isMounted) {
          setModelStatus('Failed to load model: ' + err.message);
        }
      }
    }

    loadModel();

    return () => {
      isMounted = false;
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, []);

  // Continuous pose loop
  useEffect(() => {
    let active = true;

    async function poseLoop() {
      if (!active) return;

      const video = videoRef.current;
      const detector = detectorRef.current;
      const skelCanvas = skeletonCanvasRef?.current;

      if (detector && video && video.readyState >= 2) {
        try {
          const poses = await detector.estimatePoses(video);

          if (skelCanvas) {
            const ctx = skelCanvas.getContext('2d');
            drawSkeletonOverlay(ctx, poses.length > 0 ? poses[0].keypoints : null, skelCanvas.width, skelCanvas.height);
          }

          if (poses.length > 0) {
            const kps = poses[0].keypoints;
            const lKP = kps[KEYPOINTS.LEFT_SHOULDER];
            const rKP = kps[KEYPOINTS.RIGHT_SHOULDER];

            const VW = video.videoWidth || 640;
            const VH = video.videoHeight || 480;

            const mapX = (x) => ((VW - x) / VW) * GAME_CONFIG.CANVAS_W;
            const mapY = (y) => (y / VH) * GAME_CONFIG.CANVAS_H;

            poseDataRef.current = {
              left: (lKP && lKP.score > 0.25) ? { x: mapX(lKP.x), y: mapY(lKP.y) } : null,
              right: (rKP && rKP.score > 0.25) ? { x: mapX(rKP.x), y: mapY(rKP.y) } : null,
            };
          } else {
            poseDataRef.current = { left: null, right: null };
          }
        } catch (e) {
          console.warn('Pose estimation error in frame:', e);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(poseLoop);
    }

    if (detectorReady && cameraReady) {
      animFrameIdRef.current = requestAnimationFrame(poseLoop);
    }

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [detectorReady, cameraReady, videoRef, skeletonCanvasRef]);

  return { detectorReady, modelStatus, poseDataRef };
}
