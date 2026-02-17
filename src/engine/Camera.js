/**
 * Camera — Replaces the inline scroll logic with lerp follow, shake, and zoom.
 */
import { CONFIG } from '../config.js';

export class Camera {
  constructor(width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.zoom = CONFIG.camera.defaultZoom;

    // Shake
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;

    // Target tracking
    this.targetX = 0;
    this.targetY = 0;

    // World offset (accumulated scroll — used to shift entities)
    this.worldX = 0;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  /** Follow a target entity (the player). */
  follow(target) {
    // Horizontal: keep player at ~40% from left
    const desiredX = target.x - this.width * CONFIG.camera.followThreshold;
    if (desiredX > 0) {
      const dx = desiredX * CONFIG.camera.lerpSpeed;
      this.worldX += dx;
      // Return how much to shift all entities
      return dx;
    }
    return 0;
  }

  /** Trigger screen shake. */
  shake(intensity) {
    this.shakeIntensity = Math.min(intensity, CONFIG.camera.shakeMax);
  }

  /** Update shake decay. */
  update() {
    if (this.shakeIntensity > 0.5) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity *= CONFIG.camera.shakeDecay;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeIntensity = 0;
    }
  }

  /** Apply camera transform to canvas context. */
  applyTransform(ctx) {
    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);
    if (this.zoom !== 1) {
      ctx.translate(this.width / 2, this.height / 2);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-this.width / 2, -this.height / 2);
    }
  }

  /** Restore canvas after camera transform. */
  restoreTransform(ctx) {
    ctx.restore();
  }
}
