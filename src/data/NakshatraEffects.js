/**
 * NakshatraEffects — 27 passive gameplay modifiers (permanent per run).
 * Applied based on Moon's Nakshatra from birth chart.
 */

export const NAKSHATRA_EFFECTS = [
  { name: "Ashwini", stat: "frequency", bonus: 8, passive: "Dash cooldown -20%", modifyConfig: c => { c.player.dashCooldown *= 0.8; } },
  { name: "Bharani", stat: "power", bonus: 6, passive: "Enemies drop loot more often", modifyConfig: c => { c._enemyDropRate = 0.6; } },
  { name: "Krittika", stat: "power", bonus: 10, passive: "Attack damage +15%", modifyConfig: c => { c.player.attackDamage *= 1.15; } },
  { name: "Rohini", stat: "vitalEnergy", bonus: 8, passive: "Health pickups heal 50% more", modifyConfig: c => { c._healthPickupBonus = 1.5; } },
  { name: "Mrigashira", stat: "frequency", bonus: 6, passive: "Move speed +10%", modifyConfig: c => { Object.values(c.zodiac).forEach(z => z.speed *= 1.1); } },
  { name: "Ardra", stat: "flow", bonus: 8, passive: "Chakra regen +30%", modifyConfig: c => { c.player.chakraRegen *= 1.3; } },
  { name: "Punarvasu", stat: "vitalEnergy", bonus: 10, passive: "Revive once per run at 30% HP", modifyConfig: c => { c._reviveCount = 1; } },
  { name: "Pushya", stat: "flow", bonus: 10, passive: "Energy regen doubled when grounded", modifyConfig: c => { c._groundedRegenBonus = 2; } },
  { name: "Ashlesha", stat: "focus", bonus: 8, passive: "Critical hit chance +10%", modifyConfig: c => { c._critChance = 0.1; } },
  { name: "Magha", stat: "power", bonus: 8, passive: "Boss damage +20%", modifyConfig: c => { c._bossDamageBonus = 1.2; } },
  { name: "Purva Phalguni", stat: "flow", bonus: 6, passive: "Combo timer lasts 50% longer", modifyConfig: c => { c._comboTimerBonus = 1.5; } },
  { name: "Uttara Phalguni", stat: "focus", bonus: 6, passive: "Invincibility frames +25%", modifyConfig: c => { c.player.invincibilityFrames *= 1.25; } },
  { name: "Hasta", stat: "focus", bonus: 10, passive: "Attack speed +20%", modifyConfig: c => { c.player.attackCooldown *= 0.8; } },
  { name: "Chitra", stat: "frequency", bonus: 8, passive: "Shard magnet range increased", modifyConfig: c => { c._shardMagnetRange = 80; } },
  { name: "Swati", stat: "frequency", bonus: 10, passive: "Double jump for all zodiacs", modifyConfig: c => { Object.values(c.zodiac).forEach(z => z.maxJumps = Math.max(z.maxJumps, 2)); } },
  { name: "Vishakha", stat: "power", bonus: 8, passive: "Power cost -15%", modifyConfig: c => { c._powerCostMult = 0.85; } },
  { name: "Anuradha", stat: "flow", bonus: 8, passive: "Coherence minigame bonus +50%", modifyConfig: c => { c._coherenceBonus = 1.5; } },
  { name: "Jyeshtha", stat: "vitalEnergy", bonus: 6, passive: "Max HP +15%", modifyConfig: c => { c.player.maxHP *= 1.15; } },
  { name: "Mula", stat: "focus", bonus: 6, passive: "See enemy HP bars", modifyConfig: c => { c._showEnemyHP = true; } },
  { name: "Purva Ashadha", stat: "vitalEnergy", bonus: 8, passive: "Water resistance (no slowing in water zones)", modifyConfig: c => { c._waterResist = true; } },
  { name: "Uttara Ashadha", stat: "power", bonus: 10, passive: "First hit each room deals double damage", modifyConfig: c => { c._firstStrikeBonus = true; } },
  { name: "Shravana", stat: "focus", bonus: 8, passive: "Minimap reveals all shards", modifyConfig: c => { c._revealShards = true; } },
  { name: "Dhanishtha", stat: "flow", bonus: 6, passive: "Star Token gain +25%", modifyConfig: c => { c._tokenGainBonus = 1.25; } },
  { name: "Shatabhisha", stat: "vitalEnergy", bonus: 10, passive: "Heal 1 HP every 5 seconds", modifyConfig: c => { c._passiveHealRate = 0.003; } },
  { name: "Purva Bhadrapada", stat: "power", bonus: 6, passive: "Dash damages enemies", modifyConfig: c => { c._dashDamage = 15; } },
  { name: "Uttara Bhadrapada", stat: "focus", bonus: 10, passive: "Platform landing generates energy", modifyConfig: c => { c._landingEnergy = 3; } },
  { name: "Revati", stat: "flow", bonus: 8, passive: "All collectibles worth 20% more", modifyConfig: c => { c._collectibleBonus = 1.2; } }
];

export function getNakshatraEffect(nakshatraName) {
  return NAKSHATRA_EFFECTS.find(e => e.name === nakshatraName) || NAKSHATRA_EFFECTS[0];
}
