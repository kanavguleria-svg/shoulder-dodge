import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { HUD } from '../components/HUD';
import { WebcamFeed } from '../components/WebcamFeed';
import { GameCanvas } from '../components/GameCanvas';
import { Overlays } from '../components/Overlays';
import { StatusBar } from '../components/StatusBar';
import { LeaderboardModal } from '../components/LeaderboardModal';

import { useCamera } from '../hooks/useCamera';
import { useMoveNet } from '../hooks/useMoveNet';
import { useGameEngine } from '../hooks/useGameEngine';
import { checkBackendHealth } from '../services/api';

export function GamePage() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const canvasRef = useRef(null);
  const skeletonCanvasRef = useRef(null);

  // Hook 1: Camera initialization
  const { videoRef, cameraReady, cameraError, videoDimensions } = useCamera();

  // Hook 2: Pose detection & MoveNet model
  const { detectorReady, modelStatus, poseDataRef } = useMoveNet(
    videoRef,
    cameraReady,
    skeletonCanvasRef
  );

  // Hook 3: Game physics, bullet loop, collision, and sound
  const { gameState, startGame, endGame } = useGameEngine(canvasRef, poseDataRef);

  // Check Django backend health on mount
  useEffect(() => {
    checkBackendHealth().then((status) => {
      setBackendStatus(status);
    });
  }, []);

  return (
    <div className="game-container">
      <Header
        backendStatus={backendStatus}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
      />

      <HUD
        score={gameState.score}
        lives={gameState.lives}
        level={gameState.level}
      />

      <div id="game-wrapper">
        <WebcamFeed
          videoRef={videoRef}
          skeletonCanvasRef={skeletonCanvasRef}
          dimensions={videoDimensions}
        />

        <GameCanvas canvasRef={canvasRef}>
          <Overlays
            gameRunning={gameState.gameRunning}
            gameOver={gameState.gameOver}
            cameraReady={cameraReady}
            cameraError={cameraError}
            detectorReady={detectorReady}
            score={gameState.score}
            level={gameState.level}
            onStartGame={startGame}
            onScoreSubmitted={() => setShowLeaderboard(true)}
          />
        </GameCanvas>
      </div>

      <StatusBar statusText={modelStatus} />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
  );
}

