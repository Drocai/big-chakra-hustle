/**
 * ChakraData — 7 chakra definitions with world themes, frequencies, and game data.
 */

export const CHAKRAS = [
  {
    index: 0,
    name: 'Muladhara',
    shortName: 'Root',
    color: '#ff0000',
    glowColor: '#ff4444',
    frequency: 396,
    element: 'Earth',
    power: 'Grounding Slam',
    powerDesc: 'AOE stun around player',
    platformColor: '#cc0000',
    bgInner: '#1a0505',
    bgOuter: '#000000',
    enemyTypes: ['drifter', 'brute'],
    bossName: 'Muladhara Serpent',
    rooms: 4
  },
  {
    index: 1,
    name: 'Svadhishthana',
    shortName: 'Sacral',
    color: '#ff8800',
    glowColor: '#ffaa44',
    frequency: 417,
    element: 'Water',
    power: 'Flow Surge',
    powerDesc: 'Speed boost + fire trail',
    platformColor: '#cc6600',
    bgInner: '#1a0e05',
    bgOuter: '#000000',
    enemyTypes: ['drifter', 'floater'],
    bossName: 'Svadhishthana Phoenix',
    rooms: 4
  },
  {
    index: 2,
    name: 'Manipura',
    shortName: 'Solar',
    color: '#ffee00',
    glowColor: '#ffff44',
    frequency: 528,
    element: 'Fire',
    power: 'Radiant Shield',
    powerDesc: 'Reflect projectiles',
    platformColor: '#ccaa00',
    bgInner: '#1a1505',
    bgOuter: '#000000',
    enemyTypes: ['floater', 'brute'],
    bossName: 'Manipura Golem',
    rooms: 4
  },
  {
    index: 3,
    name: 'Anahata',
    shortName: 'Heart',
    color: '#00ff44',
    glowColor: '#44ff88',
    frequency: 639,
    element: 'Air',
    power: 'Harmonic Heal',
    powerDesc: 'Heal + convert enemies',
    platformColor: '#00cc33',
    bgInner: '#051a0a',
    bgOuter: '#000000',
    enemyTypes: ['drifter', 'floater', 'brute'],
    bossName: 'Anahata Specter',
    rooms: 5
  },
  {
    index: 4,
    name: 'Vishuddha',
    shortName: 'Throat',
    color: '#00ccff',
    glowColor: '#44ddff',
    frequency: 741,
    element: 'Ether',
    power: 'Resonance Wave',
    powerDesc: 'Piercing beam attack',
    platformColor: '#0099cc',
    bgInner: '#050f1a',
    bgOuter: '#000000',
    enemyTypes: ['floater', 'brute'],
    bossName: 'Vishuddha Oracle',
    rooms: 4
  },
  {
    index: 5,
    name: 'Ajna',
    shortName: 'Third Eye',
    color: '#6600ff',
    glowColor: '#8844ff',
    frequency: 852,
    element: 'Light',
    power: 'Astral Sight',
    powerDesc: 'Slow-mo + reveal secrets',
    platformColor: '#4400cc',
    bgInner: '#0a051a',
    bgOuter: '#000000',
    enemyTypes: ['drifter', 'floater', 'brute'],
    bossName: 'Ajna Seer',
    rooms: 5
  },
  {
    index: 6,
    name: 'Sahasrara',
    shortName: 'Crown',
    color: '#cc00ff',
    glowColor: '#ee44ff',
    frequency: 963,
    element: 'Cosmic',
    power: 'Cosmic Alignment',
    powerDesc: 'God mode burst',
    platformColor: '#9900cc',
    bgInner: '#10051a',
    bgOuter: '#000000',
    enemyTypes: ['drifter', 'floater', 'brute'],
    bossName: 'Sahasrara Cosmos',
    rooms: 5
  }
];

export function getChakraByIndex(index) {
  return CHAKRAS[index % CHAKRAS.length];
}
