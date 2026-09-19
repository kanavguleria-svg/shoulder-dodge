// Volume curve: index = lives remaining (0-3)
export const VIOLIN_VOLUMES = [0, 0.9, 0.45, 0.1];

// Looping violin tune — 4-phrase action melody in A minor
export const MELODY = [
  // Phrase 1 — Driving, repeated-note attack (Hungarian Dance feel)
  [440, 0.18], [440, 0.18], [440, 0.18],       // A4 A4 A4
  [523, 0.36], [494, 0.36],                     // C5 B4
  [440, 0.36], [392, 0.18], [415, 0.18],        // A4 G4 Ab4
  [440, 0.72],                                  // A4

  [523, 0.18], [523, 0.18], [523, 0.18],       // C5 C5 C5
  [587, 0.36], [554, 0.36],                     // D5 C#5
  [523, 0.36], [494, 0.18], [466, 0.18],        // C5 B4 Bb4
  [440, 0.72],                                  // A4

  // Phrase 2 — Lyrical sweep up and down
  [523, 0.54], [587, 0.36], [659, 0.36],        // C5 D5 E5
  [698, 0.54], [659, 0.36], [587, 0.36],        // F5 E5 D5
  [523, 0.54], [494, 0.36], [440, 0.36],        // C5 B4 A4
  [392, 1.08],                                  // G4

  // Phrase 3 — Descending chromatic tension run
  [523, 0.20], [508, 0.20], [494, 0.20],        // C5 B4♭ B4
  [466, 0.20], [440, 0.20], [415, 0.20],        // Bb4 A4 Ab4
  [392, 0.20], [370, 0.20], [349, 0.20],        // G4 F#4 F4
  [330, 0.72],                                  // E4

  // Phrase 4 — Resolution & lift back to top
  [330, 0.36], [370, 0.36],                     // E4 F#4
  [392, 0.36], [440, 0.36],                     // G4 A4
  [494, 0.36], [523, 0.36],                     // B4 C5
  [587, 0.54], [523, 0.36],                     // D5 C5
  [440, 1.44],                                  // A4 (loop back)
];

// Mario Game Over note sequences
export const MARIO_NOTES = [
  { freq: 494, delay: 0.00, dur: 0.14 },    // B4
  { freq: 370, delay: 0.18, dur: 0.14 },    // F#4
  { freq: 294, delay: 0.36, dur: 0.85 },    // D4
  { freq: 415.30, delay: 1.40, dur: 0.13 }, // Ab4
  { freq: 392.00, delay: 1.55, dur: 0.13 }, // G4
  { freq: 369.99, delay: 1.70, dur: 0.13 }, // F#4
  { freq: 349.23, delay: 1.85, dur: 0.13 }, // F4
  { freq: 329.63, delay: 2.00, dur: 0.13 }, // E4
  { freq: 311.13, delay: 2.15, dur: 0.13 }, // Eb4
  { freq: 293.66, delay: 2.30, dur: 0.13 }, // D4
  { freq: 277.18, delay: 2.45, dur: 0.13 }, // C#4
  { freq: 246.94, delay: 2.70, dur: 1.60 }, // B3
];

