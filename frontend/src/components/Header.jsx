import React from 'react';

export function Header({ backendStatus, onOpenLeaderboard }) {
  const isHealthy = backendStatus?.status === 'healthy';

  return (
    <header className="header-wrapper">
      <h1 className="app-title">⚡ Shoulder Dodge</h1>
      <div className="nav-actions">
        <div className={`backend-badge ${isHealthy ? 'connected' : 'offline'}`} title={backendStatus?.message || 'Connecting...'}>
          <span style={{ fontSize: '8px' }}>●</span>
          <span>{isHealthy ? 'Connected' : 'Offline'}</span>
        </div>
        <button
          className="btn-action btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          onClick={onOpenLeaderboard}
        >
          🏆 High Scores
        </button>
      </div>
    </header>
  );
}

