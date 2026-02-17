/**
 * SacredGeometry — Flower of Life, Metatron's Cube, Sri Yantra,
 * per-chakra lotus patterns. Used in boss arenas, world transitions,
 * and power activations.
 */

export function flowerOfLife(ctx, cx, cy, radius, color, alpha = 0.3, rotation = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  // Central circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // 6 surrounding circles
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Outer ring of 6
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + Math.PI / 6;
    const x = Math.cos(angle) * radius * 1.73;
    const y = Math.sin(angle) * radius * 1.73;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function metatronsCube(ctx, cx, cy, radius, color, alpha = 0.2, rotation = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  // 13 circles + connecting lines
  const points = [[0, 0]];

  // Inner hexagon points
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 2;
    points.push([Math.cos(a) * radius * 0.5, Math.sin(a) * radius * 0.5]);
  }

  // Outer hexagon points
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 2;
    points.push([Math.cos(a) * radius, Math.sin(a) * radius]);
  }

  // Draw circles at each point
  for (const [x, y] of points) {
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.15, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Connect all outer points to each other
  for (let i = 7; i < 13; i++) {
    for (let j = i + 1; j < 13; j++) {
      ctx.beginPath();
      ctx.moveTo(points[i][0], points[i][1]);
      ctx.lineTo(points[j][0], points[j][1]);
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function sriYantra(ctx, cx, cy, radius, color, alpha = 0.25, rotation = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  // Concentric triangles (simplified Sri Yantra)
  for (let i = 0; i < 4; i++) {
    const r = radius * (1 - i * 0.2);

    // Upward triangle
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(-r * 0.87, r * 0.5);
    ctx.lineTo(r * 0.87, r * 0.5);
    ctx.closePath();
    ctx.stroke();

    // Downward triangle (inverted)
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.lineTo(-r * 0.87, -r * 0.5);
    ctx.lineTo(r * 0.87, -r * 0.5);
    ctx.closePath();
    ctx.stroke();
  }

  // Central bindu
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Outer circle
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.1, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

export function chakraLotus(ctx, cx, cy, radius, petals, color, alpha = 0.3, rotation = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  for (let i = 0; i < petals; i++) {
    const angle = (i * Math.PI * 2) / petals;
    ctx.save();
    ctx.rotate(angle);

    // Petal shape
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.6, radius * 0.15, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // Central circle
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// Petal counts per chakra
export const CHAKRA_PETALS = [4, 6, 10, 12, 16, 2, 1000];
