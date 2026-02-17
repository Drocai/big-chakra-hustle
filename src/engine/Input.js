/**
 * Input — Keyboard + touch + gamepad with action mapping.
 * Extends the prototype's raw keys{} approach into an action-based system.
 */
export class Input {
  constructor() {
    // Raw key state (preserving prototype pattern)
    this.keys = {};

    // Action state — true while held
    this.actions = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      attack: false,
      dash: false,
      switchZodiac: false,
      pause: false,
      confirm: false
    };

    // Single-press actions (consumed after reading)
    this._justPressed = {};

    // Touch state
    this.touch = { active: false, joystick: { x: 0, y: 0 }, buttons: {} };
    this._isTouchDevice = false;

    this._bindKeyboard();
    this._detectTouch();
  }

  _bindKeyboard() {
    window.addEventListener('keydown', e => {
      if (this.keys[e.code]) return; // ignore held repeats
      this.keys[e.code] = true;
      this._justPressed[e.code] = true;
    });

    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
  }

  _detectTouch() {
    const check = () => {
      this._isTouchDevice = true;
      window.removeEventListener('touchstart', check);
    };
    window.addEventListener('touchstart', check, { once: true });
  }

  get isTouchDevice() { return this._isTouchDevice; }

  /** Call once per frame to map raw keys → actions. */
  update() {
    const k = this.keys;

    this.actions.left = k['ArrowLeft'] || k['KeyA'] || false;
    this.actions.right = k['ArrowRight'] || k['KeyD'] || false;
    this.actions.up = k['ArrowUp'] || k['KeyW'] || false;
    this.actions.down = k['ArrowDown'] || k['KeyS'] || false;
    this.actions.jump = k['Space'] || k['ArrowUp'] || k['KeyW'] || false;
    this.actions.attack = k['KeyC'] || k['KeyJ'] || false;
    this.actions.dash = k['KeyX'] || k['KeyK'] || k['ShiftLeft'] || false;
    this.actions.switchZodiac = k['KeyZ'] || k['KeyL'] || false;
    this.actions.pause = k['Escape'] || k['KeyP'] || false;
    this.actions.confirm = k['Enter'] || k['Space'] || false;
  }

  /** Returns true only on the frame the key was first pressed. */
  justPressed(code) {
    if (this._justPressed[code]) {
      this._justPressed[code] = false;
      return true;
    }
    return false;
  }

  /** Check if an action was just pressed this frame. */
  actionJustPressed(action) {
    const mappings = {
      jump: ['Space', 'ArrowUp', 'KeyW'],
      attack: ['KeyC', 'KeyJ'],
      dash: ['KeyX', 'KeyK', 'ShiftLeft'],
      switchZodiac: ['KeyZ', 'KeyL'],
      pause: ['Escape', 'KeyP'],
      confirm: ['Enter', 'Space'],
      power1: ['Digit1'], power2: ['Digit2'], power3: ['Digit3'],
      power4: ['Digit4'], power5: ['Digit5'], power6: ['Digit6'],
      power7: ['Digit7']
    };

    const codes = mappings[action];
    if (!codes) return false;
    return codes.some(c => this.justPressed(c));
  }

  /** Call at end of frame to clear one-shot state. */
  endFrame() {
    // justPressed flags are consumed on read, so nothing needed here
  }
}
