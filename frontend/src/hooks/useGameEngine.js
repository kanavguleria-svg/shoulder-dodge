import { useState, useRef, useCallback, useEffect } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';
import { spawnBullet, checkHit, getBulletInterval } from '../utils/collision';
import { soundEngine } from '../utils/audioEngine';
import { drawBackground, drawShoulders, drawBullets, drawNoPoseWarning } from '../utils/renderer';

export function useGameEngine(canvasRef, poseDataRef) {
  const [gameState, setGameState] = useState({
    score: 0,
    lives: GAME_CONFIG.LIVES_MAX,
    level: 1,
    gameRunning: false,
    gameOver: false,
  });

  const bulletsRef = useRef([]);
  const spawnTimerRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const isFlashingRef = useRef(false);

  // Out-of-frame tracking refs
  const outOfFrameStartRef = useRef(null);
  const lastPenaltyTimeRef = useRef(0);
  const penaltyAlertUntilRef = useRef(0);

  const triggerHitFlash = useCallback(() => {
    if (canvasRef.current && !isFlashingRef.current) {
      isFlashingRef.current = true;
      canvasRef.current.classList.add('hit-flash');
      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.classList.remove('hit-flash');
        }
        isFlashingRef.current = false;
      }, 260);
    }
  }, [canvasRef]);

  const triggerPenaltyFlash = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.classList.remove('hit-flash');
      canvasRef.current.classList.remove('penalty-flash');
      void canvasRef.current.offsetWidth; // force DOM reflow
      canvasRef.current.classList.add('penalty-flash');
      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.classList.remove('penalty-flash');
        }
      }, 400);
    }
  }, [canvasRef]);

  const scheduleNextBullet = useCallback((level) => {
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    const interval = getBulletInterval(level);
    spawnTimerRef.current = setTimeout(() => {
      bulletsRef.current.push(spawnBullet(level));
      scheduleNextBullet(level);
    }, interval);
  }, []);

  const endGame = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);

    outOfFrameStartRef.current = null;
    lastPenaltyTimeRef.current = 0;
    penaltyAlertUntilRef.current = 0;

    if (canvasRef.current) {
      canvasRef.current.classList.remove('hit-flash');
      canvasRef.current.classList.remove('penalty-flash');
    }

    soundEngine.playMarioGameOver();

    setGameState((prev) => ({
      ...prev,
      gameRunning: false,
      gameOver: true,
    }));
  }, [canvasRef]);

  const startGame = useCallback(() => {
    // Reset audio and state
    soundEngine.startViolin();

    bulletsRef.current = [];
    lastTimeRef.current = performance.now();
    outOfFrameStartRef.current = null;
    lastPenaltyTimeRef.current = 0;
    penaltyAlertUntilRef.current = 0;

    setGameState({
      score: 0,
      lives: GAME_CONFIG.LIVES_MAX,
      level: 1,
      gameRunning: true,
      gameOver: false,
    });

    scheduleNextBullet(1);
  }, [scheduleNextBullet]);

  // Main rendering & physics game loop
  useEffect(() => {
    if (!gameState.gameRunning) return;

    let active = true;

    function loop(ts) {
      if (!active) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      const now = performance.now();

      // 1. Update bullets
      const bullets = bulletsRef.current;
      for (const b of bullets) {
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 8) b.trail.shift();
        b.x += b.vx;
        b.y += b.vy;
      }

      // 2. Read current pose & presence
      const pose = poseDataRef.current;
      const isInFrame = !!(pose && (pose.left || pose.right));

      // 3. Remove off-screen bullets & award points for dodging (only if in frame)
      const prevCount = bullets.length;
      const remaining = bullets.filter(
        (b) => b.x > -60 && b.x < GAME_CONFIG.CANVAS_W + 60 && b.y < GAME_CONFIG.CANVAS_H + 60
      );
      bulletsRef.current = remaining;

      const dodged = prevCount - remaining.length;
      if (dodged > 0 && isInFrame) {
        setGameState((prev) => {
          const newScore = prev.score + dodged * GAME_CONFIG.POINTS_PER_DODGE;
          const newLevel = Math.floor(newScore / GAME_CONFIG.POINTS_PER_LEVEL) + 1;
          if (newLevel > prev.level) {
            soundEngine.playLevelUpSound();
            scheduleNextBullet(newLevel);
          }
          return {
            ...prev,
            score: newScore,
            level: newLevel,
          };
        });
      }

      // 4. Collision detection against left and right shoulders
      const hitL = checkHit(pose.left, bulletsRef.current);
      if (hitL.hit) {
        bulletsRef.current.splice(hitL.hitIndex, 1);
      }
      const hitR = checkHit(pose.right, bulletsRef.current);
      if (hitR.hit) {
        bulletsRef.current.splice(hitR.hitIndex, 1);
      }

      if (hitL.hit || hitR.hit) {
        soundEngine.playHitSound();
        triggerHitFlash();
        setGameState((prev) => {
          const nextLives = prev.lives - 1;
          soundEngine.setViolinIntensity(nextLives);
          if (nextLives <= 0) {
            setTimeout(endGame, 0);
          }
          return { ...prev, lives: Math.max(0, nextLives) };
        });
      }

      // 5. Out-of-frame penalty check
      const isOutOfFrame = !isInFrame;
      let outOfFrameSecondsLeft = null;
      let penaltyActive = now < penaltyAlertUntilRef.current;

      if (isOutOfFrame) {
        if (outOfFrameStartRef.current === null) {
          outOfFrameStartRef.current = now;
        }
        const timeOut = now - outOfFrameStartRef.current;
        const grace = GAME_CONFIG.OUT_OF_FRAME_GRACE_MS;
        const repeat = GAME_CONFIG.OUT_OF_FRAME_REPEAT_MS;

        if (timeOut < grace) {
          outOfFrameSecondsLeft = (grace - timeOut) / 1000;
        } else {
          // Beyond grace period - check if repeat penalty interval has passed
          if (lastPenaltyTimeRef.current === 0 || now - lastPenaltyTimeRef.current >= repeat) {
            lastPenaltyTimeRef.current = now;
            penaltyAlertUntilRef.current = now + 900;
            penaltyActive = true;

            soundEngine.playPenaltySound();
            triggerPenaltyFlash();

            setGameState((prev) => {
              const nextScore = prev.score - GAME_CONFIG.PENALTY_POINTS;
              if (nextScore < 0) {
                setTimeout(endGame, 0);
                return {
                  ...prev,
                  score: 0,
                };
              }
              return {
                ...prev,
                score: nextScore,
              };
            });
            outOfFrameSecondsLeft = repeat / 1000;
          } else {
            outOfFrameSecondsLeft = Math.max(0, (repeat - (now - lastPenaltyTimeRef.current)) / 1000);
          }
        }
      } else {
        outOfFrameStartRef.current = null;
        lastPenaltyTimeRef.current = 0;
      }

      // 5. Draw frame
      drawBackground(ctx);
      drawShoulders(ctx, pose);
      drawBullets(ctx, bulletsRef.current, GAME_CONFIG.BULLET_RADIUS, now);
      drawNoPoseWarning(
        ctx,
        pose,
        outOfFrameSecondsLeft,
        penaltyActive,
        GAME_CONFIG.CANVAS_W,
        GAME_CONFIG.CANVAS_H
      );

      animFrameRef.current = requestAnimationFrame(loop);
    }

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [gameState.gameRunning, canvasRef, poseDataRef, triggerHitFlash, triggerPenaltyFlash, endGame, scheduleNextBullet]);

  return {
    gameState,
    startGame,
    endGame,
  };
}

