// Maps a value in [0, maxValue] to an [r, g, b] triple in 0-1, suitable for
// THREE.Color.setRGB(). Close-to-start / close-to-solution nodes read warm,
// far ones read cool — order carries meaning here, so the ramp is monotonic
// rather than a hue wheel (the original's hue wheel made distance unreadable
// past ~360 units since it wrapped back through the same colors).
export function colorForValue(value, maxValue) {
  const t = maxValue > 0 ? clamp01(value / maxValue) : 0;
  return coolToWarm(t);
}

function clamp01(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

// Cool (blue, far) -> warm (amber, near) ramp, via HSL.
function coolToWarm(t) {
  const hue = lerp(0.58, 0.08, t); // 0.58 = blue, 0.08 = amber
  const sat = 0.65;
  const light = lerp(0.35, 0.6, t);

  //   const hue = lerp(0.1, 0.9, t);
  //   const sat = lerp(0.1, 0.9, t);
  //   const light = lerp(0.1, 0.9, t);

  return hslToRgb(hue, sat, light);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hslToRgb(h, s, l) {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
