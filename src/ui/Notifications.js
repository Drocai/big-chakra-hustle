/**
 * Notifications — Non-blocking floating text system.
 * Replaces old alert() from level1.html with canvas-rendered popups.
 */
import { CONFIG } from '../config.js';

class Notification {
  constructor(text, x, y, color, size, duration) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.life = duration;
    this.maxLife = duration;
    this.vy = -1.5;
  }

  get isDone() { return this.life <= 0; }

  update() {
    this.y += this.vy;
    this.vy *= 0.97; // decelerate
    this.life--;
  }

  draw(ctx) {
    const alpha = Math.min(1, this.life / (this.maxLife * 0.3));
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${this.size}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fillText(this.text, this.x, this.y);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }
}

export class NotificationSystem {
  constructor() {
    this.notifications = [];
  }

  /** Show a floating notification. */
  show(text, x, y, opts = {}) {
    this.notifications.push(new Notification(
      text, x, y,
      opts.color || '#fff',
      opts.size || 16,
      opts.duration || 60
    ));
  }

  /** Show a random affirmation at screen center. */
  showAffirmation(screenWidth) {
    const text = CONFIG.affirmations[Math.floor(Math.random() * CONFIG.affirmations.length)];
    this.show(text, screenWidth / 2, 100, {
      color: CONFIG.colors.accent,
      size: 18,
      duration: 40
    });
  }

  /** Show score popup at position. */
  showScore(points, combo, x, y) {
    const text = combo > 1 ? `+${points} x${combo}` : `+${points}`;
    this.show(text, x, y, {
      color: CONFIG.colors.gold,
      size: combo > 3 ? 22 : 16,
      duration: 45
    });
  }

  /** Show damage number. */
  showDamage(amount, x, y) {
    this.show(`-${amount}`, x, y, {
      color: CONFIG.colors.healthRed,
      size: 20,
      duration: 40
    });
  }

  update() {
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      this.notifications[i].update();
      if (this.notifications[i].isDone) {
        this.notifications.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.notifications.length; i++) {
      this.notifications[i].draw(ctx);
    }
  }
}
