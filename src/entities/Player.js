/**
 * Player — Extended from the prototype with HP, attack, variable jump,
 * knockback, and invincibility frames.
 */
import { CONFIG } from '../config.js';

export class Player {
  constructor(x, y, screenHeight) {
    const c = CONFIG.player;
    this.w = c.width;
    this.h = c.height;
    this.x = x || c.startX;
    this.y = y || (screenHeight - 150);
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;

    // Zodiac
    this.zodiac = 'AIRES';
    this.jumps = 0;
    this.maxJumps = CONFIG.zodiac.AIRES.maxJumps;

    // Chakra energy
    this.chakra = c.chakraMax;
    this.chakraMax = c.chakraMax;
    this.shards = 0;

    // Dash
    this.dashing = false;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.facingRight = true;

    // HP
    this.hp = c.maxHP;
    this.maxHP = c.maxHP;
    this.invincible = 0; // frames remaining

    // Attack
    this.attacking = false;
    this.attackTimer = 0;
    this.attackCooldownTimer = 0;
    this.attackHitbox = { x: 0, y: 0, w: c.attackWidth, h: c.attackHeight };

    // Variable jump
    this._jumpHeld = false;
    this._jumpHeldFrames = 0;

    // Knockback
    this._knockbackTimer = 0;

    // Score
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
  }

  get zodiacConfig() {
    return CONFIG.zodiac[this.zodiac];
  }

  get colors() {
    return this.zodiacConfig.colors;
  }

  switchZodiac(particles) {
    if (particles) {
      particles.emitPreset('switchZodiac', this.x + this.w / 2, this.y + this.h / 2, '#ffffff');
    }

    if (this.zodiac === 'AIRES') {
      this.zodiac = 'KOIDON';
    } else {
      this.zodiac = 'AIRES';
    }
    this.maxJumps = this.zodiacConfig.maxJumps;
  }

  jump(particles) {
    if (this.grounded || this.jumps < this.maxJumps) {
      this.vy = this.zodiacConfig.jumpForce;
      this.jumps++;
      this.grounded = false;
      this._jumpHeld = true;
      this._jumpHeldFrames = 0;

      if (particles) {
        particles.emitPreset('jump', this.x + this.w / 2, this.y + this.h, this.colors.glow);
      }
    }
  }

  /** Call when jump key is released for variable jump height. */
  releaseJump() {
    if (this._jumpHeld && this.vy < 0) {
      this.vy *= CONFIG.player.variableJumpCut;
    }
    this._jumpHeld = false;
  }

  dash(particles, camera) {
    const c = CONFIG.player;
    if (this.chakra >= c.dashCost && !this.dashing && this.dashCooldownTimer <= 0) {
      this.dashing = true;
      this.dashTimer = c.dashDuration;
      this.dashCooldownTimer = c.dashCooldown;
      this.chakra -= c.dashCost;

      const dir = this.facingRight ? 1 : -1;
      this.vx = dir * this.zodiacConfig.dashSpeed;
      this.vy = 0;

      if (camera) camera.shake(5);
    }
  }

  attack() {
    const c = CONFIG.player;
    if (!this.attacking && this.attackCooldownTimer <= 0) {
      this.attacking = true;
      this.attackTimer = c.attackDuration;
      this.attackCooldownTimer = c.attackCooldown;
    }
  }

  takeDamage(amount, knockbackDir = 0) {
    if (this.invincible > 0) return;
    if (this._shieldTimer > 0) { this._shieldTimer -= 30; return; } // Radiant Shield absorbs

    this.hp -= amount;
    this.invincible = CONFIG.player.invincibilityFrames;
    this.combo = 0;
    this.comboTimer = 0;

    // Knockback
    if (knockbackDir !== 0) {
      this.vx = knockbackDir * CONFIG.player.knockbackForce;
      this.vy = -6;
      this._knockbackTimer = 10;
    }
  }

  get isDead() {
    return this.hp <= 0;
  }

  addScore(points) {
    this.combo++;
    this.comboTimer = 120; // ~2 seconds
    const multiplier = Math.min(this.combo, 10);
    this.score += points * multiplier;
  }

  update(input, platforms, shards, particles, frameCount, screenWidth, screenHeight) {
    const zConfig = this.zodiacConfig;
    const c = CONFIG.player;

    // Invincibility countdown
    if (this.invincible > 0) this.invincible--;

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    // Cooldowns
    if (this.dashCooldownTimer > 0) this.dashCooldownTimer--;
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer--;

    // Attack timer
    if (this.attacking) {
      this.attackTimer--;
      if (this.attackTimer <= 0) this.attacking = false;
    }

    // Update attack hitbox position
    if (this.attacking) {
      this.attackHitbox.x = this.facingRight
        ? this.x + this.w
        : this.x - c.attackWidth;
      this.attackHitbox.y = this.y + (this.h - c.attackHeight) / 2;
    }

    // --- Movement ---
    if (this.dashTimer > 0) {
      // Dashing — limited control
      this.dashTimer--;
      if (frameCount % 2 === 0 && particles) {
        particles.emitPreset('dash', this.x + this.w / 2, this.y + this.h / 2, this.colors.main);
      }
    } else {
      this.dashing = false;

      if (this._knockbackTimer > 0) {
        this._knockbackTimer--;
      } else {
        // Normal movement
        if (input.actions.right) {
          this.vx += c.acceleration;
          if (this.vx > zConfig.speed) this.vx = zConfig.speed;
          this.facingRight = true;
        } else if (input.actions.left) {
          this.vx -= c.acceleration;
          if (this.vx < -zConfig.speed) this.vx = -zConfig.speed;
          this.facingRight = false;
        } else {
          this.vx *= c.deceleration;
        }
      }

      // Gravity
      this.vy += zConfig.gravity;

      // Variable jump — cut upward velocity when released
      if (this._jumpHeld) {
        this._jumpHeldFrames++;
        if (!input.actions.jump) {
          this.releaseJump();
        }
      }
    }

    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;

    // --- Platform collisions ---
    this.grounded = false;

    for (let i = 0; i < platforms.length; i++) {
      const p = platforms[i];
      if (
        this.x < p.x + p.w &&
        this.x + this.w > p.x &&
        this.y + this.h > p.y &&
        this.y + this.h < p.y + p.h + 20 &&
        this.vy >= 0
      ) {
        this.grounded = true;
        this.vy = 0;
        this.y = p.y - this.h;
        this.jumps = 0;
      }
    }

    // Floor collision
    if (this.y + this.h > screenHeight) {
      this.y = screenHeight - this.h;
      this.vy = 0;
      this.grounded = true;
      this.jumps = 0;
    }

    // Wall clamping
    if (this.x < 0) this.x = 0;
    if (this.x + this.w > screenWidth) this.x = screenWidth - this.w;

    // --- Collect shards ---
    for (let i = 0; i < shards.length; i++) {
      const s = shards[i];
      if (!s.collected &&
        this.x < s.x + s.size &&
        this.x + this.w > s.x &&
        this.y < s.y + s.size &&
        this.y + this.h > s.y
      ) {
        s.collected = true;
        this.shards++;
        this.addScore(10);

        if (s.type === 'health') {
          this.hp = Math.min(this.hp + 20, this.maxHP);
        } else if (s.type === 'token') {
          // Token collection handled by TokenEconomy in Phase 8
        } else {
          this.chakra = Math.min(this.chakra + CONFIG.shard.chakraReward, this.chakraMax);
        }

        if (particles) {
          particles.emitPreset('collectShard', s.x, s.y, '#ffffff');
        }
      }
    }

    // Regen chakra
    if (this.chakra < this.chakraMax) {
      this.chakra += c.chakraRegen;
    }
  }

  draw(ctx, frameCount) {
    const colors = this.colors;

    // Invincibility flash
    if (this.invincible > 0 && frameCount % 4 < 2) return;

    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // Tilt with velocity
    const tilt = this.vx * 1.5;
    ctx.rotate(tilt * Math.PI / 180);

    if (this.zodiac === 'AIRES') {
      this._drawAires(ctx, frameCount, colors);
    } else {
      this._drawKoidon(ctx, frameCount, colors);
    }

    ctx.restore();

    // Draw attack slash
    if (this.attacking) {
      this._drawAttack(ctx, frameCount);
    }

    // Energy trail
    if (Math.abs(this.vx) > 2 || this.dashing) {
      this._drawTrail(ctx, frameCount);
    }
  }

  /** AIRES: Floating icosahedron reactor core + torus horn segments. Aggressive pulse. */
  _drawAires(ctx, frameCount, colors) {
    const pulse = 1 + Math.sin(frameCount * 0.15) * 0.06;
    const coreRadius = this.w * 0.45 * pulse;

    // Outer aura
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.shadowBlur = 35;
    ctx.shadowColor = colors.main;
    ctx.fillStyle = colors.main;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius + 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Core: rotating icosahedron (drawn as multi-sided polygon)
    ctx.save();
    ctx.rotate(frameCount * 0.03);
    ctx.shadowBlur = 25;
    ctx.shadowColor = colors.main;
    ctx.fillStyle = colors.main;
    this._polygon(ctx, 0, 0, coreRadius, 6);
    ctx.fill();

    // Inner wireframe
    ctx.strokeStyle = colors.secondary || '#ff4d4d';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    this._polygon(ctx, 0, 0, coreRadius * 0.6, 6);
    ctx.stroke();
    ctx.restore();

    // Horn segments (floating torus pieces)
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 4;

    // Left horn
    const hornFloat = Math.sin(frameCount * 0.08) * 3;
    ctx.beginPath();
    ctx.arc(-this.w * 0.45, -this.h * 0.35 + hornFloat, 12, Math.PI * 0.8, Math.PI * 1.8);
    ctx.stroke();

    // Right horn
    ctx.beginPath();
    ctx.arc(this.w * 0.45, -this.h * 0.35 - hornFloat, 12, Math.PI * 1.2, Math.PI * 2.2);
    ctx.stroke();
    ctx.restore();

    // Eye — aggressive slit
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    const eyeX = this.facingRight ? 3 : -3;
    ctx.fillRect(eyeX - 4, -3, 8, 3);
    ctx.fillStyle = colors.main;
    ctx.fillRect(eyeX - 2, -2, 4, 2);
    ctx.restore();

    ctx.shadowBlur = 0;
  }

  /** KOIDON: Smooth capsule fuselage + floating fin planes. Fluid swim motion. */
  _drawKoidon(ctx, frameCount, colors) {
    const swimBob = Math.sin(frameCount * 0.08) * 4;
    const swimTilt = Math.sin(frameCount * 0.06) * 0.05;

    ctx.save();
    ctx.rotate(swimTilt);
    ctx.translate(0, swimBob * 0.3);

    // Outer aura
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.shadowBlur = 30;
    ctx.shadowColor = colors.main;
    ctx.fillStyle = colors.main;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.w * 0.6 + 10, this.h * 0.4 + 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Body capsule
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = colors.main;
    ctx.fillStyle = colors.main;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.w * 0.5, this.h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow core
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = colors.secondary || '#0088ff';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.w * 0.3, this.h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Tail fin — flapping
    const tailFlap = Math.sin(frameCount * 0.2) * 0.4;
    ctx.save();
    ctx.translate(-this.w * 0.45, 0);
    ctx.rotate(tailFlap);
    ctx.fillStyle = colors.main;
    ctx.globalAlpha = 0.6;
    ctx.shadowBlur = 10;
    ctx.shadowColor = colors.main;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-this.w * 0.35, -this.h * 0.25);
    ctx.lineTo(-this.w * 0.35, this.h * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Top fin
    const finWave = Math.sin(frameCount * 0.12) * 0.15;
    ctx.save();
    ctx.translate(0, -this.h * 0.35);
    ctx.rotate(finWave);
    ctx.fillStyle = colors.main;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(0, -this.h * 0.2);
    ctx.lineTo(8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Eye — soft circle
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ffffff';
    const eyeX = this.facingRight ? 6 : -6;
    ctx.beginPath();
    ctx.arc(eyeX, -2, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.secondary || '#0088ff';
    ctx.beginPath();
    ctx.arc(eyeX + (this.facingRight ? 1 : -1), -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore(); // swimTilt + swimBob
    ctx.shadowBlur = 0;
  }

  /** Draw energy trail behind player when moving fast. */
  _drawTrail(ctx, frameCount) {
    const colors = this.colors;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.2;
    const trailLen = this.dashing ? 6 : 3;
    for (let i = 1; i <= trailLen; i++) {
      const offset = i * 5 * (this.facingRight ? 1 : -1);
      const alpha = 0.15 / i;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = colors.main;
      ctx.beginPath();
      ctx.arc(
        this.x + this.w / 2 - offset * (this.facingRight ? 1 : -1),
        this.y + this.h / 2,
        this.w * 0.3 / i, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /** Draw polygon path (utility for geometric rendering). */
  _polygon(ctx, cx, cy, radius, sides) {
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

  _drawAttack(ctx, frameCount) {
    const progress = 1 - (this.attackTimer / CONFIG.player.attackDuration);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.7 * (1 - progress);
    ctx.strokeStyle = this.colors.glow;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 25;
    ctx.shadowColor = this.colors.glow;

    // Arc slash
    const cx = this.facingRight ? this.x + this.w : this.x;
    const cy = this.y + this.h / 2;
    const startAngle = this.facingRight ? -Math.PI / 3 : Math.PI - Math.PI / 3;
    const sweep = (Math.PI * 2 / 3) * progress;

    ctx.beginPath();
    ctx.arc(cx, cy, CONFIG.player.attackWidth * 0.9, startAngle, startAngle + sweep);
    ctx.stroke();

    // Inner slash glow
    ctx.globalAlpha = 0.3 * (1 - progress);
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, CONFIG.player.attackWidth * 0.9, startAngle, startAngle + sweep);
    ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
