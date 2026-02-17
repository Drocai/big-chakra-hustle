/**
 * Effects — Canvas post-processing: multi-pass bloom, chromatic aberration,
 * vignette, CRT scanlines. "Trap Fantasy" visual mandate.
 */

export class Effects {
  constructor() {
    this.crtEnabled = true;
    this.vignetteEnabled = true;
    this.bloomEnabled = true;
    this.chromaticEnabled = true;
    this._scanlineOffset = 0;
  }

  /** Apply all enabled effects as a post-process pass. */
  apply(ctx, width, height, frameCount) {
    if (this.bloomEnabled) {
      this._bloom(ctx, width, height);
    }
    if (this.chromaticEnabled) {
      this._chromaticAberration(ctx, width, height, frameCount);
    }
    if (this.vignetteEnabled) {
      this._vignette(ctx, width, height);
    }
    if (this.crtEnabled) {
      this._crtScanlines(ctx, width, height, frameCount);
    }
  }

  _bloom(ctx, width, height) {
    // Multi-pass bloom: draw the scene back on itself with screen blending
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.12;
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.globalAlpha = 0.06;
    ctx.drawImage(ctx.canvas, -2, -2, width + 4, height + 4);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  _chromaticAberration(ctx, width, height, frameCount) {
    // RGB split — red channel shifted left, cyan shifted right
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.035;

    // Red channel offset left
    ctx.drawImage(ctx.canvas, -2, 0);
    // Blue channel offset right
    ctx.drawImage(ctx.canvas, 2, 0);

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  _vignette(ctx, width, height) {
    const grad = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.25,
      width / 2, height / 2, width * 0.75
    );
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  _crtScanlines(ctx, width, height, frameCount) {
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#000';

    this._scanlineOffset = (this._scanlineOffset + 0.3) % 4;

    for (let y = this._scanlineOffset; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
