const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend connection error:', err.message);
    return { status: 'offline', message: err.message };
  }
}

export async function fetchLeaderboard() {
  try {
    const res = await fetch(`${API_BASE_URL}/leaderboard/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.leaderboard || [];
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
}

export async function submitScore(playerName, score, level) {
  try {
    const res = await fetch(`${API_BASE_URL}/scores/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player_name: playerName || 'Anonymous',
        score,
        level,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error submitting score:', err);
    return { status: 'error', message: err.message };
  }
}

export async function fetchGameConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/config/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.config;
  } catch (err) {
    console.warn('Using local fallback game config');
    return null;
  }
}

