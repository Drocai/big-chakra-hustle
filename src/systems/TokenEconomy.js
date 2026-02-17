/**
 * TokenEconomy — Star Token system.
 * Tokens from: kills, pickups, coherence, bosses.
 * Spent on: permanent upgrades, cosmetics, death continues.
 */
import { CONFIG } from '../config.js';

export class TokenEconomy {
  constructor() {
    this.tokens = 0;
    this.totalEarned = 0;
    this.continuesCost = 5; // increases each use
    this.continuesUsed = 0;

    // Permanent upgrades purchased
    this.upgrades = {};

    // Sparkle animation queue
    this._sparkles = [];
  }

  addTokens(amount) {
    const bonus = CONFIG._tokenGainBonus || 1;
    const gained = Math.floor(amount * bonus);
    this.tokens += gained;
    this.totalEarned += gained;
    return gained;
  }

  spendTokens(amount) {
    if (this.tokens >= amount) {
      this.tokens -= amount;
      return true;
    }
    return false;
  }

  /** Cost for a death continue (increases each time). */
  getContinueCost() {
    return this.continuesCost + this.continuesUsed * 3;
  }

  /** Use tokens to continue after death. */
  useContinue() {
    const cost = this.getContinueCost();
    if (this.spendTokens(cost)) {
      this.continuesUsed++;
      return true;
    }
    return false;
  }

  /** Reset per-run state (keeps tokens and upgrades). */
  resetRun() {
    this.continuesUsed = 0;
  }

  /** Save to object (for localStorage). */
  serialize() {
    return {
      tokens: this.tokens,
      totalEarned: this.totalEarned,
      upgrades: { ...this.upgrades }
    };
  }

  /** Load from object. */
  deserialize(data) {
    if (!data) return;
    this.tokens = data.tokens || 0;
    this.totalEarned = data.totalEarned || 0;
    this.upgrades = data.upgrades || {};
  }
}
