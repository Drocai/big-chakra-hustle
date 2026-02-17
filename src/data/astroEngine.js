/**
 * Big Chakra Astrology Engine
 * Ported verbatim from archive — synthesizes Hellenistic, Vedic, and Egyptian systems.
 */

// === ZODIAC SIGNS ===
export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// === ELEMENTS (Fire, Earth, Air, Water) ===
export const ELEMENTS = {
  Fire: ["Aries", "Leo", "Sagittarius"],
  Earth: ["Taurus", "Virgo", "Capricorn"],
  Air: ["Gemini", "Libra", "Aquarius"],
  Water: ["Cancer", "Scorpio", "Pisces"]
};

// === MODALITIES ===
export const MODALITIES = {
  Cardinal: ["Aries", "Cancer", "Libra", "Capricorn"],
  Fixed: ["Taurus", "Leo", "Scorpio", "Aquarius"],
  Mutable: ["Gemini", "Virgo", "Sagittarius", "Pisces"]
};

// === PLANETARY RULERS (Hellenistic) ===
export const RULERS = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury",
  Cancer: "Moon", Leo: "Sun", Virgo: "Mercury",
  Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter",
  Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
};

// === 27 NAKSHATRAS (Vedic Lunar Mansions) ===
export const NAKSHATRAS = [
  { name: "Ashwini", deity: "Ashvini Kumaras", symbol: "Horse's Head", theme: "Healing & Speed", element: "Earth" },
  { name: "Bharani", deity: "Yama", symbol: "Yoni", theme: "Transformation & Birth", element: "Earth" },
  { name: "Krittika", deity: "Agni", symbol: "Razor/Flame", theme: "Purification & Courage", element: "Fire" },
  { name: "Rohini", deity: "Brahma", symbol: "Ox Cart", theme: "Growth & Fertility", element: "Earth" },
  { name: "Mrigashira", deity: "Soma", symbol: "Deer's Head", theme: "Seeking & Curiosity", element: "Earth" },
  { name: "Ardra", deity: "Rudra", symbol: "Teardrop", theme: "Destruction & Renewal", element: "Water" },
  { name: "Punarvasu", deity: "Aditi", symbol: "Quiver of Arrows", theme: "Renewal & Return", element: "Water" },
  { name: "Pushya", deity: "Brihaspati", symbol: "Cow's Udder", theme: "Nourishment & Wisdom", element: "Water" },
  { name: "Ashlesha", deity: "Nagas", symbol: "Coiled Serpent", theme: "Kundalini & Mystery", element: "Water" },
  { name: "Magha", deity: "Pitris", symbol: "Royal Throne", theme: "Ancestry & Power", element: "Fire" },
  { name: "Purva Phalguni", deity: "Bhaga", symbol: "Hammock", theme: "Pleasure & Creativity", element: "Fire" },
  { name: "Uttara Phalguni", deity: "Aryaman", symbol: "Bed", theme: "Partnership & Contracts", element: "Fire" },
  { name: "Hasta", deity: "Savitar", symbol: "Open Hand", theme: "Skill & Craftsmanship", element: "Air" },
  { name: "Chitra", deity: "Tvashtar", symbol: "Pearl/Gem", theme: "Artistry & Beauty", element: "Air" },
  { name: "Swati", deity: "Vayu", symbol: "Coral/Sword", theme: "Independence & Movement", element: "Air" },
  { name: "Vishakha", deity: "Indra-Agni", symbol: "Archway", theme: "Purpose & Determination", element: "Air" },
  { name: "Anuradha", deity: "Mitra", symbol: "Lotus", theme: "Friendship & Devotion", element: "Water" },
  { name: "Jyeshtha", deity: "Indra", symbol: "Umbrella/Earring", theme: "Leadership & Protection", element: "Water" },
  { name: "Mula", deity: "Nirriti", symbol: "Root/Lion's Tail", theme: "Foundation & Investigation", element: "Fire" },
  { name: "Purva Ashadha", deity: "Apas", symbol: "Elephant Tusk", theme: "Invincibility & Purification", element: "Water" },
  { name: "Uttara Ashadha", deity: "Vishvadevas", symbol: "Elephant Tusk", theme: "Victory & Permanence", element: "Fire" },
  { name: "Shravana", deity: "Vishnu", symbol: "Three Footprints", theme: "Learning & Connection", element: "Air" },
  { name: "Dhanishtha", deity: "Vasus", symbol: "Drum", theme: "Abundance & Rhythm", element: "Air" },
  { name: "Shatabhisha", deity: "Varuna", symbol: "Empty Circle", theme: "Healing & Secrets", element: "Air" },
  { name: "Purva Bhadrapada", deity: "Aja Ekapada", symbol: "Sword/Two Faces", theme: "Duality & Transformation", element: "Fire" },
  { name: "Uttara Bhadrapada", deity: "Ahir Budhnya", symbol: "Twins/Back Legs", theme: "Depth & Foundation", element: "Water" },
  { name: "Revati", deity: "Pushan", symbol: "Fish/Drum", theme: "Journey's End & Nourishment", element: "Water" }
];

// === 36 EGYPTIAN DECANS ===
export const DECANS = [
  { sign: "Aries", degree: 0, deity: "Mars", theme: "Initiation & Action" },
  { sign: "Aries", degree: 10, deity: "Sun", theme: "Leadership & Courage" },
  { sign: "Aries", degree: 20, deity: "Venus", theme: "Passion & Desire" },
  { sign: "Taurus", degree: 30, deity: "Mercury", theme: "Material Wisdom" },
  { sign: "Taurus", degree: 40, deity: "Moon", theme: "Sensuality & Growth" },
  { sign: "Taurus", degree: 50, deity: "Saturn", theme: "Stability & Patience" },
  { sign: "Gemini", degree: 60, deity: "Jupiter", theme: "Communication & Learning" },
  { sign: "Gemini", degree: 70, deity: "Mars", theme: "Mental Agility" },
  { sign: "Gemini", degree: 80, deity: "Sun", theme: "Expression & Wit" },
  { sign: "Cancer", degree: 90, deity: "Venus", theme: "Nurturing & Emotion" },
  { sign: "Cancer", degree: 100, deity: "Mercury", theme: "Intuition & Memory" },
  { sign: "Cancer", degree: 110, deity: "Moon", theme: "Protection & Care" },
  { sign: "Leo", degree: 120, deity: "Saturn", theme: "Royal Authority" },
  { sign: "Leo", degree: 130, deity: "Jupiter", theme: "Generosity & Pride" },
  { sign: "Leo", degree: 140, deity: "Mars", theme: "Creative Power" },
  { sign: "Virgo", degree: 150, deity: "Sun", theme: "Analysis & Service" },
  { sign: "Virgo", degree: 160, deity: "Venus", theme: "Refinement & Health" },
  { sign: "Virgo", degree: 170, deity: "Mercury", theme: "Mastery & Detail" },
  { sign: "Libra", degree: 180, deity: "Moon", theme: "Balance & Harmony" },
  { sign: "Libra", degree: 190, deity: "Saturn", theme: "Justice & Partnership" },
  { sign: "Libra", degree: 200, deity: "Jupiter", theme: "Diplomacy & Beauty" },
  { sign: "Scorpio", degree: 210, deity: "Mars", theme: "Intensity & Power" },
  { sign: "Scorpio", degree: 220, deity: "Sun", theme: "Transformation & Death" },
  { sign: "Scorpio", degree: 230, deity: "Venus", theme: "Rebirth & Desire" },
  { sign: "Sagittarius", degree: 240, deity: "Mercury", theme: "Philosophy & Adventure" },
  { sign: "Sagittarius", degree: 250, deity: "Moon", theme: "Expansion & Truth" },
  { sign: "Sagittarius", degree: 260, deity: "Saturn", theme: "Higher Wisdom" },
  { sign: "Capricorn", degree: 270, deity: "Jupiter", theme: "Ambition & Structure" },
  { sign: "Capricorn", degree: 280, deity: "Mars", theme: "Discipline & Achievement" },
  { sign: "Capricorn", degree: 290, deity: "Sun", theme: "Mastery & Authority" },
  { sign: "Aquarius", degree: 300, deity: "Venus", theme: "Innovation & Community" },
  { sign: "Aquarius", degree: 310, deity: "Mercury", theme: "Revolution & Ideas" },
  { sign: "Aquarius", degree: 320, deity: "Moon", theme: "Humanitarian Vision" },
  { sign: "Pisces", degree: 330, deity: "Saturn", theme: "Mysticism & Compassion" },
  { sign: "Pisces", degree: 340, deity: "Jupiter", theme: "Spiritual Unity" },
  { sign: "Pisces", degree: 350, deity: "Mars", theme: "Transcendence & Surrender" }
];

// === HELPER FUNCTIONS ===
export function getSignIndex(sign) {
  return Math.max(0, SIGNS.indexOf(sign));
}

export function getElement(sign) {
  for (const [element, signs] of Object.entries(ELEMENTS)) {
    if (signs.includes(sign)) return element;
  }
  return "Unknown";
}

export function getModality(sign) {
  for (const [modality, signs] of Object.entries(MODALITIES)) {
    if (signs.includes(sign)) return modality;
  }
  return "Unknown";
}

export function getRuler(sign) {
  return RULERS[sign] || "Unknown";
}

// === NAKSHATRA CALCULATION ===
export function getNakshatra(moonSign, moonDegree = null) {
  if (moonDegree === null) {
    const signIndex = getSignIndex(moonSign);
    moonDegree = signIndex * 30 + 15;
  }
  const nakshatraIndex = Math.floor((moonDegree % 360) / 13.333);
  return NAKSHATRAS[nakshatraIndex] || NAKSHATRAS[0];
}

// === DECAN CALCULATION ===
export function getDecan(sign, degree = 15) {
  const signIndex = getSignIndex(sign);
  const absoluteDegree = signIndex * 30 + degree;
  const decanIndex = Math.floor(absoluteDegree / 10);
  return DECANS[decanIndex] || DECANS[0];
}

// === STAT GENERATION (Deterministic based on chart) ===
export function generateStats(sun, moon, rising) {
  const seed = (getSignIndex(sun) * 13 + getSignIndex(moon) * 7 + getSignIndex(rising) * 11) % 97 + 3;

  function roll(min, max, k) {
    const r = Math.sin(seed * k) * 10000;
    const frac = r - Math.floor(r);
    return Math.round(min + frac * (max - min));
  }

  const sunElement = getElement(sun);
  const moonElement = getElement(moon);

  const stats = {
    vitalEnergy: roll(55, 98, 1) + (sunElement === "Fire" ? 10 : 0),
    frequency: roll(50, 99, 2) + (sunElement === "Air" ? 10 : 0),
    focus: roll(40, 95, 3) + (moonElement === "Earth" ? 10 : 0),
    flow: roll(35, 96, 4) + (moonElement === "Water" ? 10 : 0),
    power: roll(45, 99, 5) + (getModality(sun) === "Cardinal" ? 10 : 0),
    alignment: Math.min(100, Math.round((getSignIndex(sun) + getSignIndex(moon) + getSignIndex(rising)) * 3.2))
  };

  return stats;
}

// === CHAKRA ALIGNMENT GENERATION ===
export function generateChakras(sun, moon, rising) {
  function elementBias(sign) {
    const idx = getSignIndex(sign);
    if ([0, 4, 8].includes(idx)) return [6, 10, 18, 6, 6, 12, 10];     // Fire
    if ([1, 5, 9].includes(idx)) return [16, 14, 8, 8, 8, 8, 8];       // Earth
    if ([2, 6, 10].includes(idx)) return [8, 8, 8, 10, 14, 16, 10];    // Air
    return [10, 12, 10, 16, 10, 10, 12];                               // Water
  }

  const seed = getSignIndex(sun) * getSignIndex(moon) * getSignIndex(rising);
  const bias = elementBias(sun).map((v, i) => v + elementBias(moon)[i] / 2 + elementBias(rising)[i] / 2);

  const chakraNames = ["Root", "Sacral", "Solar", "Heart", "Throat", "Third Eye", "Crown"];
  const chakras = chakraNames.map((name, i) => {
    const base = 20 + Math.floor(Math.sin(seed + i) * 10000) % 55;
    const value = Math.min(100, Math.round((base + bias[i]) / 2));
    return { name, value };
  });

  return chakras;
}

// === COMPLETE NATAL CHART GENERATION ===
export function generateNatalChart(birthData) {
  const { sun, moon, rising } = birthData;

  const chart = {
    sun: {
      sign: sun,
      element: getElement(sun),
      modality: getModality(sun),
      ruler: getRuler(sun)
    },
    moon: {
      sign: moon,
      element: getElement(moon),
      modality: getModality(moon),
      ruler: getRuler(moon),
      nakshatra: getNakshatra(moon)
    },
    rising: {
      sign: rising,
      element: getElement(rising),
      modality: getModality(rising),
      ruler: getRuler(rising)
    },
    decan: getDecan(sun),
    stats: generateStats(sun, moon, rising),
    chakras: generateChakras(sun, moon, rising)
  };

  return chart;
}
