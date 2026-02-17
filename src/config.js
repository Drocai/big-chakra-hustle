/**
 * BIG CHAKRA HUSTLE — Master Configuration
 * All tunable constants in one place.
 */

export const CONFIG = {
  // --- Player Physics (per zodiac) ---
  zodiac: {
    AIRES: {
      gravity: 0.8,
      speed: 8,
      jumpForce: -16,
      maxJumps: 1,
      dashSpeed: 25,
      label: 'AIRES [FIRE]',
      colors: { main: '#ff2a00', glow: '#ff8800', trail: '#550000' }
    },
    KOIDON: {
      gravity: 0.35,
      speed: 5,
      jumpForce: -12,
      maxJumps: 2,
      dashSpeed: 15,
      label: 'KOIDON [WATER]',
      colors: { main: '#00f7ff', glow: '#0044ff', trail: '#001133' }
    }
  },

  // --- Player ---
  player: {
    width: 30,
    height: 50,
    startX: 100,
    deceleration: 0.8,
    acceleration: 1,
    dashCost: 20,
    dashDuration: 15,
    dashCooldown: 30,
    chakraMax: 100,
    chakraRegen: 0.1,
    maxHP: 100,
    invincibilityFrames: 60,
    knockbackForce: 8,
    attackWidth: 45,
    attackHeight: 40,
    attackDuration: 8,
    attackDamage: 25,
    attackCooldown: 20,
    variableJumpFrames: 12,
    variableJumpCut: 0.4
  },

  // --- Camera ---
  camera: {
    followThreshold: 0.4,
    lerpSpeed: 0.08,
    shakeDecay: 0.9,
    shakeMax: 20,
    defaultZoom: 1
  },

  // --- Platforms ---
  platform: {
    minGap: 60,
    maxGap: 140,
    minWidth: 120,
    maxWidth: 220,
    height: 20,
    minY: 180,
    yVariance: 160,
    initialCount: 12,
    color: '#bc13fe',
    offscreenRemove: -200,
    offscreenShardRemove: -300
  },

  // --- Shards / Collectibles ---
  shard: {
    size: 15,
    chakraReward: 10,
    bobAmplitude: 6,
    bobSpeed: 0.1,
    rotationSpeed: 0.05,
    spawnChance: 0.75
  },

  // --- Particles ---
  particles: {
    poolSize: 500,
    presets: {
      jump: { count: 10, speed: 5, life: 20 },
      dash: { count: 1, speed: 2, life: 10 },
      switchZodiac: { count: 20, speed: 10, life: 30 },
      collectShard: { count: 10, speed: 5, life: 20 },
      hit: { count: 15, speed: 8, life: 15 },
      explosion: { count: 30, speed: 12, life: 25 },
      ambient: { count: 1, speed: 0.5, life: 60 },
      death: { count: 40, speed: 15, life: 40 }
    }
  },

  // --- Starfield ---
  starfield: {
    count: 120,
    minAlpha: 0.2,
    maxSize: 2,
    minSpeed: 0.05,
    maxSpeed: 0.2
  },

  // --- Colors ---
  colors: {
    bg: '#050510',
    bgGradientInner: '#150520',
    bgGradientOuter: '#000000',
    floor: '#0a0a0a',
    platform: '#bc13fe',
    accent: '#73fbd3',
    accent2: '#a78bfa',
    gold: '#f5c542',
    white: '#ffffff',
    healthGreen: '#4ade80',
    healthRed: '#ef4444',
    chakraBar: '#a78bfa'
  },

  // --- Game States ---
  states: {
    TITLE: 'TITLE',
    CHARACTER_CREATE: 'CHARACTER_CREATE',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE'
  },

  // --- Display ---
  display: {
    targetFPS: 60,
    fpsUpdateInterval: 500,
    debugMode: false
  },

  // --- Affirmations (from level1.html) ---
  affirmations: [
    "My vibe is currency.",
    "Aligned. Activated. Ascended.",
    "Peace is the highest form of wealth.",
    "Collect. Vibrate. Transmit.",
    "Frequency over force.",
    "The cosmos moves through me.",
    "I am the signal, not the noise."
  ]
};
