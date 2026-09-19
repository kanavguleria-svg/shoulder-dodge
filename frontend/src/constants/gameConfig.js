export const GAME_CONFIG = {
  CANVAS_W: 560,
  CANVAS_H: 480,
  SHOULDER_RADIUS: 22,    // hit zone radius (px in game coords)
  BULLET_RADIUS: 9,
  BASE_INTERVAL: 1200,    // ms between bullets at level 1
  SPEED_BASE: 4,          // bullet px/frame at level 1
  LIVES_MAX: 3,
  POINTS_PER_LEVEL: 200,
  POINTS_PER_DODGE: 10,
  PENALTY_POINTS: 20,
  OUT_OF_FRAME_GRACE_MS: 5000,
  OUT_OF_FRAME_REPEAT_MS: 5000,
};

// MoveNet keypoint indices
export const KEYPOINTS = {
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
};

