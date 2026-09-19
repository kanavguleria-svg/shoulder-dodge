import React from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

export function GameCanvas({ canvasRef, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        id="game-canvas"
        width={GAME_CONFIG.CANVAS_W}
        height={GAME_CONFIG.CANVAS_H}
      />
      {children}
    </div>
  );
}

