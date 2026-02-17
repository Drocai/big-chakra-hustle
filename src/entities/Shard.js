/**
 * Shard — Collectible item, extended from prototype.
 * Foundation for multiple collectible types in Phase 2.
 */
import { CONFIG } from '../config.js';

export class Shard {
  constructor(x, y, type = 'chakra') {
    this.x = x;
    this.baseY = y;
    this.y = y;
    this.size = CONFIG.shard.size;
    this.collected = false;
    this.floatOffset = Math.random() * Math.PI * 2;
    this.type = type; // 'chakra', 'health', 'token'

    // Type-specific colors
    this.colors = {
      chakra: { fill: '#ffe600', glow: '#ffe600' },
      health: { fill: '#4ade80', glow: '#4ade80' },
      token: { fill: '#f5c542', glow: '#f5c542' }
    };
  }

  update(frameCount) {
    if (this.collected) return;
    this.y = this.baseY + Math.sin(frameCount * CONFIG.shard.bobSpeed + this.floatOffset) * CONFIG.shard.bobAmplitude;
  }

  draw(ctx, frameCount) {
    if (this.collected) return;
    const c = this.colors[this.type] || this.colors.chakra;

    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = c.glow;
    ctx.fillStyle = c.fill;

    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate(frameCount * CONFIG.shard.rotationSpeed);

    if (this.type === 'health') {
      // Draw diamond for health
      ctx.beginPath();
      ctx.moveTo(0, -this.size / 2);
      ctx.lineTo(this.size / 2, 0);
      ctx.lineTo(0, this.size / 2);
      ctx.lineTo(-this.size / 2, 0);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'token') {
      // Draw star for token
      this._drawStar(ctx, 0, 0, 5, this.size / 2, this.size / 4);
    } else {
      // Default: rotating square
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }

    ctx.restore();
  }

  _drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}
