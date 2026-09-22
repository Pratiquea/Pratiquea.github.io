#!/usr/bin/env node
// Make a dark-mode version of a logo. Saved next to the original as
// <name>.dark.png, which the site then uses automatically in dark mode.
//
// Default ("text") mode: only dark *lettering* turns light (#f2f1f2, the dark
// theme's text colour). Each connected patch of dark pixels is recoloured only
// if it is surrounded mostly by transparency (how text sits in a logo); dark
// areas that touch coloured parts — a navy crest, the black squares of a flag —
// keep their colour. Use this for university logos.
//
// "all" mode: every dark pixel turns light (for plain black logos).
//
// Usage: node scripts/make-dark-logo.mjs <logo.png> [--mode text|all] [--threshold 80]
import sharp from 'sharp';
import path from 'node:path';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--') && !/^\d+$/.test(a));
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
if (!input) {
  console.error('usage: node scripts/make-dark-logo.mjs <logo.png> [--mode text|all] [--threshold 80]');
  process.exit(1);
}
const mode = opt('mode', 'text');
const threshold = Number(opt('threshold', 80));
const { dir, name } = path.parse(input);
const output = path.join(dir, `${name}.dark.png`);

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const N = W * H;
const lum = (p) => 0.2126 * data[p * 4] + 0.7152 * data[p * 4 + 1] + 0.0722 * data[p * 4 + 2];
const alpha = (p) => data[p * 4 + 3];

// Dark pixels (including anti-aliased edges, which are dark with partial alpha).
const dark = new Uint8Array(N);
for (let p = 0; p < N; p++) dark[p] = alpha(p) >= 10 && lum(p) < threshold ? 1 : 0;

// Flood fill from the image border over `passable` pixels (4-connected).
function reachFromBorder(passable) {
  const reach = new Uint8Array(N);
  const queue = new Int32Array(N);
  let head = 0;
  let tail = 0;
  const seed = (p) => {
    if (passable(p) && !reach[p]) {
      reach[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < W; x++) {
    seed(x);
    seed((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    seed(y * W);
    seed(y * W + W - 1);
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % W;
    if (x > 0) seed(p - 1);
    if (x < W - 1) seed(p + 1);
    if (p >= W) seed(p - W);
    if (p < N - W) seed(p + W);
  }
  return reach;
}

const recolor = new Uint8Array(N);
let filled = 0;
if (mode === 'all') {
  recolor.set(dark);
} else {
  // 1. Label 8-connected dark components; a component is text-like when it is
  //    small and sits (almost) only on transparency.
  const label = new Int32Array(N).fill(-1);
  const stack = new Int32Array(N);
  const neighbours = [-1, 1, -W, W, -W - 1, -W + 1, W - 1, W + 1];
  const candidate = new Uint8Array(N);
  const components = [];
  for (let start = 0; start < N; start++) {
    if (!dark[start] || label[start] !== -1) continue;
    const members = [];
    let top = 0;
    stack[top++] = start;
    label[start] = start;
    let coloured = 0;
    let border = 0;
    let minX = W, maxX = 0, minY = H, maxY = 0;
    while (top) {
      const p = stack[--top];
      members.push(p);
      const x = p % W;
      const y = (p - x) / W;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      for (const d of neighbours) {
        const q = p + d;
        if (q < 0 || q >= N || Math.abs((q % W) - x) > 1) continue;
        if (dark[q]) {
          if (label[q] === -1) {
            label[q] = start;
            stack[top++] = q;
          }
        } else {
          border++;
          if (alpha(q) >= 128) coloured++; // an opaque, non-dark neighbour
        }
      }
    }
    // Anything spanning over a third of the logo is a graphic (a crest, a block).
    const big = maxX - minX + 1 > W * 0.35 || maxY - minY + 1 > H * 0.35;
    const textLike = !big && (border === 0 || coloured / border < 0.15);
    if (textLike) for (const p of members) candidate[p] = 1;
    components.push({ members, textLike });
  }

  // 2. Text must be reachable from outside the logo through open space;
  //    shapes nested inside a kept graphic (the fill of a crest's letter) stay.
  const outside = reachFromBorder((p) => candidate[p] || (!dark[p] && alpha(p) < 250));
  for (const c of components) {
    if (c.textLike && c.members.some((p) => outside[p])) for (const p of c.members) recolor[p] = 1;
  }

  // 3. Transparent gaps enclosed by a kept graphic (e.g. an outline cut into a
  //    crest) would show the black page; fill them white to keep the logo's
  //    light-mode look. Counters inside recoloured letters stay transparent.
  const open = reachFromBorder((p) => recolor[p] || (!dark[p] && alpha(p) < 250));
  for (let p = 0; p < N; p++) {
    if (open[p] || dark[p] || alpha(p) >= 250) continue;
    const a = alpha(p) / 255;
    for (let c = 0; c < 3; c++) data[p * 4 + c] = Math.round(data[p * 4 + c] * a + 255 * (1 - a));
    data[p * 4 + 3] = 255;
    filled++;
  }
}

let changed = 0;
for (let p = 0; p < N; p++) {
  if (!recolor[p]) continue;
  data[p * 4] = 0xf2;
  data[p * 4 + 1] = 0xf1;
  data[p * 4 + 2] = 0xf2;
  changed++;
}
await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toFile(output);
console.log(`Wrote ${output} (${mode} mode, ${changed} pixels recoloured, ${filled} enclosed pixels filled white)`);
