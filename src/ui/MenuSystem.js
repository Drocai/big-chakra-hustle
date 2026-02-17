/**
 * MenuSystem — Shop screen for spending Star Tokens on permanent upgrades.
 */
import { CONFIG } from '../config.js';

const SHOP_ITEMS = [
  { name: 'Max HP +10', cost: 5, stat: 'maxHP', value: 10, max: 200 },
  { name: 'Attack +5', cost: 8, stat: 'attackDamage', value: 5, max: 80 },
  { name: 'Energy Regen +', cost: 6, stat: 'chakraRegen', value: 0.03, max: 0.5 },
  { name: 'Dash Speed +', cost: 7, stat: 'dashSpeed', value: 2, max: 40 },
  { name: 'Extra Jump', cost: 15, stat: 'extraJump', value: 1, max: 1 },
  { name: 'Aura: Fire', cost: 20, stat: 'aura', value: 'fire', cosmetic: true },
  { name: 'Aura: Water', cost: 20, stat: 'aura', value: 'water', cosmetic: true },
  { name: 'Aura: Cosmic', cost: 30, stat: 'aura', value: 'cosmic', cosmetic: true }
];

export class ShopScreen {
  constructor() {
    this.selectedIndex = 0;
    this.items = SHOP_ITEMS;
    this.purchased = new Set();
  }

  handleInput(input, tokens) {
    if (input.justPressed('ArrowUp')) {
      this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
    }
    if (input.justPressed('ArrowDown')) {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
    }

    // Purchase
    if (input.justPressed('Enter') || input.justPressed('KeyZ')) {
      const item = this.items[this.selectedIndex];
      if (tokens >= item.cost && !this.purchased.has(item.name)) {
        this.purchased.add(item.name);
        return { item, cost: item.cost };
      }
    }

    // Exit
    if (input.justPressed('Escape')) {
      return { exit: true };
    }

    return null;
  }

  draw(ctx, width, height, tokens, frameCount) {
    ctx.fillStyle = 'rgba(5, 5, 16, 0.95)';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    ctx.save();
    ctx.textAlign = 'center';

    // Title
    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.fillStyle = CONFIG.colors.gold;
    ctx.shadowBlur = 15;
    ctx.shadowColor = CONFIG.colors.gold;
    ctx.fillText('FREQUENCY SHOP', cx, 60);
    ctx.shadowBlur = 0;

    // Token count
    ctx.font = '16px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Star Tokens: ${tokens}`, cx, 90);

    // Items
    let y = 140;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const isSelected = i === this.selectedIndex;
      const isPurchased = this.purchased.has(item.name);
      const canAfford = tokens >= item.cost;

      if (isSelected) {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(cx - 180, y - 16, 360, 36);
      }

      ctx.font = isSelected ? 'bold 16px monospace' : '14px monospace';
      ctx.fillStyle = isPurchased ? '#555' : (canAfford ? '#fff' : '#666');
      ctx.fillText(
        `${isPurchased ? '[OWNED] ' : ''}${item.name} — ${item.cost} Tokens`,
        cx, y
      );

      y += 40;
    }

    // Instructions
    const alpha = 0.5 + Math.sin(frameCount * 0.06) * 0.3;
    ctx.globalAlpha = alpha;
    ctx.font = '14px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('ENTER to buy  |  ESC to continue', cx, height - 40);
    ctx.globalAlpha = 1;

    ctx.restore();
  }
}
