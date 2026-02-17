/**
 * DialogSystem — Typewriter text box for boss intros and chakra unlock moments.
 */

export class DialogSystem {
  constructor() {
    this.active = false;
    this.text = '';
    this.displayText = '';
    this.charIndex = 0;
    this.speed = 2; // frames per character
    this._frameCounter = 0;
    this.color = '#fff';
    this.speaker = '';
    this.onComplete = null;
  }

  show(text, opts = {}) {
    this.active = true;
    this.text = text;
    this.displayText = '';
    this.charIndex = 0;
    this._frameCounter = 0;
    this.color = opts.color || '#fff';
    this.speaker = opts.speaker || '';
    this.onComplete = opts.onComplete || null;
  }

  skip() {
    if (this.charIndex < this.text.length) {
      // Show all text immediately
      this.displayText = this.text;
      this.charIndex = this.text.length;
    } else {
      // Close dialog
      this.active = false;
      if (this.onComplete) this.onComplete();
    }
  }

  update() {
    if (!this.active) return;
    if (this.charIndex >= this.text.length) return;

    this._frameCounter++;
    if (this._frameCounter >= this.speed) {
      this._frameCounter = 0;
      this.charIndex++;
      this.displayText = this.text.substring(0, this.charIndex);
    }
  }

  draw(ctx, width, height) {
    if (!this.active) return;

    const boxH = 100;
    const boxY = height - boxH - 20;
    const margin = 40;

    // Box background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(margin, boxY, width - margin * 2, boxH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin, boxY, width - margin * 2, boxH);

    // Speaker name
    if (this.speaker) {
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = this.color;
      ctx.fillText(this.speaker, margin + 12, boxY + 20);
    }

    // Text with cursor
    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#ddd';
    const textY = this.speaker ? boxY + 42 : boxY + 30;

    // Word wrap
    const maxW = width - margin * 2 - 24;
    const words = this.displayText.split(' ');
    let line = '';
    let lineY = textY;

    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxW) {
        ctx.fillText(line, margin + 12, lineY);
        line = word + ' ';
        lineY += 18;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, margin + 12, lineY);

    // Blinking cursor
    if (this.charIndex < this.text.length) {
      const cursorX = margin + 12 + ctx.measureText(line).width;
      if (Math.floor(Date.now() / 300) % 2 === 0) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cursorX, lineY - 12, 8, 14);
      }
    } else {
      // "Continue" prompt
      ctx.font = '11px monospace';
      ctx.fillStyle = '#777';
      ctx.textAlign = 'right';
      ctx.fillText('[ENTER]', width - margin - 12, boxY + boxH - 12);
      ctx.textAlign = 'left';
    }
  }
}
