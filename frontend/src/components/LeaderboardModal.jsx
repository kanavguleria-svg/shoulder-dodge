import React, { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../services/api';

export function LeaderboardModal({ isOpen, onClose }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);

    fetchLeaderboard().then((data) => {
      if (isMounted) {
        setScores(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🏆 Top High Scores</h3>
          <button
            onClick={onClose}
            style={{ padding: '4px 10px', fontSize: '0.9rem', border: 'none', color: '#aaa' }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            Loading leaderboard from Django...
          </p>
        ) : scores.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            No scores recorded yet. Be the first!
          </p>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Score</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className={`rank-${idx + 1}`}>{idx + 1}</td>
                  <td>{item.player_name}</td>
                  <td style={{ color: '#00e5ff', fontWeight: 'bold' }}>{item.score}</td>
                  <td>{item.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ textAlign: 'center' }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

