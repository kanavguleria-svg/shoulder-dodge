import React from 'react';

export function WebcamFeed({ videoRef, skeletonCanvasRef, dimensions }) {
  return (
    <div id="webcam-container">
      <video
        ref={videoRef}
        id="webcam"
        autoPlay
        muted
        playsInline
      />
      <canvas
        ref={skeletonCanvasRef}
        id="skeleton-overlay"
        width={dimensions?.width || 640}
        height={dimensions?.height || 480}
      />
      <div id="webcam-label">📷 Pose Camera</div>
    </div>
  );
}

