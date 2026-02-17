/**
 * AllBosses — 7 unique boss implementations, one per chakra world.
 * Each extends BossBase with unique attack patterns and visuals.
 */
import { BossBase } from './BossBase.js';

// 1. Muladhara Serpent — block snake, charges + slam shockwaves
export class MuladharaSerpent extends BossBase {
  constructor(x, y) {
    super(x, y, 0);
    this.w = 90; this.h = 60;
    this.maxHP = 300; this.hp = 300;
    this.segments = []; // tail segments
    for (let i = 0; i < 5; i++) {
      this.segments.push({ x: x - (i + 1) * 20, y: y, size: 14 - i * 2 });
    }
  }

  _updatePhase(player, platforms, particles, camera, frameCount) {
    const dx = player.x - this.x;
    const speed = 1.5 + this.phase;
    this.vx = (dx > 0 ? 1 : -1) * speed;

    // Slam attack
    if (this.attackTimer <= 0 && Math.abs(dx) < 200) {
      this.vy = -12;
      this.attackTimer = 100 - this.phase * 15;
      if (camera) camera.shake(10);
      if (particles) particles.emit(this.x + this.w / 2, this.y + this.h, '#ff0000', 20, 8, 20);
    }

    // Update tail segments
    for (let i = 0; i < this.segments.length; i++) {
      const target = i === 0 ? { x: this.x, y: this.y + this.h / 2 } : this.segments[i - 1];
      this.segments[i].x += (target.x - 20 - this.segments[i].x) * 0.3;
      this.segments[i].y += (target.y - this.segments[i].y) * 0.3;
    }
  }

  _drawBody(ctx, frameCount) {
    // Snake body
    ctx.fillStyle = this.chakra.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.chakra.glowColor;
    ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(-this.w / 4, -this.h / 4, 8, 8);
    ctx.fillRect(this.w / 4 - 8, -this.h / 4, 8, 8);
  }

  draw(ctx, frameCount) {
    // Draw tail first
    if (this.active) {
      for (const seg of this.segments) {
        ctx.fillStyle = this.chakra.color + '88';
        ctx.fillRect(seg.x - seg.size / 2, seg.y - seg.size / 2, seg.size, seg.size);
      }
    }
    super.draw(ctx, frameCount);
  }
}

// 2. Svadhishthana Phoenix — fire bird, swoops + splits
export class SvadhishthanaPhoenix extends BossBase {
  constructor(x, y) {
    super(x, y, 1);
    this.w = 70; this.h = 50;
    this.maxHP = 250; this.hp = 250;
    this.gravity = 0; // flies
    this._swooping = false;
    this._wingAngle = 0;
  }

  _updatePhase(player, platforms, particles, camera, frameCount) {
    this._wingAngle = Math.sin(frameCount * 0.15) * 0.4;
    const dx = player.x - this.x;
    const dy = player.y - this.y;

    if (!this._swooping) {
      // Hover above player
      this.vx += (dx > 0 ? 0.1 : -0.1);
      this.vy += ((player.y - 120) - this.y > 0 ? 0.1 : -0.1);
      this.vx *= 0.95;
      this.vy *= 0.95;

      if (this.attackTimer <= 0) {
        this._swooping = true;
        this.attackTimer = 80 - this.phase * 10;
      }
    } else {
      // Swoop down at player
      this.vx = (dx > 0 ? 1 : -1) * (4 + this.phase);
      this.vy = 3 + this.phase;
      if (this.y > player.y + 50 || Math.abs(dx) < 20) {
        this._swooping = false;
        this.vy = -6;
        if (particles) particles.emit(this.x + this.w / 2, this.y + this.h, '#ff8800', 15, 6, 15);
      }
    }
  }

  _drawBody(ctx, frameCount) {
    // Bird shape
    ctx.fillStyle = this.chakra.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wings
    ctx.save();
    ctx.rotate(this._wingAngle);
    ctx.fillStyle = this.chakra.glowColor;
    ctx.beginPath();
    ctx.ellipse(-this.w / 2, 0, 20, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(this.w / 2, 0, 20, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 3. Manipura Golem — armored, punches + solar beams
export class ManipuraGolem extends BossBase {
  constructor(x, y) {
    super(x, y, 2);
    this.w = 100; this.h = 90;
    this.maxHP = 400; this.hp = 400;
    this.contactDamage = 25;
    this.attackCooldown = 120;
  }

  _updatePhase(player, platforms, particles, camera, frameCount) {
    const dx = player.x - this.x;
    this.vx = (dx > 0 ? 1 : -1) * (0.8 + this.phase * 0.3);

    if (this.attackTimer <= 0 && Math.abs(dx) < 150) {
      // Stomp attack
      this.vy = -8;
      this.attackTimer = this.attackCooldown - this.phase * 20;
      if (camera) camera.shake(12);
      if (particles) particles.emit(this.x + this.w / 2, this.y + this.h, '#ffee00', 25, 10, 25);
    }
  }

  _drawBody(ctx, frameCount) {
    ctx.fillStyle = this.chakra.color;
    ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    // Armor lines
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeRect(-this.w / 2 + 8, -this.h / 2 + 8, this.w - 16, this.h - 16);
    // Eye slit
    ctx.fillStyle = '#000';
    ctx.fillRect(-12, -10, 24, 6);
  }
}

// 4. Anahata Specter — teleports, mirror copies
export class AnahataSpecter extends BossBase {
  constructor(x, y) {
    super(x, y, 3);
    this.w = 60; this.h = 70;
    this.maxHP = 280; this.hp = 280;
    this.gravity = 0.1;
    this._teleportTimer = 0;
    this._mirrorX = 0;
    this._showMirror = false;
  }

  _updatePhase(player, platforms, particles, camera, frameCount) {
    const dx = player.x - this.x;
    this.vx = (dx > 0 ? 1 : -1) * (1 + this.phase * 0.5);
    this.vy *= 0.9;

    this._teleportTimer--;
    if (this._teleportTimer <= 0) {
      // Teleport near player
      this.x = player.x + (Math.random() > 0.5 ? 150 : -150);
      this.y = player.y - 50;
      this.vx = 0; this.vy = 0;
      this._teleportTimer = 90 - this.phase * 15;
      if (particles) particles.emit(this.x + this.w / 2, this.y + this.h / 2, '#00ff44', 20, 8, 20);
      if (camera) camera.shake(3);
    }

    // Mirror in phase 2+
    this._showMirror = this.phase >= 2;
    if (this._showMirror) {
      this._mirrorX = player.x * 2 - this.x;
    }
  }

  _drawBody(ctx, frameCount) {
    ctx.globalAlpha = 0.7 + Math.sin(frameCount * 0.1) * 0.3;
    ctx.fillStyle = this.chakra.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  draw(ctx, frameCount) {
    super.draw(ctx, frameCount);
    // Mirror copy
    if (this._showMirror && this.active && !this.defeated) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = this.chakra.color;
      ctx.beginPath();
      ctx.ellipse(this._mirrorX + this.w / 2, this.y + this.h / 2, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

// 5. Vishuddha Oracle — sound waves + resonance zones
export class VishuddhaOracle extends BossBase {
  constructor(x, y) {
    super(x, y, 4);
    this.w = 70; this.h = 70;
    this.maxHP = 320; this.hp = 320;
    this.gravity = 0;
    this._waveRadius = 0;
    this._waveActive = false;
  }

  _updatePhase(player, platforms, particles, camera, frameCount) {
    // Hover
    this.y += Math.sin(frameCount * 0.03) * 0.5;
    const dx = player.x - this.x;
    this.vx = (dx > 0 ? 1 : -1) * 0.5;

    if (this.attackTimer <= 0) {
      this._waveActive = true;
      this._waveRadius = 0;
      this.attackTimer = 100 - this.phase * 15;
    }

    if (this._waveActive) {
      this._waveRadius += 3 + this.phase;
      if (this._waveRadius > 300) this._waveActive = false;
    }
  }

  _drawBody(ctx, frameCount) {
    ctx.fillStyle = this.chakra.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
    ctx.fill();
    // Third eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -5, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  draw(ctx, frameCount) {
    // Sound wave rings
    if (this._waveActive && this.active) {
      ctx.strokeStyle = this.chakra.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = Math.max(0, 1 - this._waveRadius / 300);
      ctx.beginPath();
      ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this._waveRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    super.draw(ctx, frameCount);
  }
}

// 6. Ajna Seer — homing orbs + gravity rotation
export class AjnaSeer extends BossBase {
  constructor(x, y) {
    super(x, y, 5);
    this.w = 60; this.h = 60;
    this.maxHP = 350; this.hp = 350;
    this.gravity = 0;
    this._orbs = [];
    this._orbTimer = 0;
  }

  _updatePhase(player, platforms, particles, camera, frameCount) {
    // Hover + orbit
    const centerX = player.x;
    const dist = 200;
    this.x = centerX + Math.cos(frameCount * 0.02) * dist;
    this.y = player.y - 100 + Math.sin(frameCount * 0.03) * 50;

    // Spawn homing orbs
    this._orbTimer--;
    if (this._orbTimer <= 0) {
      this._orbs.push({
        x: this.x + this.w / 2,
        y: this.y + this.h / 2,
        vx: 0, vy: 0,
        life: 120 + this.phase * 30
      });
      this._orbTimer = 60 - this.phase * 10;
    }

    // Update orbs
    for (let i = this._orbs.length - 1; i >= 0; i--) {
      const orb = this._orbs[i];
      const dx = player.x - orb.x;
      const dy = player.y - orb.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      orb.vx += (dx / d) * 0.3;
      orb.vy += (dy / d) * 0.3;
      orb.vx *= 0.98;
      orb.vy *= 0.98;
      orb.x += orb.vx;
      orb.y += orb.vy;
      orb.life--;
      if (orb.life <= 0) this._orbs.splice(i, 1);
    }
  }

  _drawBody(ctx, frameCount) {
    // All-seeing eye
    ctx.fillStyle = this.chakra.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.w / 2, this.h / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  draw(ctx, frameCount) {
    // Draw orbs
    if (this.active) {
      for (const orb of this._orbs) {
        ctx.fillStyle = this.chakra.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.chakra.glowColor;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    super.draw(ctx, frameCount);
  }
}

// 7. Sahasrara Cosmos — bullet-hell stars + gravity wells
export class SahasraraCosmos extends BossBase {
  constructor(x, y) {
    super(x, y, 6);
    this.w = 100; this.h = 100;
    this.maxHP = 500; this.hp = 500;
    this.gravity = 0;
    this._bullets = [];
    this._bulletTimer = 0;
    this._rotAngle = 0;
  }

  _updatePhase(player, platforms, particles, camera, frameCount) {
    // Hover in center
    this.y = 200 + Math.sin(frameCount * 0.02) * 30;
    this._rotAngle += 0.02 + this.phase * 0.01;

    // Bullet patterns
    this._bulletTimer--;
    if (this._bulletTimer <= 0) {
      const count = 6 + this.phase * 3;
      for (let i = 0; i < count; i++) {
        const angle = this._rotAngle + (i * Math.PI * 2) / count;
        const speed = 2 + this.phase;
        this._bullets.push({
          x: this.x + this.w / 2,
          y: this.y + this.h / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 90
        });
      }
      this._bulletTimer = 30 - this.phase * 5;
      if (camera) camera.shake(2);
    }

    // Update bullets
    for (let i = this._bullets.length - 1; i >= 0; i--) {
      const b = this._bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (b.life <= 0) this._bullets.splice(i, 1);
    }
  }

  _drawBody(ctx, frameCount) {
    // Cosmic form
    ctx.fillStyle = this.chakra.color;
    ctx.shadowBlur = 30;
    ctx.shadowColor = this.chakra.glowColor;
    ctx.beginPath();
    ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner rings
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    for (let r = 10; r < this.w / 2; r += 12) {
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  draw(ctx, frameCount) {
    // Draw bullets
    if (this.active) {
      for (const b of this._bullets) {
        ctx.fillStyle = this.chakra.color;
        ctx.globalAlpha = b.life / 90;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    super.draw(ctx, frameCount);
  }
}

/** Factory function to create the correct boss for a world index. */
export function createBoss(worldIndex, x, y) {
  const bosses = [
    MuladharaSerpent,
    SvadhishthanaPhoenix,
    ManipuraGolem,
    AnahataSpecter,
    VishuddhaOracle,
    AjnaSeer,
    SahasraraCosmos
  ];
  const BossClass = bosses[worldIndex % 7];
  return new BossClass(x, y);
}
