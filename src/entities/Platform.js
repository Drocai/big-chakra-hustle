/**
 * Platform — Dark void platforms with aggressive neon edge glow.
 * Trap Fantasy mandate: dark bodies, glowing edges, inner grid.
 */
import { CONFIG } from '../config.js';

export class Platform {
  constructor(x, y, w, h = CONFIG.platform.height) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = CONFIG.platform.color;
    this.glowColor = CONFIG.platform.color;
  }

  /** Set theme colors for per-chakra worlds. */
  setTheme(color, glowColor) {
    this.color = color;
    this.glowColor = glowColor || color;
  }

  draw(ctx) {
    ctx.save();

    // Platform body — near-black
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(this.x, this.y, this.w, this.h);

    // Inner subtle grid pattern
    ctx.strokeStyle = this.color + '15';
    ctx.lineWidth = 0.5;
    for (let gx = this.x + 10; gx < this.x + this.w; gx += 10) {
      ctx.beginPath();
      ctx.moveTo(gx, this.y);
      ctx.lineTo(gx, this.y + this.h);
      ctx.stroke();
    }

    // Neon edge glow — top edge (brightest)
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.glowColor;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;

    // Top edge (primary glow)
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.w, this.y);
    ctx.stroke();

    // Side edges (dimmer)
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, this.y + this.h);
    ctx.moveTo(this.x + this.w, this.y);
    ctx.lineTo(this.x + this.w, this.y + this.h);
    ctx.stroke();

    // Bottom edge (subtle)
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.h);
    ctx.lineTo(this.x + this.w, this.y + this.h);
    ctx.stroke();

    ctx.restore();
  }
}
