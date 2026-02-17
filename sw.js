/**
 * Service Worker — Offline cache for PWA support.
 */
const CACHE_NAME = 'bigchakrahustle-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/game.css',
  '/manifest.json',
  '/src/main.js',
  '/src/config.js',
  '/src/engine/Game.js',
  '/src/engine/Camera.js',
  '/src/engine/Input.js',
  '/src/engine/Timer.js',
  '/src/entities/Player.js',
  '/src/entities/Platform.js',
  '/src/entities/Shard.js',
  '/src/entities/Enemy.js',
  '/src/entities/bosses/BossBase.js',
  '/src/entities/bosses/AllBosses.js',
  '/src/systems/ParticleSystem.js',
  '/src/systems/LevelGenerator.js',
  '/src/systems/WorldThemes.js',
  '/src/systems/AudioEngine.js',
  '/src/systems/ChakraPowers.js',
  '/src/systems/TokenEconomy.js',
  '/src/systems/SaveSystem.js',
  '/src/data/astroEngine.js',
  '/src/data/ChakraData.js',
  '/src/data/NakshatraEffects.js',
  '/src/data/DecanModifiers.js',
  '/src/graphics/DrawLib.js',
  '/src/graphics/SacredGeometry.js',
  '/src/graphics/Effects.js',
  '/src/ui/HUD.js',
  '/src/ui/MenuSystem.js',
  '/src/ui/Notifications.js',
  '/src/ui/CharacterCreation.js',
  '/src/ui/CoherenceMinigame.js',
  '/src/ui/DialogSystem.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache fresh copy
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
