/**
 * WorldThemes — Per-chakra visual configuration with 3-layer parallax.
 * Trap Fantasy mandate: deep void backgrounds, tinted nebula,
 * sacred geometry mid-layer, foreground dust motes.
 */
import { CHAKRAS } from '../data/ChakraData.js';

export const WORLD_THEMES = [
  {
    // Muladhara (Root) — Red, Earth
    platformShape: 'cube',
    bgGradient: ['#1a0505', '#0a0000', '#050505'],
    ambientColor: '#ff000018',
    ambientParticleColor: '#ff4444',
    starTint: '#ff6666',
    hazardType: 'lava',
    hazardColor: '#ff4400',
    musicKey: 'minor',
    musicTempo: 80
  },
  {
    // Svadhishthana (Sacral) — Orange, Water
    platformShape: 'wave',
    bgGradient: ['#1a0e05', '#0a0500', '#050505'],
    ambientColor: '#ff880018',
    ambientParticleColor: '#ffaa44',
    starTint: '#ffaa66',
    hazardType: 'current',
    hazardColor: '#ff8800',
    musicKey: 'pentatonic',
    musicTempo: 90
  },
  {
    // Manipura (Solar) — Yellow, Fire
    platformShape: 'triangle',
    bgGradient: ['#1a1505', '#0a0a00', '#050505'],
    ambientColor: '#ffee0018',
    ambientParticleColor: '#ffff44',
    starTint: '#ffff88',
    hazardType: 'fire',
    hazardColor: '#ffcc00',
    musicKey: 'major',
    musicTempo: 100
  },
  {
    // Anahata (Heart) — Green, Air
    platformShape: 'circle',
    bgGradient: ['#051a0a', '#000a05', '#050505'],
    ambientColor: '#00ff4418',
    ambientParticleColor: '#44ff88',
    starTint: '#88ff88',
    hazardType: 'wind',
    hazardColor: '#00ff44',
    musicKey: 'lydian',
    musicTempo: 85
  },
  {
    // Vishuddha (Throat) — Blue, Ether
    platformShape: 'hexagon',
    bgGradient: ['#050f1a', '#000510', '#050505'],
    ambientColor: '#00ccff18',
    ambientParticleColor: '#44ddff',
    starTint: '#88ccff',
    hazardType: 'sonic',
    hazardColor: '#00ccff',
    musicKey: 'mixolydian',
    musicTempo: 95
  },
  {
    // Ajna (Third Eye) — Indigo, Light
    platformShape: 'eye',
    bgGradient: ['#0a051a', '#050010', '#050505'],
    ambientColor: '#6600ff18',
    ambientParticleColor: '#8844ff',
    starTint: '#aa88ff',
    hazardType: 'gravity',
    hazardColor: '#6600ff',
    musicKey: 'dorian',
    musicTempo: 70
  },
  {
    // Sahasrara (Crown) — Violet, Cosmic
    platformShape: 'star',
    bgGradient: ['#10051a', '#080010', '#050505'],
    ambientColor: '#cc00ff18',
    ambientParticleColor: '#ee44ff',
    starTint: '#ff88ff',
    hazardType: 'void',
    hazardColor: '#cc00ff',
    musicKey: 'chromatic',
    musicTempo: 110
  }
];

export function getWorldTheme(worldIndex) {
  return WORLD_THEMES[worldIndex % 7];
}

// Pre-generate dust motes (foreground parallax layer)
const _dustMotes = [];
for (let i = 0; i < 40; i++) {
  _dustMotes.push({
    x: Math.random(),
    y: Math.random(),
    size: 1 + Math.random() * 2,
    speed: 0.3 + Math.random() * 0.4,
    alpha: 0.1 + Math.random() * 0.2,
    drift: Math.random() * Math.PI * 2
  });
}

/**
 * Draw per-world background with 3-layer parallax:
 * Far: Stars/Nebula (10% scroll speed)
 * Mid: Sacred geometry grid (25% scroll speed)
 * Near: Dust motes (120% scroll speed, foreground depth)
 */
export function drawWorldBackground(ctx, width, height, worldIndex, frameCount, stars) {
  const theme = getWorldTheme(worldIndex);
  const chakra = CHAKRAS[worldIndex % 7];

  // === LAYER 0: Void gradient ===
  const pulse = Math.sin(frameCount * 0.006) * 20;
  const grad = ctx.createRadialGradient(
    width / 2, height / 2, 60 + pulse,
    width / 2, height / 2, width * 0.9
  );
  grad.addColorStop(0, theme.bgGradient[0]);
  grad.addColorStop(0.5, theme.bgGradient[1]);
  grad.addColorStop(1, theme.bgGradient[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // === LAYER 1 (FAR): Stars + Nebula at 10% speed ===
  const farSpeed = 0.1;
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const x = (s.x * width + frameCount * s.speed * farSpeed) % width;
    const y = s.y * height;
    ctx.globalAlpha = s.a * 0.7;
    ctx.fillStyle = i % 5 === 0 ? theme.starTint : '#ffffff';

    if (i % 20 === 0) {
      // Nebula puffs — soft radial gradients
      const nebGrad = ctx.createRadialGradient(x, y, 0, x, y, 30 + s.size * 15);
      nebGrad.addColorStop(0, theme.starTint + '20');
      nebGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(x - 40, y - 40, 80, 80);
    } else {
      ctx.fillRect(x, y, s.size, s.size);
    }
  }
  ctx.globalAlpha = 1;

  // === LAYER 2 (MID): Perspective grid at 25% speed ===
  const gridSpeed = 0.25;
  const gridOffset = (frameCount * gridSpeed) % 50;
  ctx.save();
  ctx.strokeStyle = chakra.color + '12'; // Very subtle
  ctx.lineWidth = 1;

  // Vertical grid lines
  for (let x = -gridOffset; x < width + 50; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  // Horizontal grid lines
  for (let y = 0; y < height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  // Ambient color overlay
  ctx.fillStyle = theme.ambientColor;
  ctx.fillRect(0, 0, width, height);

  // === LAYER 3 (NEAR): Dust motes at 120% speed ===
  const nearSpeed = 1.2;
  ctx.fillStyle = theme.ambientParticleColor;
  for (let i = 0; i < _dustMotes.length; i++) {
    const d = _dustMotes[i];
    const x = (d.x * width + frameCount * d.speed * nearSpeed) % width;
    const y = (d.y * height + Math.sin(frameCount * 0.02 + d.drift) * 20);
    ctx.globalAlpha = d.alpha;
    ctx.beginPath();
    ctx.arc(x, y, d.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
