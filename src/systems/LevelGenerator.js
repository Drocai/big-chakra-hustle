/**
 * LevelGenerator — Full procedural generation system.
 * Extends prototype's addNextPlatform() with seeded PRNG, world themes,
 * segment templates, difficulty scaling, and NG+.
 */
import { CONFIG } from '../config.js';
import { Platform } from '../entities/Platform.js';
import { Shard } from '../entities/Shard.js';
import { Enemy } from '../entities/Enemy.js';
import { CHAKRAS } from '../data/ChakraData.js';

export class LevelGenerator {
  constructor(seed = 42) {
    this._seed = seed;
    this._rngState = seed;

    // World progression
    this.currentWorld = 0;         // 0-6 (chakra index)
    this.currentRoom = 0;          // room within world
    this.ngPlusLevel = 0;          // NG+ cycle count
    this.difficultyMultiplier = 1;

    // Segment tracking
    this._lastPlatformX = 0;
    this._lastPlatformY = 400;
    this._platformsInRoom = 0;
    this._roomLength = 25;         // platforms per room
    this._segmentQueue = [];

    // Modifiers (from Decan)
    this.modifiers = {};
  }

  /** Sin-based seeded PRNG (deterministic). */
  _random() {
    this._rngState++;
    const x = Math.sin(this._rngState * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  }

  /** Random in range. */
  _range(min, max) {
    return min + this._random() * (max - min);
  }

  /** Random int in range. */
  _randInt(min, max) {
    return Math.floor(this._range(min, max + 1));
  }

  get worldConfig() {
    return CHAKRAS[this.currentWorld % 7];
  }

  get totalRooms() {
    return this.worldConfig.rooms;
  }

  get isLastRoom() {
    return this.currentRoom >= this.totalRooms - 1;
  }

  get isBossRoom() {
    return this.isLastRoom;
  }

  /** Set the seed (for shareable runs). */
  setSeed(seed) {
    this._seed = seed;
    this._rngState = seed;
  }

  /** Apply decan modifiers. */
  applyModifiers(modifiers) {
    this.modifiers = modifiers || {};
  }

  /** Generate initial room platforms. */
  generateRoom(screenHeight) {
    const platforms = [];
    const shards = [];
    const enemies = [];

    this._platformsInRoom = 0;
    this._lastPlatformX = 0;
    this._lastPlatformY = screenHeight - 150;

    // Choose segment pattern for this room
    const segments = this._generateSegments();

    for (const segment of segments) {
      const result = this._buildSegment(segment, screenHeight);
      platforms.push(...result.platforms);
      shards.push(...result.shards);
      enemies.push(...result.enemies);
    }

    return { platforms, shards, enemies };
  }

  _generateSegments() {
    const segments = [];
    let remaining = this._roomLength;

    if (this.isBossRoom) {
      // Boss room: flat arena
      segments.push({ type: 'arena', length: remaining });
      return segments;
    }

    while (remaining > 0) {
      const types = ['flat', 'ascend', 'descend', 'gaps', 'mixed'];
      const type = types[this._randInt(0, types.length - 1)];
      const length = Math.min(this._randInt(4, 8), remaining);
      segments.push({ type, length });
      remaining -= length;
    }

    return segments;
  }

  _buildSegment(segment, screenHeight) {
    const platforms = [];
    const shards = [];
    const enemies = [];
    const world = this.worldConfig;
    const diff = this.difficultyMultiplier;
    const widthBonus = this.modifiers.platformWidthBonus || 1;
    const enemyDensity = (this.modifiers.enemyDensity || 1) * diff;

    for (let i = 0; i < segment.length; i++) {
      this._platformsInRoom++;

      let gap, w, yShift;

      switch (segment.type) {
        case 'flat':
          gap = this._range(60, 100) * diff;
          w = this._range(150, 250) * widthBonus;
          yShift = this._range(-20, 20);
          break;
        case 'ascend':
          gap = this._range(50, 90) * diff;
          w = this._range(120, 200) * widthBonus;
          yShift = -this._range(30, 70);
          break;
        case 'descend':
          gap = this._range(60, 120) * diff;
          w = this._range(130, 220) * widthBonus;
          yShift = this._range(30, 70);
          break;
        case 'gaps':
          gap = this._range(100, 180) * diff;
          w = this._range(80, 140) * widthBonus;
          yShift = this._range(-40, 40);
          break;
        case 'arena':
          gap = 0;
          w = this._range(300, 500);
          yShift = 0;
          break;
        default:
          gap = this._range(60, 140) * diff;
          w = this._range(120, 220) * widthBonus;
          yShift = this._range(-60, 60);
          break;
      }

      const x = this._lastPlatformX + (i === 0 && segment.type !== 'arena' ? 80 : gap);
      const y = Math.max(180, Math.min(screenHeight - 120, this._lastPlatformY + yShift));

      const plat = new Platform(x, y, w);
      plat.setTheme(world.platformColor, world.glowColor);
      platforms.push(plat);

      // Shards
      const shardChance = CONFIG.shard.spawnChance * (this.modifiers.shardSpawnRate || 1);
      if (this._random() < shardChance) {
        const shardType = this._random() < 0.1 ? 'token' : (this._random() < 0.15 ? 'health' : 'chakra');
        shards.push(new Shard(x + w * 0.5, y - 40, shardType));
      }

      // Enemies
      const spawnChance = 0.25 * enemyDensity;
      if (this._random() < spawnChance && w > 100 && segment.type !== 'arena') {
        const eTypes = world.enemyTypes;
        const eType = eTypes[this._randInt(0, eTypes.length - 1)];
        enemies.push(new Enemy(x + w * 0.3, y - 60, eType));
      }

      this._lastPlatformX = x + w;
      this._lastPlatformY = y;
    }

    return { platforms, shards, enemies };
  }

  /** Generate next platform (for infinite scroll during play). */
  generateNextPlatform(screenHeight) {
    const world = this.worldConfig;
    const diff = this.difficultyMultiplier;
    const widthBonus = this.modifiers.platformWidthBonus || 1;

    const gap = this._range(CONFIG.platform.minGap, CONFIG.platform.maxGap) * diff;
    const w = this._range(CONFIG.platform.minWidth, CONFIG.platform.maxWidth) * widthBonus;
    const yTarget = this._lastPlatformY + this._range(-80, 80);
    const y = Math.max(CONFIG.platform.minY, Math.min(screenHeight - 120, yTarget));
    const x = this._lastPlatformX + gap;

    const plat = new Platform(x, y, w);
    plat.setTheme(world.platformColor, world.glowColor);

    this._lastPlatformX = x + w;
    this._lastPlatformY = y;
    this._platformsInRoom++;

    // Shard
    let shard = null;
    if (this._random() < CONFIG.shard.spawnChance) {
      const type = this._random() < 0.1 ? 'token' : 'chakra';
      shard = new Shard(x + w * 0.5, y - 40, type);
    }

    // Enemy
    let enemy = null;
    const spawnChance = 0.2 * diff * (this.modifiers.enemyDensity || 1);
    if (this._random() < spawnChance && w > 100) {
      const eTypes = world.enemyTypes;
      const eType = eTypes[this._randInt(0, eTypes.length - 1)];
      enemy = new Enemy(x + w * 0.3, y - 60, eType);
    }

    return { platform: plat, shard, enemy };
  }

  /** Advance to next room. Returns true if world changed. */
  advanceRoom() {
    this.currentRoom++;
    this._platformsInRoom = 0;

    if (this.currentRoom >= this.totalRooms) {
      return this.advanceWorld();
    }
    return false;
  }

  /** Advance to next world. */
  advanceWorld() {
    this.currentWorld++;
    this.currentRoom = 0;

    // NG+ cycle
    if (this.currentWorld >= 7) {
      this.ngPlusLevel++;
      this.currentWorld = 0;
      this.difficultyMultiplier = 1 + this.ngPlusLevel * 0.5;
    }

    return true;
  }

  /** Get a display string for current location. */
  get locationString() {
    const world = this.worldConfig;
    const ngStr = this.ngPlusLevel > 0 ? ` NG+${this.ngPlusLevel}` : '';
    return `${world.name.toUpperCase()} ${this.currentRoom + 1}/${this.totalRooms}${ngStr}`;
  }
}
