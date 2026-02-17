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

    ctx.shadowBlur = 20;
    ctx.shadowColor = colors.glow;
    ctx.fillStyle = colors.main;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

    // Tilt with velocity
    const tilt = this.vx * 2;
    ctx.rotate(tilt * Math.PI / 180);

    if (this.zodiac === 'AIRES') {
      // Rectangular body with horns
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-this.w / 2 - 5, -this.h / 2 - 5, 10, 10);
      ctx.fillRect(this.w / 2 - 5, -this.h / 2 - 5, 10, 10);
    } else {
      // Rounded body with floating orb
      ctx.beginPath();
      ctx.roundRect(-this.w / 2, -this.h / 2, this.w, this.h, 10);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, -this.h / 2 - 10, 5 + Math.sin(frameCount * 0.2) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.shadowBlur = 0;

    // Draw attack slash
    if (this.attacking) {
      this._drawAttack(ctx, frameCount);
    }
  }

  _drawAttack(ctx, frameCount) {
    const hb = this.attackHitbox;
    const progress = 1 - (this.attackTimer / CONFIG.player.attackDuration);

    ctx.save();
    ctx.globalAlpha = 0.6 * (1 - progress);
    ctx.strokeStyle = this.colors.glow;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.colors.glow;

    // Arc slash
    const cx = this.facingRight ? this.x + this.w : this.x;
    const cy = this.y + this.h / 2;
    const startAngle = this.facingRight ? -Math.PI / 3 : Math.PI - Math.PI / 3;
    const sweep = (Math.PI * 2 / 3) * progress;

    ctx.beginPath();
    ctx.arc(cx, cy, CONFIG.player.attackWidth * 0.8, startAngle, startAngle + sweep);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
