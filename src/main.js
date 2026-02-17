/**
 * BIG CHAKRA HUSTLE — Main Entry Point
 * Bootstrap: init canvas, start game loop.
 */
import { Game } from './engine/Game.js';
import { CONFIG } from './config.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

// Debug mode toggle: press F3
window.addEventListener('keydown', e => {
  if (e.code === 'F3') {
    CONFIG.display.debugMode = !CONFIG.display.debugMode;
    e.preventDefault();
  }
});

// Start the game
game.start();

// Expose for debugging in console
window.__game = game;
