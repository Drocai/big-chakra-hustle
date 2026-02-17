/**
 * Input — Keyboard + touch + gamepad with action mapping.
 * Extends the prototype's raw keys{} approach into an action-based system.
 * Touch: virtual joystick (left 40%) + action buttons (right side).
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
    this._touchOverlay = null;

    // Virtual joystick state
    this._joystickTouch = null; // trackingId
    this._joystickOrigin = null; // { x, y }
    this._joystickPos = null; // { x, y }
    this._joystickDeadzone = 20;
    this._joystickMaxRadius = 60;

    // Touch button state: { [buttonName]: touchId }
    this._touchButtons = {};
    this._touchJustPressed = {};

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
      this._createTouchOverlay();
      this._bindTouch();
      window.removeEventListener('touchstart', check);
    };
    window.addEventListener('touchstart', check, { once: true });
  }

  get isTouchDevice() { return this._isTouchDevice; }

  _createTouchOverlay() {
    if (this._touchOverlay) return;

    const overlay = document.createElement('div');
    overlay.id = 'touch-controls';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      z-index: 1000; pointer-events: none; user-select: none; -webkit-user-select: none;
    `;

    // Joystick zone (left 40%)
    const joystickZone = document.createElement('div');
    joystickZone.id = 'joystick-zone';
    joystickZone.style.cssText = `
      position: absolute; left: 0; top: 0; width: 40%; height: 100%;
      pointer-events: auto; touch-action: none;
    `;

    // Joystick visual (hidden until touched)
    const joystickBase = document.createElement('div');
    joystickBase.id = 'joystick-base';
    joystickBase.style.cssText = `
      position: absolute; width: 120px; height: 120px; border-radius: 50%;
      border: 2px solid rgba(115, 251, 211, 0.3); background: rgba(115, 251, 211, 0.05);
      display: none; transform: translate(-50%, -50%); pointer-events: none;
    `;
    const joystickKnob = document.createElement('div');
    joystickKnob.id = 'joystick-knob';
    joystickKnob.style.cssText = `
      position: absolute; width: 50px; height: 50px; border-radius: 50%;
      background: rgba(115, 251, 211, 0.4); border: 2px solid rgba(115, 251, 211, 0.6);
      left: 50%; top: 50%; transform: translate(-50%, -50%); pointer-events: none;
    `;
    joystickBase.appendChild(joystickKnob);
    joystickZone.appendChild(joystickBase);
    overlay.appendChild(joystickZone);

    // Action buttons (right side)
    const btnDefs = [
      { name: 'jump', label: 'JUMP', x: '82%', y: '55%', size: 65, color: '0, 255, 255' },
      { name: 'attack', label: 'ATK', x: '93%', y: '45%', size: 60, color: '255, 42, 0' },
      { name: 'dash', label: 'DASH', x: '73%', y: '65%', size: 55, color: '167, 139, 250' },
    ];

    for (const def of btnDefs) {
      const btn = document.createElement('div');
      btn.dataset.action = def.name;
      btn.style.cssText = `
        position: absolute; left: ${def.x}; top: ${def.y};
        width: ${def.size}px; height: ${def.size}px; border-radius: 50%;
        background: rgba(${def.color}, 0.1); border: 2px solid rgba(${def.color}, 0.4);
        display: flex; align-items: center; justify-content: center;
        font: bold 10px monospace; color: rgba(${def.color}, 0.7);
        transform: translate(-50%, -50%); pointer-events: auto; touch-action: none;
      `;
      btn.textContent = def.label;
      overlay.appendChild(btn);
    }

    // Pause button (top-right, small)
    const pauseBtn = document.createElement('div');
    pauseBtn.dataset.action = 'pause';
    pauseBtn.style.cssText = `
      position: absolute; right: 10px; top: 10px;
      width: 36px; height: 36px; border-radius: 6px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font: bold 14px monospace; color: rgba(255,255,255,0.5);
      pointer-events: auto; touch-action: none;
    `;
    pauseBtn.textContent = '||';
    overlay.appendChild(pauseBtn);

    document.body.appendChild(overlay);
    this._touchOverlay = overlay;
  }

  _bindTouch() {
    const joystickZone = document.getElementById('joystick-zone');
    const joystickBase = document.getElementById('joystick-base');
    const joystickKnob = document.getElementById('joystick-knob');

    // --- JOYSTICK ---
    joystickZone.addEventListener('touchstart', e => {
      e.preventDefault();
      if (this._joystickTouch !== null) return;
      const t = e.changedTouches[0];
      this._joystickTouch = t.identifier;
      this._joystickOrigin = { x: t.clientX, y: t.clientY };
      this._joystickPos = { x: t.clientX, y: t.clientY };

      joystickBase.style.display = 'block';
      joystickBase.style.left = t.clientX + 'px';
      joystickBase.style.top = t.clientY + 'px';
    }, { passive: false });

    joystickZone.addEventListener('touchmove', e => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this._joystickTouch) {
          this._joystickPos = { x: t.clientX, y: t.clientY };

          // Move knob visual
          const dx = t.clientX - this._joystickOrigin.x;
          const dy = t.clientY - this._joystickOrigin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const clampDist = Math.min(dist, this._joystickMaxRadius);
          const angle = Math.atan2(dy, dx);
          const kx = Math.cos(angle) * clampDist;
          const ky = Math.sin(angle) * clampDist;
          joystickKnob.style.left = `calc(50% + ${kx}px)`;
          joystickKnob.style.top = `calc(50% + ${ky}px)`;
        }
      }
    }, { passive: false });

    const joystickEnd = e => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this._joystickTouch) {
          this._joystickTouch = null;
          this._joystickOrigin = null;
          this._joystickPos = null;
          joystickBase.style.display = 'none';
          joystickKnob.style.left = '50%';
          joystickKnob.style.top = '50%';
        }
      }
    };
    joystickZone.addEventListener('touchend', joystickEnd);
    joystickZone.addEventListener('touchcancel', joystickEnd);

    // --- ACTION BUTTONS ---
    const buttons = this._touchOverlay.querySelectorAll('[data-action]');
    buttons.forEach(btn => {
      const action = btn.dataset.action;

      btn.addEventListener('touchstart', e => {
        e.preventDefault();
        this._touchButtons[action] = true;
        this._touchJustPressed[action] = true;
        btn.style.opacity = '0.7';
        btn.style.transform = 'translate(-50%, -50%) scale(0.92)';
      }, { passive: false });

      const btnEnd = e => {
        e.preventDefault();
        this._touchButtons[action] = false;
        btn.style.opacity = '1';
        btn.style.transform = 'translate(-50%, -50%) scale(1)';
      };
      btn.addEventListener('touchend', btnEnd, { passive: false });
      btn.addEventListener('touchcancel', btnEnd, { passive: false });
    });
  }

  /** Call once per frame to map raw keys + touch → actions. */
  update() {
    const k = this.keys;

    // Keyboard input
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

    // Merge touch joystick into directional actions
    if (this._joystickOrigin && this._joystickPos) {
      const dx = this._joystickPos.x - this._joystickOrigin.x;
      const dy = this._joystickPos.y - this._joystickOrigin.y;
      if (dx < -this._joystickDeadzone) this.actions.left = true;
      if (dx > this._joystickDeadzone) this.actions.right = true;
      if (dy < -this._joystickDeadzone) { this.actions.up = true; this.actions.jump = true; }
      if (dy > this._joystickDeadzone) this.actions.down = true;
    }

    // Merge touch buttons
    if (this._touchButtons.jump) this.actions.jump = true;
    if (this._touchButtons.attack) this.actions.attack = true;
    if (this._touchButtons.dash) this.actions.dash = true;
    if (this._touchButtons.pause) this.actions.pause = true;

    // Touch confirm = any button press on title/game over screens
    if (this._touchButtons.jump || this._touchButtons.attack) {
      this.actions.confirm = true;
    }
  }

  /** Returns true only on the frame the key was first pressed. */
  justPressed(code) {
    if (this._justPressed[code]) {
      this._justPressed[code] = false;
      return true;
    }
    return false;
  }

  /** Check if an action was just pressed this frame (keyboard or touch). */
  actionJustPressed(action) {
    // Check touch first
    if (this._touchJustPressed[action]) {
      this._touchJustPressed[action] = false;
      return true;
    }

    // Also treat joystick-up as jump just-pressed
    if (action === 'jump' && this._touchJustPressed._joystickUp) {
      this._touchJustPressed._joystickUp = false;
      return true;
    }

    // Touch confirm
    if (action === 'confirm' && (this._touchJustPressed.jump || this._touchJustPressed.attack)) {
      this._touchJustPressed.jump = false;
      this._touchJustPressed.attack = false;
      return true;
    }

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
    // Clear touch just-pressed flags at end of frame
    for (const key in this._touchJustPressed) {
      this._touchJustPressed[key] = false;
    }
  }
}
