/**
 * SaveSystem — localStorage persistence.
 * Run data (cleared on death) + persistent data (tokens, upgrades, high score, birth chart).
 */

const SAVE_KEY = 'bigchakrahustle_save';

export class SaveSystem {
  constructor() {
    this.persistent = {
      tokens: 0,
      totalEarned: 0,
      highScore: 0,
      upgrades: {},
      birthChart: null,
      settings: {
        volume: 0.5,
        crt: false,
        shake: true,
        musicVolume: 0.3
      }
    };
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.persistent));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  }

  load() {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.persistent = { ...this.persistent, ...parsed };
        return true;
      }
    } catch (e) {
      console.warn('Load failed:', e);
    }
    return false;
  }

  updateHighScore(score) {
    if (score > this.persistent.highScore) {
      this.persistent.highScore = score;
      this.save();
      return true;
    }
    return false;
  }

  saveBirthChart(chart) {
    this.persistent.birthChart = chart;
    this.save();
  }

  saveTokens(tokens) {
    this.persistent.tokens = tokens;
    this.save();
  }

  saveSettings(settings) {
    this.persistent.settings = { ...this.persistent.settings, ...settings };
    this.save();
  }

  clearAll() {
    localStorage.removeItem(SAVE_KEY);
    this.persistent = {
      tokens: 0, totalEarned: 0, highScore: 0,
      upgrades: {}, birthChart: null,
      settings: { volume: 0.5, crt: false, shake: true, musicVolume: 0.3 }
    };
  }
}
