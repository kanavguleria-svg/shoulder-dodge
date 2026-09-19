import { GAME_CONFIG } from '../constants/gameConfig';

export function getBulletSpeed(level, baseSpeed = GAME_CONFIG.SPEED_BASE) {
  return baseSpeed + (level - 1) * 0.8;
}

export function getBulletInterval(level, baseInterval = GAME_CONFIG.BASE_INTERVAL) {
  return Math.max(300, baseInterval - (level - 1) * 120);
}

export function spawnBullet(level, baseSpeed = GAME_CONFIG.SPEED_BASE, canvasW = GAME_CONFIG.CANVAS_W, canvasH = GAME_CONFIG.CANVAS_H) {
  const side = Math.random();
  let x, y, vx, vy;
  const speed = getBulletSpeed(level, baseSpeed);
  const radius = GAME_CONFIG.BULLET_RADIUS;

  if (side < 0.7) {
    // From top — random X
    x = Math.random() * (canvasW - 40) + 20;
    y = -radius;
    vx = (Math.random() - 0.5) * 1.5;
    vy = speed;
  } else if (side < 0.85) {
    // From left
    x = -radius;
    y = Math.random() * canvasH * 0.7 + 80;
    vx = speed;
    vy = (Math.random() - 0.5) * 2;
  } else {
    // From right
    x = canvasW + radius;
    y = Math.random() * canvasH * 0.7 + 80;
    vx = -speed;
    vy = (Math.random() - 0.5) * 2;
  }

  const hue = (Date.now() / 20 + level * 30) % 360;
  return { x, y, vx, vy, hue, trail: [] };
}

export function checkHit(shoulder, bullets, shoulderRadius = GAME_CONFIG.SHOULDER_RADIUS, bulletRadius = GAME_CONFIG.BULLET_RADIUS) {
  if (!shoulder) return { hit: false, hitIndex: -1 };
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    const dx = b.x - shoulder.x;
    const dy = b.y - shoulder.y;
    if (Math.sqrt(dx * dx + dy * dy) < shoulderRadius + bulletRadius) {
      return { hit: true, hitIndex: i };
    }
  }
  return { hit: false, hitIndex: -1 };
}

