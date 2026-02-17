/**
 * ChakraPowers — 7 unlockable abilities tied to the chakra energy meter.
 * Each power costs energy and has a cooldown.
 */
import { CONFIG } from '../config.js';
import { CHAKRAS } from '../data/ChakraData.js';

const POWER_DEFS = [
  {
    // Root — Grounding Slam
    cost: 40,
    cooldown: 180,
    duration: 20,
    activate(player, enemies, particles, camera) {
      // AOE stun: damage + stun all enemies in range
      const range = 200;
      const rangeSq = range * range;
      camera.shake(12);
      particles.emit(player.x + player.w / 2, player.y + player.h, '#ff0000', 30, 10, 30, { gravity: 0.1 });

      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        if (dx * dx + dy * dy < rangeSq) {
          e.takeDamage(30, dx > 0 ? 1 : -1, particles);
          e.stateTimer = 60; // stun
          e.state = 'HURT';
        }
      }
    }
  },
  {
    // Sacral — Flow Surge
    cost: 35,
    cooldown: 150,
    duration: 120,
    activate(player, enemies, particles, camera, timer) {
      // Speed boost
      player._flowSurgeTimer = 120;
    }
  },
  {
    // Solar — Radiant Shield
    cost: 45,
    cooldown: 200,
    duration: 180,
    activate(player, enemies, particles, camera) {
      player._shieldTimer = 180;
      particles.emit(player.x + player.w / 2, player.y + player.h / 2, '#ffee00', 20, 6, 40);
    }
  },
  {
    // Heart — Harmonic Heal
    cost: 50,
    cooldown: 240,
    duration: 1,
    activate(player, enemies, particles, camera) {
      player.hp = Math.min(player.hp + 40, player.maxHP);
      particles.emit(player.x + player.w / 2, player.y + player.h / 2, '#00ff44', 25, 4, 50);
      camera.shake(3);
    }
  },
  {
    // Throat — Resonance Wave
    cost: 35,
    cooldown: 120,
    duration: 10,
    activate(player, enemies, particles, camera) {
      // Piercing beam in facing direction
      const dir = player.facingRight ? 1 : -1;
      const beamX = player.x + (dir > 0 ? player.w : 0);
      const beamW = 400;

      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (dir > 0 ? (e.x > beamX && e.x < beamX + beamW) : (e.x + e.w > beamX - beamW && e.x + e.w < beamX)) {
          if (Math.abs(e.y - player.y) < 80) {
            e.takeDamage(40, dir, particles);
          }
        }
      }

      // Beam visual particles
      for (let i = 0; i < 20; i++) {
        particles.emit(beamX + dir * i * 20, player.y + player.h / 2, '#00ccff', 1, 3, 15);
      }
      camera.shake(5);
    }
  },
  {
    // Third Eye — Astral Sight
    cost: 40,
    cooldown: 300,
    duration: 180,
    activate(player, enemies, particles, camera, timer) {
      timer.setSlowMotion(0.4, 3);
      particles.emit(player.x + player.w / 2, player.y + player.h / 2, '#6600ff', 30, 8, 40);
    }
  },
  {
    // Crown — Cosmic Alignment
    cost: 60,
    cooldown: 600,
    duration: 120,
    activate(player, enemies, particles, camera) {
      // God mode burst: invincible + damage all
      player.invincible = 120;
      camera.shake(20);

      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        e.takeDamage(50, 0, particles);
      }

      particles.emit(player.x + player.w / 2, player.y + player.h / 2, '#cc00ff', 50, 15, 50);
    }
  }
];

export class ChakraPowers {
  constructor() {
    this.unlocked = [false, false, false, false, false, false, false];
    this.cooldowns = [0, 0, 0, 0, 0, 0, 0];
    this.activePower = -1;
    this.activeTimer = 0;
  }

  unlock(index) {
    if (index >= 0 && index < 7) {
      this.unlocked[index] = true;
    }
  }

  canActivate(index, player) {
    if (!this.unlocked[index]) return false;
    if (this.cooldowns[index] > 0) return false;
    if (player.chakra < POWER_DEFS[index].cost) return false;
    return true;
  }

  activate(index, player, enemies, particles, camera, timer) {
    if (!this.canActivate(index, player)) return false;

    const def = POWER_DEFS[index];
    player.chakra -= def.cost;
    this.cooldowns[index] = def.cooldown;
    this.activePower = index;
    this.activeTimer = def.duration;

    def.activate(player, enemies, particles, camera, timer);
    return true;
  }

  update() {
    for (let i = 0; i < 7; i++) {
      if (this.cooldowns[i] > 0) this.cooldowns[i]--;
    }
    if (this.activeTimer > 0) {
      this.activeTimer--;
      if (this.activeTimer <= 0) this.activePower = -1;
    }
  }

  /** Draw power wheel HUD element. */
  drawWheel(ctx, x, y, radius) {
    const angleStep = (Math.PI * 2) / 7;

    for (let i = 0; i < 7; i++) {
      const angle = -Math.PI / 2 + i * angleStep;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      const r = 14;

      // Background circle
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = this.unlocked[i] ? CHAKRAS[i].color + '33' : 'rgba(255,255,255,0.05)';
      ctx.fill();

      // Border
      ctx.strokeStyle = this.unlocked[i] ? CHAKRAS[i].color : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cooldown sweep
      if (this.cooldowns[i] > 0 && this.unlocked[i]) {
        const pct = this.cooldowns[i] / POWER_DEFS[i].cooldown;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.arc(px, py, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fill();
      }

      // Active indicator
      if (this.activePower === i) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = CHAKRAS[i].color;
        ctx.beginPath();
        ctx.arc(px, py, r + 3, 0, Math.PI * 2);
        ctx.strokeStyle = CHAKRAS[i].color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Label
      ctx.fillStyle = this.unlocked[i] ? '#fff' : '#555';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(CHAKRAS[i].shortName[0], px, py + 3);
    }
    ctx.textAlign = 'left';
  }
}
