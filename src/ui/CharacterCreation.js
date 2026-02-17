/**
 * CharacterCreation — Canvas-rendered birth chart selection screen.
 * Select Sun/Moon/Rising, preview stats, start run.
 */
import { SIGNS, generateNatalChart, getElement } from '../data/astroEngine.js';
import { CHAKRAS } from '../data/ChakraData.js';
import { CONFIG } from '../config.js';

const ELEMENT_COLORS = {
  Fire: '#ff4444',
  Earth: '#88cc44',
  Air: '#44ccff',
  Water: '#4488ff'
};

const SIGN_SYMBOLS = [
  '\u2648', '\u2649', '\u264A', '\u264B', '\u264C', '\u264D',
  '\u264E', '\u264F', '\u2650', '\u2651', '\u2652', '\u2653'
];

export class CharacterCreation {
  constructor() {
    this.sunIndex = 0;
    this.moonIndex = 3;
    this.risingIndex = 4;
    this.activeRow = 0; // 0=sun, 1=moon, 2=rising
    this.chart = null;
    this._regenerateChart();
  }

  _regenerateChart() {
    this.chart = generateNatalChart({
      sun: SIGNS[this.sunIndex],
      moon: SIGNS[this.moonIndex],
      rising: SIGNS[this.risingIndex]
    });
  }

  handleInput(input) {
    let changed = false;

    if (input.actionJustPressed('jump') || input.justPressed('ArrowUp')) {
      this.activeRow = (this.activeRow + 2) % 3;
    }
    if (input.justPressed('ArrowDown')) {
      this.activeRow = (this.activeRow + 1) % 3;
    }

    if (input.justPressed('ArrowRight')) {
      this._changeSelection(1);
      changed = true;
    }
    if (input.justPressed('ArrowLeft')) {
      this._changeSelection(-1);
      changed = true;
    }

    if (changed) this._regenerateChart();

    // Confirm
    if (input.justPressed('Enter') || input.justPressed('KeyZ')) {
      return this.chart;
    }
    return null;
  }

  _changeSelection(dir) {
    switch (this.activeRow) {
      case 0: this.sunIndex = (this.sunIndex + dir + 12) % 12; break;
      case 1: this.moonIndex = (this.moonIndex + dir + 12) % 12; break;
      case 2: this.risingIndex = (this.risingIndex + dir + 12) % 12; break;
    }
  }

  draw(ctx, width, height, frameCount) {
    // Dimmed background
    ctx.fillStyle = 'rgba(5, 5, 16, 0.95)';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    let y = 40;

    // Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 26px "Orbitron", monospace';
    const grad = ctx.createLinearGradient(cx - 200, y, cx + 200, y);
    grad.addColorStop(0, '#a78bfa');
    grad.addColorStop(1, '#73fbd3');
    ctx.fillStyle = grad;
    ctx.fillText('COSMIC BLUEPRINT', cx, y);
    y += 18;

    ctx.font = '12px "Rajdhani", monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('Select your Sun, Moon, and Rising signs', cx, y);
    y += 30;

    // Sign selectors
    const labels = ['SUN', 'MOON', 'RISING'];
    const indices = [this.sunIndex, this.moonIndex, this.risingIndex];

    for (let row = 0; row < 3; row++) {
      const isActive = this.activeRow === row;
      const signIdx = indices[row];
      const sign = SIGNS[signIdx];
      const element = getElement(sign);
      const color = ELEMENT_COLORS[element] || '#fff';

      // Row background
      if (isActive) {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(cx - 200, y - 18, 400, 50);
      }

      // Label
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = isActive ? '#fff' : '#666';
      ctx.fillText(labels[row], cx, y);

      // Arrows + sign name
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = color;

      const arrowAlpha = isActive ? 0.5 + Math.sin(frameCount * 0.1) * 0.5 : 0.3;
      ctx.globalAlpha = arrowAlpha;
      ctx.fillText('\u25C0', cx - 140, y + 28);
      ctx.fillText('\u25B6', cx + 125, y + 28);
      ctx.globalAlpha = 1;

      ctx.fillStyle = color;
      ctx.shadowBlur = isActive ? 10 : 0;
      ctx.shadowColor = color;
      ctx.fillText(`${SIGN_SYMBOLS[signIdx]} ${sign}`, cx, y + 28);
      ctx.shadowBlur = 0;

      ctx.font = '11px monospace';
      ctx.fillStyle = '#777';
      ctx.fillText(`${element}`, cx, y + 44);

      y += 55;
    }

    // Stat preview — only show if screen is tall enough
    if (this.chart && height > 450) {
      y += 10;
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#a78bfa';
      ctx.fillText('COSMIC STATS', cx, y);
      y += 20;

      const stats = this.chart.stats;
      const statNames = ['Vital Energy', 'Frequency', 'Focus', 'Flow', 'Power', 'Alignment'];
      const statValues = [stats.vitalEnergy, stats.frequency, stats.focus, stats.flow, stats.power, stats.alignment];

      const barW = 140;
      const barH = 10;

      for (let i = 0; i < 6; i++) {
        const sx = cx - 180 + (i % 3) * 125;
        const sy = y + Math.floor(i / 3) * 35;

        ctx.font = '10px monospace';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'left';
        ctx.fillText(statNames[i], sx - barW / 2, sy);

        // Bar bg
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(sx - barW / 2, sy + 4, barW, barH);

        // Bar fill
        const pct = statValues[i] / 100;
        const barColor = pct > 0.7 ? '#73fbd3' : pct > 0.4 ? '#a78bfa' : '#888';
        ctx.fillStyle = barColor;
        ctx.fillRect(sx - barW / 2, sy + 4, barW * pct, barH);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${statValues[i]}`, sx + barW / 2 - 25, sy + 13);
      }
      ctx.textAlign = 'center';

      // Chakra alignment preview
      y += 80;
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#73fbd3';
      ctx.fillText('CHAKRA ALIGNMENT', cx, y);
      y += 15;

      for (let i = 0; i < 7; i++) {
        const chakra = this.chart.chakras[i];
        const cData = CHAKRAS[i];
        const barX = cx - 150 + i * 44;

        // Vertical bar
        const maxBarH = 50;
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(barX, y, 30, maxBarH);

        ctx.fillStyle = cData.color;
        const fillH = maxBarH * (chakra.value / 100);
        ctx.fillRect(barX, y + maxBarH - fillH, 30, fillH);

        ctx.font = '8px monospace';
        ctx.fillStyle = '#aaa';
        ctx.fillText(cData.shortName[0], barX + 15, y + maxBarH + 12);
      }

      // Nakshatra
      y += 80;
      const nak = this.chart.moon.nakshatra;
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = CONFIG.colors.gold;
      ctx.fillText(`Nakshatra: ${nak.name}`, cx, y);
      ctx.font = '11px monospace';
      ctx.fillStyle = '#888';
      ctx.fillText(`${nak.theme}`, cx, y + 16);
    }

    // Confirm prompt — pinned to bottom, clear of content
    const alpha = 0.5 + Math.sin(frameCount * 0.08) * 0.5;
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 16px "Orbitron", monospace';
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00ffff';
    ctx.fillText('PRESS ENTER TO TRANSMIT', cx, height - 16);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    ctx.restore();
  }
}
