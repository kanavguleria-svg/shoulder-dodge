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

// ----------------------------------------------------
// Telemetry & Metrics Tracking
// ----------------------------------------------------
export function getOrCreateSessionId() {
  try {
    let id = localStorage.getItem('dodge_session_id');
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now();
      localStorage.setItem('dodge_session_id', id);
    }
    return id;
  } catch (e) {
    return 'sess_fallback_' + Date.now();
  }
}

export async function trackMetric(action, extra = {}, isUnload = false) {
  const sessionId = getOrCreateSessionId();
  const payload = JSON.stringify({
    session_id: sessionId,
    action,
    ...extra,
  });

  const url = `${API_BASE_URL}/metrics/track/`;

  if (isUnload && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
    return;
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: isUnload,
    });
  } catch (err) {
    // Non-intrusive logging for telemetry errors
    console.debug('Telemetry error:', err.message);
  }
}

export function trackVisit() {
  return trackMetric('visit');
}

export function trackRetry() {
  return trackMetric('retry');
}

export function trackTimeSpent(seconds, isUnload = false) {
  if (seconds > 0) {
    return trackMetric('time_spent', { seconds }, isUnload);
  }
}

export async function fetchMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/metrics/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching metrics:', err);
    return null;
  }
}


