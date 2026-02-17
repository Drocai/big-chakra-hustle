/**
 * ParticleSystem — Pool-based particle system extending the prototype Particle class.
 * Pre-allocates particles and recycles them for zero-GC operation.
 */
import { CONFIG } from '../config.js';

class Particle {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.color = '#fff';
    this.life = 0;
    this.maxLife = 0;
    this.size = 0;
    this.sizeDecay = 0.95;
    this.gravity = 0;
  }

  init(x, y, color, speed, life, opts = {}) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = (Math.random() - 0.5) * speed;
    this.vy = (Math.random() - 0.5) * speed;
    this.life = life;
    this.maxLife = life;
    this.size = opts.size || (Math.random() * 3 + 1);
    this.sizeDecay = opts.sizeDecay || 0.95;
    this.gravity = opts.gravity || 0;
  }

  update() {
    if (!this.active) return;
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life--;
    this.size *= this.sizeDecay;
    if (this.life <= 0 || this.size < 0.1) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.globalAlpha = this.life / this.maxLife;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export class ParticleSystem {
  constructor(poolSize = CONFIG.particles.poolSize) {
    this.pool = [];
    for (let i = 0; i < poolSize; i++) {
      this.pool.push(new Particle());
    }
    this._nextIndex = 0;
  }

  /** Get an inactive particle from the pool. */
  _acquire() {
    // Start searching from _nextIndex for cache friendliness
    for (let i = 0; i < this.pool.length; i++) {
      const idx = (this._nextIndex + i) % this.pool.length;
      if (!this.pool[idx].active) {
        this._nextIndex = (idx + 1) % this.pool.length;
        return this.pool[idx];
      }
    }
    // Pool exhausted — recycle oldest
    const p = this.pool[this._nextIndex];
    this._nextIndex = (this._nextIndex + 1) % this.pool.length;
    return p;
  }

  /** Emit a burst of particles. */
  emit(x, y, color, count, speed, life, opts = {}) {
    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      p.init(x, y, color, speed, life, opts);
    }
  }

  /** Emit using a named preset from CONFIG. */
  emitPreset(presetName, x, y, color, opts = {}) {
    const preset = CONFIG.particles.presets[presetName];
    if (!preset) return;
    this.emit(x, y, color, preset.count, preset.speed, preset.life, opts);
  }

  /** Shift all active particles (for camera scrolling). */
  shift(dx, dy = 0) {
    for (let i = 0; i < this.pool.length; i++) {
      if (this.pool[i].active) {
        this.pool[i].x -= dx;
        this.pool[i].y -= dy;
      }
    }
  }

  update() {
    for (let i = 0; i < this.pool.length; i++) {
      this.pool[i].update();
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.pool.length; i++) {
      this.pool[i].draw(ctx);
    }
  }

  /** Count of currently active particles (debug). */
  get activeCount() {
    let n = 0;
    for (let i = 0; i < this.pool.length; i++) {
      if (this.pool[i].active) n++;
    }
    return n;
  }
}
