import React, { useState } from 'react';
import { submitScore } from '../services/api';

export function Overlays({
  gameRunning,
  gameOver,
  cameraReady,
  cameraError,
  detectorReady,
  score,
  level,
  onStartGame,
  onScoreSubmitted,
}) {
  const [playerName, setPlayerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    if (submitting || submitted) return;

    setSubmitting(true);
    const res = await submitScore(playerName.trim() || 'Anonymous', score, level);
    setSubmitting(false);

    if (res?.status === 'success') {
      setSubmitted(true);
      if (onScoreSubmitted) onScoreSubmitted();
    }
  };

  const handleRestart = () => {
    setSubmitted(false);
    onStartGame();
  };

  // Start Screen Overlay
  if (!gameRunning && !gameOver) {
    const isReady = cameraReady && detectorReady;

    return (
      <div className="overlay" id="start-screen">
        <h2 style={{ color: '#00e5ff' }}>SHOULDER DODGE</h2>
        <p>
          Use your <strong>left &amp; right shoulders</strong> to dodge incoming bullets.<br />
          Allow camera access and click Start when ready.
        </p>

        <button
          id="start-btn"
          disabled={!isReady}
          onClick={onStartGame}
        >
          ▶ START
        </button>

        <p style={{ fontSize: '0.78rem', color: cameraError ? '#ff4444' : isReady ? '#00ff88' : '#ffcc44' }}>
          {cameraError
            ? `❌ Camera error: ${cameraError}`
            : !cameraReady
            ? 'Initializing camera…'
            : !detectorReady
            ? 'Loading MoveNet AI model…'
            : '✅ Ready to play!'}
        </p>
      </div>
    );
  }

  // Game Over Overlay
  if (gameOver) {
    return (
      <div className="overlay" id="gameover-screen">
        <h2 style={{ color: '#ff4444' }}>GAME OVER</h2>
        <p>
          Your score: <strong>{score}</strong> &nbsp;|&nbsp; Level reached: <strong>{level}</strong>
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmitScore} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              maxLength={25}
              onChange={(e) => setPlayerName(e.target.value)}
              className="player-input"
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-action"
              style={{ fontSize: '0.85rem', padding: '6px 18px' }}
            >
              {submitting ? 'Saving...' : '💾 Save to Leaderboard'}
            </button>
          </form>
        ) : (
          <p style={{ color: '#00ff88', fontSize: '0.85rem' }}>
            ✅ Score saved to backend leaderboard!
          </p>
        )}

        <button id="restart-btn" onClick={handleRestart} style={{ marginTop: '6px' }}>
          ↺ PLAY AGAIN
        </button>
      </div>
    );
  }

  return null;
}

