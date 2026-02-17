/**
 * HUD — Canvas-rendered heads-up display.
 * Full HUD: HP bar + energy bar, score + combo, Star Tokens,
 * chakra power wheel, world progress, minimap.
 */
import { CONFIG } from '../config.js';
import { CHAKRAS } from '../data/ChakraData.js';
import { energyBar } from '../graphics/DrawLib.js';

export class HUD {
  constructor() {
    this.tokens = 0;
    this.worldName = '';
    this.roomProgress = '';
  }

  draw(ctx, player, chakraPowers, width, height, frameCount, worldIndex, roomStr) {
    if (!player) return;

    const margin = 16;
    const barW = 180;
    const barH = 14;

    // HP bar
    const hpPct = player.hp / player.maxHP;
    const hpColor = hpPct > 0.5 ? CONFIG.colors.healthGreen : (hpPct > 0.25 ? '#ffaa00' : CONFIG.colors.healthRed);
    energyBar(ctx, margin, margin, barW, barH, hpPct, hpColor);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`HP ${Math.ceil(player.hp)}/${player.maxHP}`, margin + 3, margin + 11);

    // Chakra energy bar
    const chakraY = margin + barH + 4;
    energyBar(ctx, margin, chakraY, barW, barH, player.chakra / player.chakraMax, CONFIG.colors.chakraBar);
    ctx.fillStyle = '#fff';
    ctx.fillText(`ENERGY ${Math.ceil(player.chakra)}`, margin + 3, chakraY + 11);

    // Dash cooldown overlay
    if (player.dashCooldownTimer > 0) {
      const pct = player.dashCooldownTimer / CONFIG.player.dashCooldown;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(margin, chakraY, barW * pct, barH);
    }

    // Zodiac indicator
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = player.colors.main;
    ctx.shadowBlur = 8;
    ctx.shadowColor = player.colors.glow;
    ctx.fillText(player.zodiacConfig.label, margin, chakraY + barH + 18);
    ctx.shadowBlur = 0;

    // Score (top-right)
    ctx.textAlign = 'right';
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(`SHARDS: ${player.shards}`, width - margin, margin + 14);

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = CONFIG.colors.gold;
    ctx.fillText(`SCORE: ${player.score}`, width - margin, margin + 32);

    // Combo
    if (player.combo > 1) {
      ctx.fillStyle = CONFIG.colors.accent;
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`${player.combo}x COMBO`, width - margin, margin + 50);
    }

    // Star Tokens
    ctx.fillStyle = CONFIG.colors.gold;
    ctx.font = '12px monospace';
    ctx.fillText(`\u2605 ${this.tokens}`, width - margin, margin + 68);

    // World progress (top-center)
    ctx.textAlign = 'center';
    if (roomStr) {
      const worldColor = CHAKRAS[worldIndex % 7]?.color || '#fff';
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = worldColor;
      ctx.shadowBlur = 5;
      ctx.shadowColor = worldColor;
      ctx.fillText(roomStr, width / 2, margin + 14);
      ctx.shadowBlur = 0;
    }

    ctx.textAlign = 'left';

    // Power wheel
    if (chakraPowers) {
      chakraPowers.drawWheel(ctx, 60, height - 60, 36);
    }
  }
}
