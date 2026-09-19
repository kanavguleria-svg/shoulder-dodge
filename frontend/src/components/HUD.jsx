import React from 'react';

export function HUD({ score, lives, level }) {
  const hearts = '❤️'.repeat(Math.max(0, lives));

  return (
    <div id="hud">
      <div className="hud-item">
        <div className="hud-label">Score</div>
        <div className="hud-value" id="score-display">{score}</div>
      </div>
      <div className="hud-item">
        <div className="hud-label">Lives</div>
        <div className="hud-value" id="lives-display">
          {hearts || <span style={{ color: '#666' }}>💀</span>}
        </div>
      </div>
      <div className="hud-item">
        <div className="hud-label">Level</div>
        <div className="hud-value" id="level-display">{level}</div>
      </div>
    </div>
  );
}

