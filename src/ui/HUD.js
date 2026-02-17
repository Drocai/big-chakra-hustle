/**
 * HUD — "System Overlay / Terminal" heads-up display.
 * Trap Fantasy mandate: Orbitron font, skewed bars, tech readouts.
 */
import { CONFIG } from '../config.js';
import { CHAKRAS } from '../data/ChakraData.js';

const FONT_TITLE = '"Orbitron", "Rajdhani", monospace';
const FONT_BODY = '"Rajdhani", "Orbitron", monospace';
const FONT_MONO = '"Orbitron", monospace';

export class HUD {
  constructor() {
    this.tokens = 0;
  }

  draw(ctx, player, chakraPowers, width, height, frameCount, worldIndex, roomStr) {
    if (!player) return;

    const m = 16;
    const barW = 200;
    const barH = 16;

    // === HP BAR (skewed) ===
    const hpPct = player.hp / player.maxHP;
    const hpColor = hpPct > 0.5 ? CONFIG.colors.healthGreen : (hpPct > 0.25 ? '#ffaa00' : CONFIG.colors.healthRed);
    this._skewBar(ctx, m, m, barW, barH, hpPct, hpColor);

    ctx.font = `bold 10px ${FONT_MONO}`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(`HP ${Math.ceil(player.hp)}/${player.maxHP}`, m + 8, m + 12);

    // === CHAKRA ENERGY BAR (skewed) ===
    const eY = m + barH + 6;
    const ePct = player.chakra / player.chakraMax;
    this._skewBar(ctx, m, eY, barW, barH, ePct, CONFIG.colors.chakraBar);

    ctx.font = `bold 10px ${FONT_MONO}`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`ENERGY ${Math.ceil(player.chakra)}`, m + 8, eY + 12);

    // Dash cooldown indicator
    if (player.dashCooldownTimer > 0) {
      const dashPct = player.dashCooldownTimer / CONFIG.player.dashCooldown;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(m, eY, barW * dashPct, barH);
    }

    // === ZODIAC INDICATOR ===
    const zY = eY + barH + 10;
    ctx.save();
    ctx.font = `bold 14px ${FONT_TITLE}`;
    ctx.fillStyle = player.colors.main;
    ctx.shadowBlur = 12;
    ctx.shadowColor = player.colors.glow;
    ctx.fillText(player.zodiacConfig.label, m, zY + 4);
    ctx.shadowBlur = 0;
    ctx.restore();

    // === SCORE (top-right) ===
    ctx.save();
    ctx.textAlign = 'right';

    ctx.font = `bold 13px ${FONT_MONO}`;
    ctx.fillStyle = CONFIG.colors.gold;
    ctx.shadowBlur = 5;
    ctx.shadowColor = CONFIG.colors.gold;
    ctx.fillText(`SCORE ${player.score}`, width - m, m + 14);
    ctx.shadowBlur = 0;

    ctx.font = `11px ${FONT_BODY}`;
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`SHARDS ${player.shards}`, width - m, m + 30);

    // Combo
    if (player.combo > 1) {
      ctx.fillStyle = CONFIG.colors.accent;
      ctx.font = `bold 13px ${FONT_MONO}`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = CONFIG.colors.accent;
      ctx.fillText(`${player.combo}x COMBO`, width - m, m + 48);
      ctx.shadowBlur = 0;
    }

    // Star Tokens
    ctx.fillStyle = CONFIG.colors.gold;
    ctx.font = `11px ${FONT_BODY}`;
    ctx.fillText(`\u2605 ${this.tokens}`, width - m, m + 64);

    ctx.restore();

    // === WORLD PROGRESS (top-center) ===
    if (roomStr) {
      const worldColor = CHAKRAS[worldIndex % 7]?.color || '#fff';
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = `bold 12px ${FONT_MONO}`;
      ctx.fillStyle = worldColor;
      ctx.shadowBlur = 8;
      ctx.shadowColor = worldColor;
      ctx.fillText(roomStr, width / 2, m + 14);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    ctx.textAlign = 'left';

    // === POWER WHEEL ===
    if (chakraPowers) {
      chakraPowers.drawWheel(ctx, 60, height - 60, 36);
    }
  }

  /** Draw a skewed energy bar (simulated skewX via path). */
  _skewBar(ctx, x, y, w, h, pct, color) {
    const skew = 4; // pixel offset for skew

    ctx.save();

    // Background
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(x + skew, y);
    ctx.lineTo(x + w + skew, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    // Fill
    const fillW = w * Math.max(0, Math.min(1, pct));
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + skew, y);
    ctx.lineTo(x + fillW + skew, y);
    ctx.lineTo(x + fillW, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    // Border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + skew, y);
    ctx.lineTo(x + w + skew, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }
}
