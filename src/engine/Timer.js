/**
 * Timer — Delta time management and slow-motion support.
 */
export class Timer {
  constructor() {
    this.lastTime = 0;
    this.deltaTime = 0;        // Raw dt in seconds
    this.dt = 0;               // Scaled dt (affected by slow-mo)
    this.frameCount = 0;
    this.slowMotion = 1.0;     // 1.0 = normal, 0.5 = half speed, etc.
    this.elapsed = 0;          // Total elapsed game-time seconds

    // FPS tracking
    this._fpsFrames = 0;
    this._fpsLastTime = 0;
    this.fps = 0;
  }

  start() {
    this.lastTime = performance.now();
    this._fpsLastTime = this.lastTime;
  }

  /** Call at the top of each frame with the rAF timestamp. */
  tick(timestamp) {
    this.deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap at 50ms
    this.dt = this.deltaTime * this.slowMotion;
    this.lastTime = timestamp;
    this.frameCount++;
    this.elapsed += this.dt;

    // FPS counter
    this._fpsFrames++;
    if (timestamp - this._fpsLastTime >= 500) {
      this.fps = Math.round((this._fpsFrames * 1000) / (timestamp - this._fpsLastTime));
      this._fpsFrames = 0;
      this._fpsLastTime = timestamp;
    }
  }

  setSlowMotion(factor, duration = 0) {
    this.slowMotion = factor;
    if (duration > 0) {
      setTimeout(() => { this.slowMotion = 1.0; }, duration * 1000);
    }
  }
}
