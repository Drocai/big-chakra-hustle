/**
 * DecanModifiers — 36 run modifiers that affect world generation.
 * Applied based on Sun's Decan from birth chart.
 */

export const DECAN_MODIFIERS = [
  // Aries
  { sign: "Aries", degree: 0, name: "Warrior's Path", effect: "Platforms wider +15%, more enemies", modify: g => { g.platformWidthBonus = 1.15; g.enemyDensity = 1.3; } },
  { sign: "Aries", degree: 10, name: "Solar Charge", effect: "Dash distance +20%", modify: g => { g.dashBonus = 1.2; } },
  { sign: "Aries", degree: 20, name: "Desire's Edge", effect: "Shard value doubled, fewer shards", modify: g => { g.shardValueMult = 2; g.shardSpawnRate = 0.5; } },
  // Taurus
  { sign: "Taurus", degree: 30, name: "Steady Ground", effect: "Platforms more stable, less height variation", modify: g => { g.heightVariance = 0.5; } },
  { sign: "Taurus", degree: 40, name: "Moon Garden", effect: "More health pickups", modify: g => { g.healthDropRate = 2; } },
  { sign: "Taurus", degree: 50, name: "Patient Stone", effect: "Enemy move speed -20%, HP +30%", modify: g => { g.enemySpeedMult = 0.8; g.enemyHPMult = 1.3; } },
  // Gemini
  { sign: "Gemini", degree: 60, name: "Twin Bridges", effect: "Double platform generation", modify: g => { g.platformDensity = 2; } },
  { sign: "Gemini", degree: 70, name: "Quick Reflex", effect: "Player attack speed +25%", modify: g => { g.attackSpeedBonus = 1.25; } },
  { sign: "Gemini", degree: 80, name: "Silver Tongue", effect: "Coherence game easier", modify: g => { g.coherenceDifficulty = 0.7; } },
  // Cancer
  { sign: "Cancer", degree: 90, name: "Shell Armor", effect: "Start with shield", modify: g => { g.startShield = true; } },
  { sign: "Cancer", degree: 100, name: "Dream Memory", effect: "Minimap always visible", modify: g => { g.alwaysMinimap = true; } },
  { sign: "Cancer", degree: 110, name: "Tide Walker", effect: "Water sections have currents (boost zones)", modify: g => { g.boostZones = true; } },
  // Leo
  { sign: "Leo", degree: 120, name: "King's Arena", effect: "Larger boss arenas", modify: g => { g.bossArenaSize = 1.5; } },
  { sign: "Leo", degree: 130, name: "Golden Gift", effect: "Star Token drops +50%", modify: g => { g.tokenDropMult = 1.5; } },
  { sign: "Leo", degree: 140, name: "Creative Flame", effect: "Particle effects enhanced", modify: g => { g.particleBonus = 2; } },
  // Virgo
  { sign: "Virgo", degree: 150, name: "Precision", effect: "Crit damage +50%", modify: g => { g.critDamageMult = 1.5; } },
  { sign: "Virgo", degree: 160, name: "Herbal Remedy", effect: "Health regen when standing still", modify: g => { g.idleHeal = true; } },
  { sign: "Virgo", degree: 170, name: "Master Craft", effect: "Power cooldowns -20%", modify: g => { g.powerCooldownMult = 0.8; } },
  // Libra
  { sign: "Libra", degree: 180, name: "Balanced Path", effect: "Even platform spacing", modify: g => { g.evenPlatforms = true; } },
  { sign: "Libra", degree: 190, name: "Fair Fight", effect: "Enemies and player deal equal damage", modify: g => { g.equalDamage = true; } },
  { sign: "Libra", degree: 200, name: "Aesthetic Aura", effect: "Visual effects intensified", modify: g => { g.vfxIntensity = 1.5; } },
  // Scorpio
  { sign: "Scorpio", degree: 210, name: "Venom Strike", effect: "Attacks apply DOT", modify: g => { g.poisonDamage = 5; } },
  { sign: "Scorpio", degree: 220, name: "Death's Door", effect: "Bonus damage below 25% HP", modify: g => { g.desperationBonus = 1.5; } },
  { sign: "Scorpio", degree: 230, name: "Phoenix Down", effect: "Free revive each world", modify: g => { g.freeRevive = true; } },
  // Sagittarius
  { sign: "Sagittarius", degree: 240, name: "Far Horizon", effect: "Camera zoom out for visibility", modify: g => { g.zoomOut = 0.85; } },
  { sign: "Sagittarius", degree: 250, name: "Lucky Star", effect: "Rare drops more common", modify: g => { g.rareDropMult = 2; } },
  { sign: "Sagittarius", degree: 260, name: "Elder Wisdom", effect: "XP gain +30%", modify: g => { g.xpMult = 1.3; } },
  // Capricorn
  { sign: "Capricorn", degree: 270, name: "Iron Will", effect: "Knockback reduced 50%", modify: g => { g.knockbackResist = 0.5; } },
  { sign: "Capricorn", degree: 280, name: "Climb Higher", effect: "More vertical level generation", modify: g => { g.verticalBias = 1.5; } },
  { sign: "Capricorn", degree: 290, name: "Summit View", effect: "Boss patterns slower", modify: g => { g.bossSpeedMult = 0.8; } },
  // Aquarius
  { sign: "Aquarius", degree: 300, name: "Tesla Field", effect: "Lightning ambient particles", modify: g => { g.ambientLightning = true; } },
  { sign: "Aquarius", degree: 310, name: "Rebel Code", effect: "Random bonus at room start", modify: g => { g.roomStartBonus = true; } },
  { sign: "Aquarius", degree: 320, name: "Community", effect: "Friendly NPC allies occasionally appear", modify: g => { g.allySpawn = true; } },
  // Pisces
  { sign: "Pisces", degree: 330, name: "Dream Walk", effect: "Transparent platforms reveal hidden paths", modify: g => { g.hiddenPaths = true; } },
  { sign: "Pisces", degree: 340, name: "Ocean's Gift", effect: "Energy orbs more frequent", modify: g => { g.energyOrbRate = 2; } },
  { sign: "Pisces", degree: 350, name: "Final Release", effect: "Death explosion damages all enemies", modify: g => { g.deathExplosion = true; } }
];

export function getDecanModifier(sign, degree) {
  return DECAN_MODIFIERS.find(d => d.sign === sign && d.degree === degree) || DECAN_MODIFIERS[0];
}
