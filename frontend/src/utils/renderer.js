import { GAME_CONFIG, KEYPOINTS } from '../constants/gameConfig';

export function drawBackground(ctx, width = GAME_CONFIG.CANVAS_W, height = GAME_CONFIG.CANVAS_H) {
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, width, height);

  // Subtle grid
  ctx.strokeStyle = '#ffffff08';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

export function drawShoulders(ctx, poseData, radius = GAME_CONFIG.SHOULDER_RADIUS, width = GAME_CONFIG.CANVAS_W, height = GAME_CONFIG.CANVAS_H) {
  const shoulders = [
    { pos: poseData.left, color: '#00ff88', label: 'LEFT' },
    { pos: poseData.right, color: '#ff4488', label: 'RIGHT' }
  ];

  for (const { pos, color, label } of shoulders) {
    if (!pos) {
      // Ghost indicator if not detected
      ctx.beginPath();
      ctx.arc(
        label === 'LEFT' ? width * 0.35 : width * 0.65,
        height * 0.65,
        radius, 0, Math.PI * 2
      );
      ctx.strokeStyle = '#ffffff22';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      continue;
    }

    // Glow
    const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius * 2);
    grad.addColorStop(0, color + 'aa');
    grad.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius * 2, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Main circle
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color + 'dd';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, pos.x, pos.y + 4);

    // Hit zone ring
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = color + '44';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw body line connecting shoulders
  if (poseData.left && poseData.right) {
    ctx.beginPath();
    ctx.moveTo(poseData.left.x, poseData.left.y);
    ctx.lineTo(poseData.right.x, poseData.right.y);
    ctx.strokeStyle = '#ffffff33';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

export function drawBullets(ctx, bullets, bulletRadius = GAME_CONFIG.BULLET_RADIUS, now = performance.now()) {
  for (const b of bullets) {
    // Trail
    for (let i = 0; i < b.trail.length; i++) {
      const t = b.trail[i];
      const alpha = (i / b.trail.length) * 0.4;
      ctx.beginPath();
      ctx.arc(t.x, t.y, bulletRadius * (i / b.trail.length), 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${b.hue}, 100%, 60%, ${alpha})`;
      ctx.fill();
    }

    // Glowing core
    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, bulletRadius * 1.8);
    grad.addColorStop(0, `hsl(${b.hue}, 100%, 90%)`);
    grad.addColorStop(0.5, `hsl(${b.hue}, 100%, 60%)`);
    grad.addColorStop(1, `hsla(${b.hue}, 100%, 40%, 0)`);
    ctx.beginPath();
    ctx.arc(b.x, b.y, bulletRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Outer ring pulse
    const pulse = 0.7 + 0.3 * Math.sin(now / 120 + b.x);
    ctx.beginPath();
    ctx.arc(b.x, b.y, bulletRadius * pulse + 3, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${b.hue}, 100%, 70%, 0.5)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export function drawNoPoseWarning(
  ctx,
  poseData,
  outOfFrameSecondsLeft = null,
  penaltyActive = false,
  width = GAME_CONFIG.CANVAS_W,
  height = GAME_CONFIG.CANVAS_H
) {
  if (penaltyActive) {
    // Red overlay flash on canvas
    ctx.fillStyle = 'rgba(255, 23, 68, 0.22)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ff1744';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚨 -20 PENALTY: Out of Camera! 🚨', width / 2, 32);
    return;
  }

  if (!poseData.left && !poseData.right) {
    if (outOfFrameSecondsLeft !== null) {
      const isUrgent = outOfFrameSecondsLeft <= 2.0;
      ctx.fillStyle = isUrgent ? '#ff3344' : '#ffcc44';
      ctx.font = isUrgent ? 'bold 15px sans-serif' : 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `⚠ Return to camera! Penalty (-20) in ${Math.max(0, outOfFrameSecondsLeft).toFixed(1)}s`,
        width / 2,
        28
      );
    } else {
      ctx.fillStyle = '#ffcc44cc';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ No pose detected — move into frame', width / 2, 28);
    }
  }
}

export function drawSkeletonOverlay(ctx, keypoints, width, height) {
  ctx.clearRect(0, 0, width, height);
  if (!keypoints) return;

  const lKP = keypoints[KEYPOINTS.LEFT_SHOULDER];
  const rKP = keypoints[KEYPOINTS.RIGHT_SHOULDER];

  const drawDot = (x, y, color, label) => {
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = color + 'cc';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + 4);
  };

  if (lKP && lKP.score > 0.25) {
    drawDot(lKP.x, lKP.y, '#00ff88', 'L');
  }
  if (rKP && rKP.score > 0.25) {
    drawDot(rKP.x, rKP.y, '#ff4488', 'R');
  }

  if (lKP?.score > 0.25 && rKP?.score > 0.25) {
    ctx.beginPath();
    ctx.moveTo(lKP.x, lKP.y);
    ctx.lineTo(rKP.x, rKP.y);
    ctx.strokeStyle = '#ffffff44';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

