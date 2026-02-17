/**
 * Enemy — Base class with AI state machine.
 * States: IDLE, PATROL, CHASE, ATTACK, HURT, DEAD
 */
import { CONFIG } from '../config.js';

export class Enemy {
  constructor(x, y, type = 'drifter') {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    // Type-specific config
    const types = {
      drifter: {
        w: 35, h: 40, hp: 60, speed: 1.5, damage: 15,
        chaseSpeed: 3, chaseRange: 250, attackRange: 40,
        color: '#ff3333', glowColor: '#ff0000',
        patrolDistance: 120, gravity: 0.6,
        scoreValue: 50
      },
      floater: {
        w: 28, h: 28, hp: 30, speed: 1, damage: 10,
        chaseSpeed: 2.5, chaseRange: 200, attackRange: 30,
        color: '#ff66ff', glowColor: '#cc00cc',
        patrolDistance: 80, gravity: 0,
        scoreValue: 30
      },
      brute: {
        w: 45, h: 55, hp: 120, speed: 0.8, damage: 25,
        chaseSpeed: 2, chaseRange: 180, chaseRange: 180, attackRange: 50,
        color: '#ff6600', glowColor: '#cc3300',
        patrolDistance: 100, gravity: 0.6,
        scoreValue: 80
      }
    };

    const cfg = types[type] || types.drifter;
    Object.assign(this, cfg);
    this.type = type;
    this.maxHP = this.hp;

    // AI state
    this.state = 'PATROL';
    this.facingRight = Math.random() > 0.5;
    this.patrolOrigin = x;
    this.stateTimer = 0;

    // Hurt flash
    this.hurtFlash = 0;

    // Death
    this.dead = false;
    this.deathTimer = 0;

    // Platform grounding
    this.grounded = false;
  }

  takeDamage(amount, knockbackDir = 0, particles = null) {
    if (this.dead) return;

    this.hp -= amount;
    this.hurtFlash = 8;
    this.state = 'HURT';
    this.stateTimer = 12;

    // Knockback
    this.vx = knockbackDir * 5;
    this.vy = -3;

    if (particles) {
      particles.emitPreset('hit', this.x + this.w / 2, this.y + this.h / 2, this.color);
    }

    if (this.hp <= 0) {
      this.dead = true;
      this.deathTimer = 30;
      this.state = 'DEAD';

      if (particles) {
        particles.emitPreset('explosion', this.x + this.w / 2, this.y + this.h / 2, this.color);
      }
    }
  }

  update(player, platforms, frameCount) {
    if (this.dead) {
      this.deathTimer--;
      return;
    }

    this.stateTimer--;
    if (this.hurtFlash > 0) this.hurtFlash--;

    // Gravity (if applicable)
    this.vy += this.gravity;

    // Distance to player (squared to avoid sqrt)
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distSq = dx * dx + dy * dy;

    // State machine
    switch (this.state) {
      case 'PATROL':
        this._patrol();
        if (distSq < this.chaseRange * this.chaseRange) {
          this.state = 'CHASE';
        }
        break;

      case 'CHASE':
        this._chase(dx, dy, distSq);
        if (distSq > (this.chaseRange * 1.5) * (this.chaseRange * 1.5)) {
          this.state = 'PATROL';
        }
        if (distSq < this.attackRange * this.attackRange) {
          this.state = 'ATTACK';
          this.stateTimer = 30;
        }
        break;

      case 'ATTACK':
        if (this.stateTimer <= 0) {
          this.state = 'CHASE';
        }
        break;

      case 'HURT':
        if (this.stateTimer <= 0) {
          this.state = 'CHASE';
        }
        break;
    }

    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;

    // Platform collision (for grounded types)
    if (this.gravity > 0) {
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
        }
      }
    }
  }

  _patrol() {
    const dir = this.facingRight ? 1 : -1;
    this.vx = dir * this.speed;

    // Reverse at patrol boundary
    if (Math.abs(this.x - this.patrolOrigin) > this.patrolDistance) {
      this.facingRight = !this.facingRight;
    }
  }

  _chase(dx, dy, distSq) {
    // Move toward player
    if (distSq > 0) {
      const dist = Math.sqrt(distSq);
      this.vx = (dx / dist) * this.chaseSpeed;
      if (this.gravity === 0) {
        // Floaters can move vertically
        this.vy = (dy / dist) * this.chaseSpeed;
      }
    }
    this.facingRight = dx > 0;
  }

  /** Check if enemy collides with player for contact damage. */
  collidesWithPlayer(player) {
    if (this.dead || player.invincible > 0) return false;
    return (
      this.x < player.x + player.w &&
      this.x + this.w > player.x &&
      this.y < player.y + player.h &&
      this.y + this.h > player.y
    );
  }

  /** Check if player's attack hitbox hits this enemy. */
  hitByAttack(player) {
    if (this.dead || !player.attacking) return false;
    const hb = player.attackHitbox;
    return (
      this.x < hb.x + hb.w &&
      this.x + this.w > hb.x &&
      this.y < hb.y + hb.h &&
      this.y + this.h > hb.y
    );
  }

  get shouldRemove() {
    return this.dead && this.deathTimer <= 0;
  }

  draw(ctx, frameCount) {
    if (this.dead && this.deathTimer <= 0) return;

    // Fade out on death
    if (this.dead) {
      ctx.globalAlpha = this.deathTimer / 30;
    }

    // Hurt flash
    const fillColor = this.hurtFlash > 0 ? '#ffffff' : this.color;

    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);

    // Outer aura
    ctx.save();
    ctx.globalAlpha = (this.dead ? this.deathTimer / 30 : 1) * 0.1;
    ctx.shadowBlur = 25;
    ctx.shadowColor = this.glowColor;
    ctx.fillStyle = this.glowColor;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(this.w, this.h) * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Main body
    ctx.shadowBlur = 18;
    ctx.shadowColor = this.glowColor;
    ctx.fillStyle = fillColor;

    if (this.type === 'drifter') {
      // Geometric octagon with wireframe
      const pulse = 1 + Math.sin(frameCount * 0.1) * 0.03;
      ctx.save();
      ctx.scale(pulse, pulse);
      this._polygon(ctx, 0, 0, this.w * 0.5, 8);
      ctx.fill();

      // Inner wireframe
      ctx.strokeStyle = this.glowColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      this._polygon(ctx, 0, 0, this.w * 0.3, 8);
      ctx.stroke();
      ctx.restore();

      // Eye — aggressive slit
      ctx.fillStyle = '#000';
      ctx.shadowBlur = 0;
      const eyeX = this.facingRight ? 3 : -7;
      ctx.fillRect(eyeX, -3, 5, 3);
    } else if (this.type === 'floater') {
      // Rotating diamond with inner glow
      ctx.save();
      ctx.rotate(frameCount * 0.04);
      this._polygon(ctx, 0, 0, this.h * 0.5, 4);
      ctx.fill();

      // Inner core
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(0, 0, this.w * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (this.type === 'brute') {
      // Heavy pentagon with armor plating
      const pulse = 1 + Math.sin(frameCount * 0.06) * 0.02;
      ctx.save();
      ctx.scale(pulse, pulse);
      this._polygon(ctx, 0, 0, this.w * 0.55, 5);
      ctx.fill();

      // Armor ring
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.6;
      this._polygon(ctx, 0, 0, this.w * 0.4, 5);
      ctx.stroke();

      // Inner armor
      ctx.strokeStyle = this.glowColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      this._polygon(ctx, 0, 0, this.w * 0.25, 5);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

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
}
