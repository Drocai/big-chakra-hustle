/**
 * WorldThemes — Per-chakra visual and audio configuration.
 * Provides background gradients, platform styles, ambient particles,
 * and hazard types for each of the 7 chakra worlds.
 */
import { CHAKRAS } from '../data/ChakraData.js';

export const WORLD_THEMES = [
  {
    // Muladhara (Root) — Red, Earth, Cubes
    platformShape: 'cube',
    bgGradient: ['#1a0505', '#0a0000', '#000000'],
    ambientColor: '#ff000033',
    ambientParticleColor: '#ff4444',
    starTint: '#ff6666',
    hazardType: 'lava',
    hazardColor: '#ff4400',
    musicKey: 'minor',
    musicTempo: 80
  },
  {
    // Svadhishthana (Sacral) — Orange, Water, Waves
    platformShape: 'wave',
    bgGradient: ['#1a0e05', '#0a0500', '#000000'],
    ambientColor: '#ff880033',
    ambientParticleColor: '#ffaa44',
    starTint: '#ffaa66',
    hazardType: 'current',
    hazardColor: '#ff8800',
    musicKey: 'pentatonic',
    musicTempo: 90
  },
  {
    // Manipura (Solar) — Yellow, Fire, Triangles
    platformShape: 'triangle',
    bgGradient: ['#1a1505', '#0a0a00', '#000000'],
    ambientColor: '#ffee0033',
    ambientParticleColor: '#ffff44',
    starTint: '#ffff88',
    hazardType: 'fire',
    hazardColor: '#ffcc00',
    musicKey: 'major',
    musicTempo: 100
  },
  {
    // Anahata (Heart) — Green, Air, Hearts/Circles
    platformShape: 'circle',
    bgGradient: ['#051a0a', '#000a05', '#000000'],
    ambientColor: '#00ff4433',
    ambientParticleColor: '#44ff88',
    starTint: '#88ff88',
    hazardType: 'wind',
    hazardColor: '#00ff44',
    musicKey: 'lydian',
    musicTempo: 85
  },
  {
    // Vishuddha (Throat) — Blue, Ether, Hexagons
    platformShape: 'hexagon',
    bgGradient: ['#050f1a', '#000510', '#000000'],
    ambientColor: '#00ccff33',
    ambientParticleColor: '#44ddff',
    starTint: '#88ccff',
    hazardType: 'sonic',
    hazardColor: '#00ccff',
    musicKey: 'mixolydian',
    musicTempo: 95
  },
  {
    // Ajna (Third Eye) — Indigo, Light, Eyes/Triangles
    platformShape: 'eye',
    bgGradient: ['#0a051a', '#050010', '#000000'],
    ambientColor: '#6600ff33',
    ambientParticleColor: '#8844ff',
    starTint: '#aa88ff',
    hazardType: 'gravity',
    hazardColor: '#6600ff',
    musicKey: 'dorian',
    musicTempo: 70
  },
  {
    // Sahasrara (Crown) — Violet, Cosmic, Stars
    platformShape: 'star',
    bgGradient: ['#10051a', '#080010', '#000000'],
    ambientColor: '#cc00ff33',
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

/**
 * Draw per-world background with themed gradient and tinted starfield.
 */
export function drawWorldBackground(ctx, width, height, worldIndex, frameCount, stars) {
  const theme = getWorldTheme(worldIndex);
  const chakra = CHAKRAS[worldIndex % 7];

  // Pulsing gradient background
  const pulse = Math.sin(frameCount * 0.008) * 30;
  const grad = ctx.createRadialGradient(
    width / 2, height / 2, 80 + pulse,
    width / 2, height / 2, width
  );
  grad.addColorStop(0, theme.bgGradient[0]);
  grad.addColorStop(0.5, theme.bgGradient[1]);
  grad.addColorStop(1, theme.bgGradient[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Tinted starfield
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const x = (s.x * width + frameCount * s.speed) % width;
    const y = s.y * height;
    ctx.globalAlpha = s.a * 0.8;
    ctx.fillStyle = i % 3 === 0 ? theme.starTint : '#ffffff';
    ctx.fillRect(x, y, s.size, s.size);
  }
  ctx.globalAlpha = 1;

  // Ambient overlay
  ctx.fillStyle = theme.ambientColor;
  ctx.fillRect(0, 0, width, height);
}
