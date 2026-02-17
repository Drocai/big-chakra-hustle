/**
 * Game — Master state machine, update/draw orchestrator.
 * Integrates ALL systems: engine, entities, audio, VFX, UI, astrology, bosses.
 */
import { CONFIG } from '../config.js';
import { Timer } from './Timer.js';
import { Input } from './Input.js';
import { Camera } from './Camera.js';
import { Player } from '../entities/Player.js';
import { Platform } from '../entities/Platform.js';
import { Shard } from '../entities/Shard.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { Enemy } from '../entities/Enemy.js';
import { NotificationSystem } from '../ui/Notifications.js';
import { CharacterCreation } from '../ui/CharacterCreation.js';
import { ChakraPowers } from '../systems/ChakraPowers.js';
import { getNakshatraEffect } from '../data/NakshatraEffects.js';
import { getDecanModifier } from '../data/DecanModifiers.js';
import { LevelGenerator } from '../systems/LevelGenerator.js';
import { drawWorldBackground } from '../systems/WorldThemes.js';
import { AudioEngine } from '../systems/AudioEngine.js';
import { TokenEconomy } from '../systems/TokenEconomy.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { Effects } from '../graphics/Effects.js';
import { HUD } from '../ui/HUD.js';
import { DialogSystem } from '../ui/DialogSystem.js';
import { CoherenceMinigame } from '../ui/CoherenceMinigame.js';
import { ShopScreen } from '../ui/MenuSystem.js';
import { createBoss } from '../entities/bosses/AllBosses.js';
import { flowerOfLife, metatronsCube } from '../graphics/SacredGeometry.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;

    // Core engine
    this.timer = new Timer();
    this.input = new Input();
    this.camera = null;
    this.particles = new ParticleSystem();

    // Systems
    this.audio = new AudioEngine();
    this.tokenEconomy = new TokenEconomy();
    this.saveSystem = new SaveSystem();
    this.levelGen = new LevelGenerator();
    this.effects = new Effects();

    // UI
    this.notifications = new NotificationSystem();
    this.hud = new HUD();
    this.dialog = new DialogSystem();
    this.coherenceGame = new CoherenceMinigame(this.audio);
    this.shop = new ShopScreen();

    // Astrology
    this.charCreate = new CharacterCreation();
    this.natalChart = null;
    this.chakraPowers = new ChakraPowers();
    this.nakshatraEffect = null;
    this.decanModifier = null;

    // Entities
    this.player = null;
    this.platforms = [];
    this.shards = [];
    this.enemies = [];
    this.boss = null;

    // State
    this.state = CONFIG.states.TITLE;
    this._prevState = null;
    this._titlePulse = 0;

    // Enemy spawn tracking
    this._platformsGenerated = 0;

    // Starfield
    this.stars = [];

    // Share state
    this._shareButtonBounds = null;
    this._lastAdTime = 0;

    // Load saved data
    this.saveSystem.load();
    this.tokenEconomy.tokens = this.saveSystem.persistent.tokens;

    this._resize();
    window.addEventListener('resize', () => this._resize());

    // Click handler for share button
    this.canvas.addEventListener('click', e => {
      if (this.state === CONFIG.states.GAME_OVER && this._shareButtonBounds) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const b = this._shareButtonBounds;
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          this.shareRun();
        }
      }
    });
  }

  _resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.camera = new Camera(this.width, this.height);
    this._initStars();
  }

  _initStars(count = CONFIG.starfield.count) {
    this.stars.length = 0;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * CONFIG.starfield.maxSize,
        a: CONFIG.starfield.minAlpha + Math.random() * (1 - CONFIG.starfield.minAlpha),
        speed: CONFIG.starfield.minSpeed + Math.random() * (CONFIG.starfield.maxSpeed - CONFIG.starfield.minSpeed)
      });
    }
  }

  setState(newState) {
    this._prevState = this.state;
    this.state = newState;
  }

  // --- INIT GAME ---
  initGame() {
    this.player = new Player(CONFIG.player.startX, this.height - 150, this.height);
    this.platforms = [];
    this.shards = [];
    this.enemies = [];
    this.boss = null;
    this._platformsGenerated = 0;

    // Generate initial room
    const roomData = this.levelGen.generateRoom(this.height);
    this.platforms = roomData.platforms;
    this.shards = roomData.shards;
    this.enemies = roomData.enemies;

    // Start world music
    this.audio.startWorldMusic(this.levelGen.currentWorld);
  }

  addNextPlatform() {
    const result = this.levelGen.generateNextPlatform(this.height);
    this.platforms.push(result.platform);
    if (result.shard) this.shards.push(result.shard);
    if (result.enemy) this.enemies.push(result.enemy);
    this._platformsGenerated++;

    // Advance room every ~30 platforms (if not in boss room or boss defeated)
    if (this._platformsGenerated > 0 && this._platformsGenerated % 30 === 0 && !this.boss) {
      const worldChanged = this.levelGen.advanceRoom();
      if (worldChanged) {
        this.audio.startWorldMusic(this.levelGen.currentWorld);
        this.notifications.show(`Entering ${this.levelGen.worldConfig.name.toUpperCase()}`, this.width / 2, this.height / 2, {
          color: this.levelGen.worldConfig.color, size: 22, duration: 100
        });
      } else {
        this.notifications.show(this.levelGen.locationString, this.width / 2, 60, {
          color: this.levelGen.worldConfig.color, size: 16, duration: 60
        });
      }
      this._platformsGenerated = 0;
    }
  }

  // --- START ---
  start() {
    this.timer.start();
    this._loop(performance.now());
  }

  _loop(timestamp) {
    this.timer.tick(timestamp);
    this.input.update();
    this.update();
    this.draw();
    this.input.endFrame();
    requestAnimationFrame(ts => this._loop(ts));
  }

  // --- UPDATE ---
  update() {
    const frameCount = this.timer.frameCount;

    // Dialog takes priority
    if (this.dialog.active) {
      this.dialog.update();
      if (this.input.actionJustPressed('confirm')) this.dialog.skip();
      return;
    }

    // Coherence minigame overlay
    if (this.coherenceGame.active) {
      this.coherenceGame.update();
      this.coherenceGame.handleInput(this.input);
      if (!this.coherenceGame.active) {
        this.setState(CONFIG.states.PLAYING);
      }
      return;
    }

    switch (this.state) {
      case CONFIG.states.TITLE:
        this._updateTitle();
        break;
      case CONFIG.states.CHARACTER_CREATE:
        this._updateCharacterCreate();
        break;
      case CONFIG.states.PLAYING:
        this._updatePlaying(frameCount);
        break;
      case CONFIG.states.PAUSED:
        this._updatePaused();
        break;
      case CONFIG.states.GAME_OVER:
        this._updateGameOver();
        break;
      case 'SHOP':
        this._updateShop();
        break;
    }
  }

  _updateTitle() {
    this._titlePulse += 0.03;
    if (this.input.actionJustPressed('confirm')) {
      this.audio.init();
      this.audio.sfxMenuSelect();
      this.charCreate = new CharacterCreation();
      this.setState(CONFIG.states.CHARACTER_CREATE);
    }
  }

  _updateCharacterCreate() {
    const chart = this.charCreate.handleInput(this.input);
    if (chart) {
      this.natalChart = chart;
      this.nakshatraEffect = getNakshatraEffect(chart.moon.nakshatra.name);
      this.decanModifier = getDecanModifier(chart.decan.sign, chart.decan.degree);
      this._applyBirthChart(chart);

      // Reset level generator
      const seed = chart.stats.alignment * 1000 + chart.stats.vitalEnergy;
      this.levelGen = new LevelGenerator(seed);
      if (this.decanModifier && this.decanModifier.modify) {
        const mods = {};
        this.decanModifier.modify(mods);
        this.levelGen.applyModifiers(mods);
      }

      this.tokenEconomy.resetRun();
      this.initGame();
      this.setState(CONFIG.states.PLAYING);
      this.notifications.showAffirmation(this.width);
      this.audio.sfxMenuSelect();

      // Analytics: track run start
      if (window.BigChakraAnalytics) {
        window.BigChakraAnalytics.track('run_start', {
          sun: chart.sun.sign, moon: chart.moon.sign, rising: chart.rising.sign
        });
      }

      // Save birth chart
      this.saveSystem.saveBirthChart({
        sun: chart.sun.sign,
        moon: chart.moon.sign,
        rising: chart.rising.sign
      });
    }
  }

  _applyBirthChart(chart) {
    const s = chart.stats;
    CONFIG.player.maxHP = 80 + Math.floor(s.vitalEnergy * 0.4);
    const speedMult = 0.9 + s.frequency / 500;
    CONFIG.zodiac.AIRES.speed = 8 * speedMult;
    CONFIG.zodiac.KOIDON.speed = 5 * speedMult;
    CONFIG.player.chakraRegen = 0.08 + s.flow / 1000;
    if (this.nakshatraEffect && this.nakshatraEffect.modifyConfig) {
      this.nakshatraEffect.modifyConfig(CONFIG);
    }
  }

  _updatePlaying(frameCount) {
    // Pause
    if (this.input.actionJustPressed('pause')) {
      this.setState(CONFIG.states.PAUSED);
      return;
    }

    // Input actions
    if (this.input.actionJustPressed('jump')) {
      this.player.jump(this.particles);
      this.audio.sfxJump();
    }
    if (this.input.actionJustPressed('dash')) {
      this.player.dash(this.particles, this.camera);
      this.audio.sfxDash();
    }
    if (this.input.actionJustPressed('switchZodiac')) {
      this.player.switchZodiac(this.particles);
      this.audio.sfxSwitch();
    }
    if (this.input.actionJustPressed('attack')) {
      this.player.attack();
      this.audio.sfxAttack();
    }

    // Player update
    this.player.update(
      this.input, this.platforms, this.shards, this.particles,
      frameCount, this.width, this.height
    );

    // Shard updates
    for (let i = 0; i < this.shards.length; i++) {
      this.shards[i].update(frameCount);
    }

    // Particles
    this.particles.update();

    // Enemy updates + combat
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(this.player, this.platforms, frameCount);

      // Player attack hits enemy
      if (enemy.hitByAttack(this.player) && !enemy._hitThisAttack) {
        enemy._hitThisAttack = true;
        const dir = this.player.facingRight ? 1 : -1;
        enemy.takeDamage(CONFIG.player.attackDamage, dir, this.particles);
        this.notifications.showDamage(CONFIG.player.attackDamage, enemy.x + enemy.w / 2, enemy.y);
        this.camera.shake(3);
        this.audio.sfxHit();

        if (enemy.dead) {
          this.player.addScore(enemy.scoreValue);
          this.notifications.showScore(enemy.scoreValue, this.player.combo, enemy.x + enemy.w / 2, enemy.y - 20);
          this.tokenEconomy.addTokens(1);
          if (Math.random() < 0.4) {
            const dropType = Math.random() < 0.7 ? 'chakra' : 'health';
            this.shards.push(new Shard(enemy.x + enemy.w / 2, enemy.y, dropType));
          }
        }
      }
      if (!this.player.attacking) enemy._hitThisAttack = false;

      // Contact damage
      if (enemy.collidesWithPlayer(this.player)) {
        const dir = this.player.x < enemy.x ? -1 : 1;
        this.player.takeDamage(enemy.damage, dir);
        this.notifications.showDamage(enemy.damage, this.player.x + this.player.w / 2, this.player.y);
        this.camera.shake(6);
        this.audio.sfxHit();
      }

      if (enemy.shouldRemove) this.enemies.splice(i, 1);
    }

    // Boss update
    if (this.boss && this.boss.active) {
      this.boss.update(this.player, this.platforms, this.particles, this.camera, frameCount);

      if (this.boss.hitByAttack(this.player) && !this.boss._hitThisAttack) {
        this.boss._hitThisAttack = true;
        const dir = this.player.facingRight ? 1 : -1;
        this.boss.takeDamage(CONFIG.player.attackDamage, dir, this.particles);
        this.camera.shake(4);
        this.audio.sfxHit();

        if (this.boss.defeated) {
          this.player.addScore(this.boss.scoreValue);
          this.tokenEconomy.addTokens(10);
          this.chakraPowers.unlock(this.levelGen.currentWorld);
          this.particles.emit(this.boss.x + this.boss.w / 2, this.boss.y + this.boss.h / 2, this.boss.chakra.color, 50, 15, 50);
          this.camera.shake(20);
          this.audio.sfxPowerActivate(this.levelGen.currentWorld);
          this.notifications.show(`${this.boss.chakra.shortName} POWER UNLOCKED!`, this.width / 2, this.height / 2 - 50, {
            color: this.boss.chakra.color, size: 24, duration: 120
          });

          // Advance world
          this.levelGen.advanceWorld();
          this.audio.startWorldMusic(this.levelGen.currentWorld);
          this.boss = null;
        }
      }
      if (this.boss && !this.player.attacking) this.boss._hitThisAttack = false;

      if (this.boss && this.boss.collidesWithPlayer(this.player)) {
        this.player.takeDamage(this.boss.contactDamage, this.player.x < this.boss.x ? -1 : 1);
        this.camera.shake(8);
        this.audio.sfxHit();
      }
    }

    // Chakra power activation (keys 1-7)
    for (let i = 0; i < 7; i++) {
      if (this.input.actionJustPressed(`power${i + 1}`)) {
        if (this.chakraPowers.activate(i, this.player, this.enemies, this.particles, this.camera, this.timer)) {
          this.audio.sfxPowerActivate(i);
          this.notifications.show(`${this.chakraPowers.unlocked[i] ? 'POWER ACTIVATED' : ''}`, this.width / 2, this.height / 2 - 30, {
            color: '#ffffff', size: 18, duration: 40
          });
        }
      }
    }

    // Chakra powers
    this.chakraPowers.update();

    // Flow Surge speed boost
    if (this.player._flowSurgeTimer > 0) {
      this.player._flowSurgeTimer--;
      // Temporarily boost player speed while active
      this.player.vx *= 1.04;
    }

    // Notifications
    this.notifications.update();

    // Camera
    this.camera.update();
    const scrollDx = this.camera.follow(this.player);
    if (scrollDx > 0) {
      this.player.x -= scrollDx;
      for (let i = 0; i < this.platforms.length; i++) this.platforms[i].x -= scrollDx;
      for (let i = 0; i < this.shards.length; i++) this.shards[i].x -= scrollDx;
      for (let i = 0; i < this.enemies.length; i++) {
        this.enemies[i].x -= scrollDx;
        this.enemies[i].patrolOrigin -= scrollDx;
      }
      if (this.boss) this.boss.x -= scrollDx;
      this.particles.shift(scrollDx);

      // Remove off-screen platforms using index tracking instead of shift()
      let removeCount = 0;
      while (removeCount < this.platforms.length && this.platforms[removeCount].x + this.platforms[removeCount].w < CONFIG.platform.offscreenRemove) {
        removeCount++;
      }
      if (removeCount > 0) {
        this.platforms.splice(0, removeCount);
        for (let r = 0; r < removeCount; r++) this.addNextPlatform();
      }

      // Boss room trigger: spawn boss after enough platforms in boss room
      if (this.levelGen.isBossRoom && !this.boss && this._platformsGenerated > 15) {
        const bossX = this.player.x + this.width * 0.6;
        const bossY = this.height - 200;
        this.boss = createBoss(this.levelGen.currentWorld, bossX, bossY);
        this.boss.activate();
        this.audio.sfxBossIntro();
        this.audio.startBossMusic(this.levelGen.currentWorld);
        this.dialog.show(`${this.boss.name} awakens...`, {
          speaker: this.boss.name,
          color: this.boss.chakra.color
        });
      }
      // In-place compaction instead of .filter() to avoid allocation every frame
      let sw = 0;
      for (let si = 0; si < this.shards.length; si++) {
        const s = this.shards[si];
        if (s.x > CONFIG.platform.offscreenShardRemove && !s.collected) this.shards[sw++] = s;
      }
      this.shards.length = sw;

      let ew = 0;
      for (let ei = 0; ei < this.enemies.length; ei++) {
        if (this.enemies[ei].x > CONFIG.platform.offscreenShardRemove) this.enemies[ew++] = this.enemies[ei];
      }
      this.enemies.length = ew;
    }

    // Collect sounds
    for (const s of this.shards) {
      if (s.collected && !s._soundPlayed) {
        this.audio.sfxCollect();
        s._soundPlayed = true;
      }
    }

    // Death
    if (this.player.isDead) {
      this.particles.emitPreset('death', this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, this.player.colors.main);
      this.camera.shake(15);
      this.audio.sfxDeath();
      this.audio.stopMusic();
      this.saveSystem.updateHighScore(this.player.score);
      this.saveSystem.saveTokens(this.tokenEconomy.tokens);
      this.setState(CONFIG.states.GAME_OVER);
    }
  }

  _updatePaused() {
    if (this.input.actionJustPressed('pause') || this.input.actionJustPressed('confirm')) {
      this.setState(CONFIG.states.PLAYING);
    }
  }

  _updateGameOver() {
    if (this.input.actionJustPressed('confirm')) {
      // Analytics: track death
      if (window.BigChakraAnalytics) {
        const chart = this.natalChart;
        window.BigChakraAnalytics.track('game_over', {
          score: this.player.score,
          world: this.levelGen.currentWorld,
          sun: chart ? chart.sun.sign : '',
          moon: chart ? chart.moon.sign : '',
          rising: chart ? chart.rising.sign : ''
        });
      }

      // Show interstitial ad at natural pause point
      const proceed = () => {
        if (this.tokenEconomy.tokens > 0) {
          this._showingShop = true;
          this.setState('SHOP');
        } else {
          this.charCreate = new CharacterCreation();
          this.setState(CONFIG.states.CHARACTER_CREATE);
        }
      };

      if (window.BigChakraAds) {
        window.BigChakraAds.showInterstitial().then(proceed).catch(proceed);
      } else {
        proceed();
      }
    }
  }

  _updateShop() {
    const result = this.shop.handleInput(this.input, this.tokenEconomy.tokens);
    if (result) {
      if (result.exit) {
        this._showingShop = false;
        this.charCreate = new CharacterCreation();
        this.setState(CONFIG.states.CHARACTER_CREATE);
      } else if (result.item) {
        this.tokenEconomy.spendTokens(result.cost);
        this.saveSystem.saveTokens(this.tokenEconomy.tokens);
        this.audio.sfxCollect();
        // Apply upgrade
        const item = result.item;
        if (!item.cosmetic && item.stat) {
          if (item.stat === 'maxHP') CONFIG.player.maxHP = Math.min(CONFIG.player.maxHP + item.value, item.max);
          else if (item.stat === 'attackDamage') CONFIG.player.attackDamage = Math.min(CONFIG.player.attackDamage + item.value, item.max);
          else if (item.stat === 'chakraRegen') CONFIG.player.chakraRegen = Math.min(CONFIG.player.chakraRegen + item.value, item.max);
        }
      }
    }
  }

  // --- DRAW ---
  draw() {
    const ctx = this.ctx;
    const frameCount = this.timer.frameCount;

    // Background
    if (this.state === CONFIG.states.PLAYING || this.state === CONFIG.states.PAUSED || this.state === CONFIG.states.GAME_OVER) {
      drawWorldBackground(ctx, this.width, this.height, this.levelGen.currentWorld, frameCount, this.stars);
    } else {
      this._drawDefaultBg(ctx, frameCount);
    }

    // Decorative sacred geometry in background
    if (this.state === CONFIG.states.PLAYING || this.state === CONFIG.states.PAUSED) {
      const worldColor = this.levelGen.worldConfig.color;
      flowerOfLife(ctx, this.width * 0.8, this.height * 0.3, 80, worldColor, 0.06, frameCount * 0.002);
      metatronsCube(ctx, this.width * 0.15, this.height * 0.7, 60, worldColor, 0.05, -frameCount * 0.001);
    }

    switch (this.state) {
      case CONFIG.states.TITLE:
        this._drawTitle(ctx, frameCount);
        break;
      case CONFIG.states.CHARACTER_CREATE:
        this.charCreate.draw(ctx, this.width, this.height, frameCount);
        break;
      case CONFIG.states.PLAYING:
      case CONFIG.states.PAUSED:
        this._drawGame(ctx, frameCount);
        if (this.state === CONFIG.states.PAUSED) this._drawPauseOverlay(ctx);
        break;
      case CONFIG.states.GAME_OVER:
        this._drawGame(ctx, frameCount);
        this._drawGameOver(ctx);
        break;
      case 'SHOP':
        this.shop.draw(ctx, this.width, this.height, this.tokenEconomy.tokens, frameCount);
        break;
    }

    // Overlays
    if (this.coherenceGame.active) {
      this.coherenceGame.draw(ctx, this.width, this.height, frameCount);
    }
    if (this.dialog.active) {
      this.dialog.draw(ctx, this.width, this.height);
    }

    // Post-processing — apply to ALL screens for consistent Trap Fantasy feel
    this.effects.apply(ctx, this.width, this.height, frameCount);

    // Debug
    if (CONFIG.display.debugMode) {
      ctx.fillStyle = '#0f0';
      ctx.font = '12px monospace';
      ctx.fillText(`${this.timer.fps} FPS | P: ${this.particles.activeCount} | W: ${this.levelGen.locationString}`, 10, this.height - 10);
    }
  }

  _drawDefaultBg(ctx, frameCount) {
    const pulse = Math.sin(frameCount * 0.008) * 15;
    const grad = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 80 + pulse,
      this.width / 2, this.height / 2, this.width
    );
    grad.addColorStop(0, '#1a0b2e');
    grad.addColorStop(0.6, '#0a0515');
    grad.addColorStop(1, '#050505');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle perspective grid
    ctx.strokeStyle = '#bc13fe10';
    ctx.lineWidth = 1;
    const gridOff = (frameCount * 0.15) % 50;
    for (let x = -gridOff; x < this.width + 50; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Stars
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const x = (s.x * this.width + frameCount * s.speed * 0.1) % this.width;
      ctx.globalAlpha = s.a * 0.7;
      ctx.fillStyle = i % 7 === 0 ? '#bc13fe' : '#ffffff';
      ctx.fillRect(x, s.y * this.height, s.size, s.size);
    }
    ctx.globalAlpha = 1;
  }

  _drawTitle(ctx, frameCount) {
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Cosmic orb with aggressive bloom
    const orbSize = 70 + Math.sin(this._titlePulse) * 12;
    const orbGrad = ctx.createRadialGradient(cx, cy - 90, 0, cx, cy - 90, orbSize);
    orbGrad.addColorStop(0, 'rgba(255, 0, 85, 0.4)');
    orbGrad.addColorStop(0.4, 'rgba(0, 255, 255, 0.2)');
    orbGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 90, orbSize, 0, Math.PI * 2);
    ctx.fill();

    // Sacred geometry behind title
    flowerOfLife(ctx, cx, cy - 90, orbSize * 0.8, '#bc13fe', 0.12, frameCount * 0.005);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glitch text effect — RGB split
    const titleFont = 'bold 52px "Orbitron", "Rajdhani", monospace';

    // Red offset
    ctx.font = titleFont;
    ctx.fillStyle = '#ff005540';
    ctx.fillText('BIG CHAKRA HUSTLE', cx - 2, cy);

    // Cyan offset
    ctx.fillStyle = '#00ffff40';
    ctx.fillText('BIG CHAKRA HUSTLE', cx + 2, cy);

    // Main title with gradient
    const titleGrad = ctx.createLinearGradient(cx - 250, cy, cx + 250, cy);
    titleGrad.addColorStop(0, '#ff0055');
    titleGrad.addColorStop(0.5, '#ffffff');
    titleGrad.addColorStop(1, '#00ffff');

    ctx.fillStyle = titleGrad;
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ff0055';
    ctx.fillText('BIG CHAKRA HUSTLE', cx, cy);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = '13px "Rajdhani", monospace';
    ctx.fillStyle = '#bc13fe';
    ctx.letterSpacing = '6px';
    ctx.fillText('FREQUENCY FACTORY // 2026', cx, cy + 45);

    ctx.font = '14px "Rajdhani", monospace';
    ctx.fillStyle = '#555';
    ctx.fillText('"We\'re not charging vibrations... we\'re transmitting frequency."', cx, cy + 70);

    // High score
    if (this.saveSystem.persistent.highScore > 0) {
      ctx.font = 'bold 13px "Orbitron", monospace';
      ctx.fillStyle = CONFIG.colors.gold;
      ctx.shadowBlur = 5;
      ctx.shadowColor = CONFIG.colors.gold;
      ctx.fillText(`HIGH SCORE: ${this.saveSystem.persistent.highScore}`, cx, cy + 95);
      ctx.shadowBlur = 0;
    }

    const alpha = 0.5 + Math.sin(frameCount * 0.08) * 0.5;
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 18px "Orbitron", monospace';
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    ctx.fillText('PRESS ENTER TO TRANSMIT', cx, cy + 130);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  _drawGame(ctx, frameCount) {
    this.camera.applyTransform(ctx);

    // Platforms (with off-screen culling)
    for (let i = 0; i < this.platforms.length; i++) {
      const p = this.platforms[i];
      if (p.x + p.w >= 0 && p.x <= this.width) p.draw(ctx);
    }

    // Shards (with off-screen culling)
    for (let i = 0; i < this.shards.length; i++) {
      const s = this.shards[i];
      if (s.x + s.size >= 0 && s.x <= this.width) s.draw(ctx, frameCount);
    }

    // Enemies (with off-screen culling)
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.x + e.w >= 0 && e.x <= this.width) e.draw(ctx, frameCount);
    }

    // Boss
    if (this.boss && this.boss.active) {
      this.boss.draw(ctx, frameCount);
    }

    // Particles
    this.particles.draw(ctx);

    // Player
    if (this.player) {
      this.player.draw(ctx, frameCount);
    }

    this.camera.restoreTransform(ctx);

    // Screen-space UI
    if (this.player) {
      this.hud.tokens = this.tokenEconomy.tokens;
      this.hud.draw(ctx, this.player, this.chakraPowers, this.width, this.height, frameCount,
        this.levelGen.currentWorld, this.levelGen.locationString);
    }

    this.notifications.draw(ctx);
  }

  _drawPauseOverlay(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px "Orbitron", monospace';
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#bc13fe';
    ctx.fillText('PAUSED', this.width / 2, this.height / 2 - 20);
    ctx.shadowBlur = 0;

    ctx.font = '14px "Rajdhani", monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('ESC to resume', this.width / 2, this.height / 2 + 20);

    // Stats
    if (this.natalChart) {
      ctx.font = '12px monospace';
      ctx.fillStyle = '#777';
      ctx.fillText(`${this.natalChart.sun.sign} / ${this.natalChart.moon.sign} / ${this.natalChart.rising.sign}`, this.width / 2, this.height / 2 + 50);
      if (this.nakshatraEffect) {
        ctx.fillText(`Nakshatra: ${this.nakshatraEffect.name} — ${this.nakshatraEffect.passive}`, this.width / 2, this.height / 2 + 70);
      }
    }
    ctx.restore();
  }

  _drawGameOver(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.textAlign = 'center';

    // Glitch text — RGB split on death title
    const deathFont = 'bold 40px "Orbitron", monospace';
    ctx.font = deathFont;

    // Red offset
    ctx.fillStyle = '#ff005550';
    ctx.fillText('VIBRATION DEPLETED', this.width / 2 - 3, this.height / 2 - 70);
    // Cyan offset
    ctx.fillStyle = '#00ffff50';
    ctx.fillText('VIBRATION DEPLETED', this.width / 2 + 3, this.height / 2 - 70);

    ctx.fillStyle = CONFIG.colors.healthRed;
    ctx.shadowBlur = 30;
    ctx.shadowColor = CONFIG.colors.healthRed;
    ctx.fillText('VIBRATION DEPLETED', this.width / 2, this.height / 2 - 70);
    ctx.shadowBlur = 0;

    ctx.font = '18px monospace';
    ctx.fillStyle = '#ccc';
    ctx.fillText(`Score: ${this.player.score}  |  Shards: ${this.player.shards}  |  Tokens: ${this.tokenEconomy.tokens}`, this.width / 2, this.height / 2 - 20);

    // High score
    const isHigh = this.player.score >= this.saveSystem.persistent.highScore;
    if (isHigh && this.player.score > 0) {
      ctx.fillStyle = CONFIG.colors.gold;
      ctx.font = 'bold 16px monospace';
      ctx.fillText('NEW HIGH SCORE!', this.width / 2, this.height / 2 + 10);
    }

    // Share button
    const shareBtnW = 220;
    const shareBtnH = 36;
    const shareBtnX = this.width / 2 - shareBtnW / 2;
    const shareBtnY = this.height / 2 + 40;
    this._shareButtonBounds = { x: shareBtnX, y: shareBtnY, w: shareBtnW, h: shareBtnH };

    ctx.fillStyle = 'rgba(115, 251, 211, 0.15)';
    ctx.strokeStyle = '#73fbd3';
    ctx.lineWidth = 1;
    ctx.fillRect(shareBtnX, shareBtnY, shareBtnW, shareBtnH);
    ctx.strokeRect(shareBtnX, shareBtnY, shareBtnW, shareBtnH);
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#73fbd3';
    ctx.fillText('SHARE YOUR RUN', this.width / 2, shareBtnY + shareBtnH / 2 + 5);

    // Tip jar link
    ctx.font = '12px monospace';
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('Support the Dev', this.width / 2, shareBtnY + shareBtnH + 25);

    const alpha = 0.5 + Math.sin(this.timer.frameCount * 0.08) * 0.5;
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = '#00ffff';
    ctx.fillText('PRESS ENTER TO TRANSMIT AGAIN', this.width / 2, this.height / 2 + 140);
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  /** Generate a shareable URL with run seed and birth chart. */
  getShareURL() {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    if (this.natalChart) {
      params.set('sun', this.natalChart.sun.sign);
      params.set('moon', this.natalChart.moon.sign);
      params.set('rising', this.natalChart.rising.sign);
    }
    if (this.player) params.set('score', this.player.score);
    const seed = this.natalChart ? Math.floor(this.natalChart.stats.alignment * 1000 + this.natalChart.stats.vitalEnergy) : 0;
    params.set('seed', seed);
    return `${base}?${params.toString()}`;
  }

  /** Share the current run via Web Share API or clipboard fallback. */
  async shareRun() {
    if (window.BigChakraAnalytics) window.BigChakraAnalytics.track('share_click');
    const chart = this.natalChart;
    const signs = chart ? `${chart.sun.sign}/${chart.moon.sign}/${chart.rising.sign}` : 'Unknown';
    const score = this.player ? this.player.score : 0;
    const url = this.getShareURL();
    const text = `I scored ${score} in BIG CHAKRA HUSTLE as ${signs}! Can you beat my run?`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'BIG CHAKRA HUSTLE', text, url });
      } catch (e) { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        this.notifications.show('Copied to clipboard!', this.width / 2, this.height / 2 - 20, {
          color: '#73fbd3', size: 16, duration: 60
        });
      } catch (e) {
        // Fallback: prompt
        window.prompt('Copy this link:', `${text}\n${url}`);
      }
    }
  }
}
