/**
 * Effects — Canvas-based post-processing: bloom, vignette, CRT scanlines.
 */

export class Effects {
  constructor() {
    this.crtEnabled = false;
    this.vignetteEnabled = true;
    this.bloomEnabled = true;
    this._scanlineOffset = 0;
  }

  /** Apply all enabled effects as a post-process pass. */
  apply(ctx, width, height, frameCount) {
    if (this.bloomEnabled) {
      this._bloom(ctx, width, height);
    }
    if (this.vignetteEnabled) {
      this._vignette(ctx, width, height);
    }
    if (this.crtEnabled) {
      this._crtScanlines(ctx, width, height, frameCount);
    }
  }

  _bloom(ctx, width, height) {
    // Simulated bloom via additive compositing of a blurred overlay
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.08;
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  _vignette(ctx, width, height) {
    const grad = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.3,
      width / 2, height / 2, width * 0.8
    );
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  _crtScanlines(ctx, width, height, frameCount) {
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#000';

    this._scanlineOffset = (this._scanlineOffset + 0.5) % 4;

    for (let y = this._scanlineOffset; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1);
    }

    // Slight color aberration
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.02;
    ctx.drawImage(ctx.canvas, 1, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
