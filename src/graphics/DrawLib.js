/**
 * DrawLib — Glow primitives, neon text, energy bars, geometric shapes.
 */

export function glowCircle(ctx, x, y, radius, color, glowSize = 15) {
  ctx.shadowBlur = glowSize;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

export function glowLine(ctx, x1, y1, x2, y2, color, width = 2, glowSize = 10) {
  ctx.shadowBlur = glowSize;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

export function glowText(ctx, text, x, y, color, font = 'bold 16px monospace', glowSize = 10) {
  ctx.save();
  ctx.shadowBlur = glowSize;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.restore();
}

export function neonText(ctx, text, x, y, color1, color2, font = 'bold 24px monospace') {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = 'center';

  // Outer glow
  ctx.shadowBlur = 20;
  ctx.shadowColor = color1;
  ctx.fillStyle = color1;
  ctx.fillText(text, x, y);

  // Inner bright
  ctx.shadowBlur = 5;
  ctx.shadowColor = color2 || '#fff';
  ctx.fillStyle = color2 || '#fff';
  ctx.fillText(text, x, y);

  ctx.shadowBlur = 0;
  ctx.restore();
}

export function energyBar(ctx, x, y, w, h, pct, color, bgColor = 'rgba(255,255,255,0.1)') {
  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, w, h);

  // Fill with glow
  ctx.shadowBlur = 8;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, pct)), h);
  ctx.shadowBlur = 0;

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

export function regularPolygon(ctx, cx, cy, radius, sides, rotation = 0) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (i * Math.PI * 2) / sides - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function star(ctx, cx, cy, spikes, outerR, innerR, rotation = 0) {
  let rot = rotation - Math.PI / 2;
  const step = Math.PI / spikes;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    ctx.lineTo(cx + Math.cos(rot) * r, cy + Math.sin(rot) * r);
    rot += step;
  }
  ctx.closePath();
}
