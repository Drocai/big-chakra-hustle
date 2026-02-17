/**
 * CoherenceMinigame — Simon-like sequence game with 7 chakra-colored buttons.
 * Ported from archive app.js. HRV-inspired timing coherence scoring.
 * Renders as canvas overlay, triggered at Coherence Shrines.
 */
import { CHAKRAS } from '../data/ChakraData.js';

const CHAKRA_NAMES = ["Root", "Sacral", "Solar", "Heart", "Throat", "Third Eye", "Crown"];

export class CoherenceMinigame {
  constructor(audioEngine) {
    this.audio = audioEngine;
    this.active = false;

    this.sequence = [];
    this.inputStep = 0;
    this.round = 0;
    this.maxRounds = 3;
    this.readyForInput = false;
    this.breathTiming = [];
    this.coherenceScore = 0;
    this.statusText = '';
    this.flashIndex = -1;
    this._flashTimer = 0;
    this._showing = false;
    this._showIndex = 0;

    // Result callback
    this.onComplete = null;
    this.completed = false;

    // Button hover tracking
    this.hoveredButton = -1;
  }

  start(onComplete) {
    this.active = true;
    this.completed = false;
    this.sequence = [];
    this.inputStep = 0;
    this.round = 0;
    this.breathTiming = [];
    this.coherenceScore = 0;
    this.onComplete = onComplete;
    this._nextRound();
  }

  close() {
    this.active = false;
  }

  _nextRound() {
    this.round++;
    this.sequence.push(Math.floor(Math.random() * 7));
    this.statusText = `Round ${this.round}/${this.maxRounds}: Watch the sequence...`;
    this.inputStep = 0;
    this.readyForInput = false;
    this.breathTiming = [];
    this._showSequence(0);
  }

  _showSequence(i) {
    if (i >= this.sequence.length) {
      this.statusText = 'Repeat the sequence with steady breath';
      this.readyForInput = true;
      this.flashIndex = -1;
      return;
    }

    this._showing = true;
    this._showIndex = i;
    this.flashIndex = this.sequence[i];
    this._flashTimer = 18;

    if (this.audio) {
      const freq = CHAKRAS[this.sequence[i]].frequency;
      this.audio.beep(freq / 2, 0.14, 'sine');
    }

    setTimeout(() => {
      this.flashIndex = -1;
      setTimeout(() => this._showSequence(i + 1), 200);
    }, 300);
  }

  handleInput(input) {
    if (!this.active || !this.readyForInput) return;

    // Number keys 1-7 for buttons
    for (let i = 0; i < 7; i++) {
      if (input.justPressed(`Digit${i + 1}`)) {
        this._onPad(i);
        return;
      }
    }

    // Arrow left/right to select, enter to press
    if (input.justPressed('ArrowLeft')) {
      this.hoveredButton = (this.hoveredButton - 1 + 7) % 7;
    }
    if (input.justPressed('ArrowRight')) {
      this.hoveredButton = (this.hoveredButton + 1) % 7;
    }
    if (input.justPressed('Enter') || input.justPressed('Space')) {
      if (this.hoveredButton >= 0) {
        this._onPad(this.hoveredButton);
      }
    }

    // Close on Escape
    if (input.justPressed('Escape')) {
      this.close();
    }
  }

  _onPad(idx) {
    if (!this.readyForInput) return;

    // Flash
    this.flashIndex = idx;
    setTimeout(() => { this.flashIndex = -1; }, 120);

    // Audio
    if (this.audio) {
      this.audio.beep(CHAKRAS[idx].frequency / 2, 0.1, 'sine');
    }

    // Record timing
    this.breathTiming.push(Date.now());

    if (idx === this.sequence[this.inputStep]) {
      this.inputStep++;

      if (this.inputStep === this.sequence.length) {
        // Calculate coherence
        const coherence = this._calculateCoherence(this.breathTiming);
        this.coherenceScore = Math.min(3.0, this.coherenceScore + coherence);

        if (this.round >= this.maxRounds) {
          this.completed = true;
          this.statusText = 'Ritual Complete! +5 Star Tokens';

          const bonus = this.coherenceScore >= 2.0 ? 2 : 0;
          if (this.onComplete) {
            this.onComplete({ tokens: 5 + bonus, coherence: this.coherenceScore });
          }
        } else {
          this.statusText = 'Perfect. Next round...';
          setTimeout(() => this._nextRound(), 500);
        }
      } else {
        this.statusText = `Good... ${this.sequence.length - this.inputStep} more`;
      }
    } else {
      this.statusText = 'Missed. Try again from start.';
      this.inputStep = 0;
      this.readyForInput = false;
      this.breathTiming = [];
      setTimeout(() => this._showSequence(0), 600);
    }
  }

  _calculateCoherence(timings) {
    if (timings.length < 2) return 0.1;
    const intervals = [];
    for (let i = 1; i < timings.length; i++) {
      intervals.push(timings[i] - timings[i - 1]);
    }
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0, 1 - (stdDev / 1000));
  }

  update() {
    if (this._flashTimer > 0) this._flashTimer--;
  }

  draw(ctx, width, height, frameCount) {
    if (!this.active) return;

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.fillStyle = '#73fbd3';
    ctx.fillText('COHERENCE TRAINING', cx, cy - 140);

    // Status
    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(this.statusText, cx, cy - 110);

    // 7 chakra buttons
    const btnW = 60;
    const btnH = 70;
    const totalW = 7 * btnW + 6 * 10;
    const startX = cx - totalW / 2;

    for (let i = 0; i < 7; i++) {
      const bx = startX + i * (btnW + 10);
      const by = cy - 40;
      const isFlashing = this.flashIndex === i;
      const isHovered = this.hoveredButton === i;

      // Button background
      ctx.fillStyle = isFlashing ? CHAKRAS[i].color : (isHovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)');
      ctx.strokeStyle = isFlashing ? CHAKRAS[i].color : (isHovered ? CHAKRAS[i].color : 'rgba(255,255,255,0.15)');
      ctx.lineWidth = isFlashing ? 3 : 1;

      if (isFlashing) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = CHAKRAS[i].color;
      }

      ctx.fillRect(bx, by, btnW, btnH);
      ctx.strokeRect(bx, by, btnW, btnH);
      ctx.shadowBlur = 0;

      // Label
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = isFlashing ? '#000' : CHAKRAS[i].color;
      ctx.fillText(CHAKRA_NAMES[i], bx + btnW / 2, by + btnH / 2 + 4);

      // Key hint
      ctx.font = '9px monospace';
      ctx.fillStyle = '#555';
      ctx.fillText(`${i + 1}`, bx + btnW / 2, by + btnH - 6);
    }

    // Coherence meter
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = this.coherenceScore >= 2 ? '#4ade80' : (this.coherenceScore >= 1 ? '#73fbd3' : '#a78bfa');
    ctx.fillText(`Coherence: ${this.coherenceScore.toFixed(1)} / 3.0`, cx, cy + 60);

    // Close hint
    if (this.completed) {
      const alpha = 0.5 + Math.sin(frameCount * 0.08) * 0.5;
      ctx.globalAlpha = alpha;
      ctx.font = '14px monospace';
      ctx.fillStyle = '#00ffff';
      ctx.fillText('Press ESC to continue', cx, cy + 100);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}
