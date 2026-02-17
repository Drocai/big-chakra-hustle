/**
 * BossBase — Multi-phase boss system.
 * 3 phases (new attack pattern each 33%), invulnerability transitions,
 * screen shake, defeat → chakra power unlock + particle explosion.
 */
import { CONFIG } from '../../config.js';
import { CHAKRAS } from '../../data/ChakraData.js';

export class BossBase {
  constructor(x, y, worldIndex) {
    this.x = x;
    this.y = y;
    this.worldIndex = worldIndex;
    this.chakra = CHAKRAS[worldIndex % 7];

    // Override in subclasses
    this.w = 80;
    this.h = 80;
    this.maxHP = 300;
    this.hp = this.maxHP;
    this.contactDamage = 20;
    this.scoreValue = 500;

    // Phase management
    this.phase = 1; // 1, 2, 3
    this._phaseTransitioning = false;
    this._transitionTimer = 0;
    this._invulnerable = false;

    // State
    this.active = false;
    this.defeated = false;
    this.facingRight = false;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0.3;

    // Attack cooldown
    this.attackTimer = 0;
    this.attackCooldown = 90;
    this._attackPattern = 0;

    // Visual
    this.hurtFlash = 0;
    this.name = this.chakra.bossName;
    this.introShown = false;
  }

  get phaseThresholds() {
    return [this.maxHP * 0.66, this.maxHP * 0.33, 0];
  }

  activate() {
    this.active = true;
    this.hp = this.maxHP;
    this.phase = 1;
  }

  takeDamage(amount, knockbackDir = 0, particles = null) {
    if (this._invulnerable || this.defeated || this._phaseTransitioning) return;

    this.hp -= amount;
    this.hurtFlash = 10;

    if (particles) {
      particles.emitPreset('hit', this.x + this.w / 2, this.y + this.h / 2, this.chakra.color);
    }

    // Check phase transitions
    if (this.phase === 1 && this.hp <= this.phaseThresholds[0]) {
      this._startPhaseTransition(2);
    } else if (this.phase === 2 && this.hp <= this.phaseThresholds[1]) {
      this._startPhaseTransition(3);
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.defeated = true;
    }
  }

  _startPhaseTransition(newPhase) {
    this._phaseTransitioning = true;
    this._invulnerable = true;
    this._transitionTimer = 60;
    this.phase = newPhase;
    this.vx = 0;
    this.vy = 0;
  }

  update(player, platforms, particles, camera, frameCount) {
    if (!this.active || this.defeated) return;

    this.hurtFlash = Math.max(0, this.hurtFlash - 1);

    // Phase transition
    if (this._phaseTransitioning) {
      this._transitionTimer--;
      if (this._transitionTimer <= 0) {
        this._phaseTransitioning = false;
        this._invulnerable = false;
      }
      // Shake during transition
      if (camera && this._transitionTimer > 30) camera.shake(8);
      return;
    }

    // Attack cooldown
    if (this.attackTimer > 0) {
      this.attackTimer--;
    }

    // Face player
    this.facingRight = player.x > this.x;

    // Phase-specific AI
    this._updatePhase(player, platforms, particles, camera, frameCount);

    // Apply gravity
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;

    // Platform collision
    for (let i = 0; i < platforms.length; i++) {
      const p = platforms[i];
      if (
        this.x < p.x + p.w &&
        this.x + this.w > p.x &&
        this.y + this.h > p.y &&
        this.y + this.h < p.y + p.h + 20 &&
        this.vy >= 0
      ) {
        this.vy = 0;
        this.y = p.y - this.h;
      }
    }
  }

  /** Override in subclasses for unique attack patterns. */
  _updatePhase(player, platforms, particles, camera, frameCount) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distSq = dx * dx + dy * dy;

    // Default: chase + attack
    const speed = 1 + this.phase * 0.5;
    if (distSq > 3600) { // 60*60
      this.vx = (dx > 0 ? 1 : -1) * speed;
    } else {
      this.vx *= 0.8;
    }

    // Attack when close and cooldown ready
    if (distSq < 14400 && this.attackTimer <= 0) { // 120*120
      this._attack(player, particles, camera);
      this.attackTimer = this.attackCooldown - this.phase * 10;
    }
  }

  _attack(player, particles, camera) {
    // Default attack: charge
    const dir = this.facingRight ? 1 : -1;
    this.vx = dir * (8 + this.phase * 3);
    this.vy = -5;
    if (camera) camera.shake(4);
    if (particles) {
      particles.emit(this.x + this.w / 2, this.y + this.h, this.chakra.color, 10, 6, 15);
    }
  }

  /** Check contact damage with player. */
  collidesWithPlayer(player) {
    if (this.defeated || !this.active || player.invincible > 0) return false;
    return (
      this.x < player.x + player.w &&
      this.x + this.w > player.x &&
      this.y < player.y + player.h &&
      this.y + this.h > player.y
    );
  }

  /** Check if player attack hits boss. */
  hitByAttack(player) {
    if (this.defeated || !this.active || !player.attacking || this._invulnerable) return false;
    const hb = player.attackHitbox;
    return (
      this.x < hb.x + hb.w &&
      this.x + this.w > hb.x &&
      this.y < hb.y + hb.h &&
      this.y + this.h > hb.y
    );
  }

  draw(ctx, frameCount) {
    if (!this.active) return;

    // Death fade
    if (this.defeated) {
      ctx.globalAlpha = 0.5;
    }

    // Hurt flash
    const color = this.hurtFlash > 0 ? '#ffffff' : this.chakra.color;

    // Phase transition glow
    if (this._phaseTransitioning) {
      ctx.shadowBlur = 30 + Math.sin(frameCount * 0.3) * 20;
      ctx.shadowColor = this.chakra.color;
    }

    ctx.fillStyle = color;
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

    // Draw boss body (override in subclasses)
    this._drawBody(ctx, frameCount);

    ctx.restore();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // HP bar above boss
    if (!this.defeated) {
      this._drawHPBar(ctx);
    }
  }

  _drawBody(ctx, frameCount) {
    // Outer aura
    ctx.save();
    ctx.globalAlpha = 0.12 + Math.sin(frameCount * 0.05) * 0.05;
    ctx.fillStyle = this.chakra.color;
    ctx.shadowBlur = 40;
    ctx.shadowColor = this.chakra.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.w * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Main body — rotating polygon based on phase
    const sides = 6 + this.phase * 2;
    ctx.save();
    ctx.rotate(frameCount * 0.01 * this.phase);
    ctx.shadowBlur = 25;
    ctx.shadowColor = this.chakra.color;
    ctx.fillStyle = this.chakra.color;
    this._bossPolygon(ctx, 0, 0, this.w * 0.5, sides);
    ctx.fill();

    // Inner wireframe
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    this._bossPolygon(ctx, 0, 0, this.w * 0.35, sides);
    ctx.stroke();

    // Core
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#ffffff';
    this._bossPolygon(ctx, 0, 0, this.w * 0.15, sides);
    ctx.fill();
    ctx.restore();

    // Phase indicator — orbiting dots
    for (let i = 0; i < this.phase; i++) {
      const angle = frameCount * 0.03 + (i * Math.PI * 2) / this.phase;
      const ox = Math.cos(angle) * (this.w * 0.6);
      const oy = Math.sin(angle) * (this.w * 0.6);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.chakra.color;
      ctx.beginPath();
      ctx.arc(ox, oy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  _bossPolygon(ctx, cx, cy, radius, sides) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i * Math.PI * 2) / sides - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  _drawHPBar(ctx) {
    const barW = this.w + 20;
    const barH = 6;
    const x = this.x - 10;
    const y = this.y - 15;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x, y, barW, barH);

    const pct = this.hp / this.maxHP;
    ctx.fillStyle = this.chakra.color;
    ctx.fillRect(x, y, barW * pct, barH);

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barW, barH);

    // Boss name
    ctx.font = 'bold 10px "Orbitron", monospace';
    ctx.fillStyle = this.chakra.color;
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x + this.w / 2, y - 4);
    ctx.textAlign = 'left';
  }
}
