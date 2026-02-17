/**
 * Platform — Extended from prototype with themed rendering support.
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
    ctx.fillStyle = '#000';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.glowColor;

    ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.fillRect(this.x, this.y, this.w, this.h);

    ctx.shadowBlur = 0;

    // Top highlight
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, 5);
    ctx.globalAlpha = 1;
  }
}
