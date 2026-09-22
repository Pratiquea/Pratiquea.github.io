// Decides how each lineage logo is shown in dark mode, at build time.
//
// Logos are shown without a box, so a black logo would vanish on the black
// dark-mode page. For each logo:
//   1. If src/assets/logos/<name>.dark.<ext> exists, that file is used in dark mode.
//   2. Otherwise, a logo that is mostly black, or sits on a solid white
//      background, is colour-inverted in dark mode (black ↔ white, hues kept).
//   3. Anything else (colourful seals, emblems) is shown as-is.
import path from 'node:path';
import sharp from 'sharp';
import type { ImageMetadata } from 'astro';
import { asset, hasAsset } from './images';

export interface Logo {
  light: ImageMetadata;
  dark?: ImageMetadata;
  invertInDark: boolean;
  /** Visible (non-transparent) area as fractions of the image: x, y, width, height. */
  visible: { x: number; y: number; w: number; h: number };
  /** Aspect ratio (width / height) of the visible area. */
  aspect: number;
}

const LOGO_DIR = path.join(process.cwd(), 'src/assets/logos');

// Transparent padding around the drawing, so logos can be sized by what you
// actually see rather than by their canvas.
async function visibleArea(file: string, width: number, height: number) {
  try {
    const { info } = await sharp(path.join(LOGO_DIR, file)).trim({ threshold: 10 }).toBuffer({ resolveWithObject: true });
    const left = -(info.trimOffsetLeft ?? 0);
    const top = -(info.trimOffsetTop ?? 0);
    return { x: left / width, y: top / height, w: info.width / width, h: info.height / height };
  } catch {
    return { x: 0, y: 0, w: 1, h: 1 }; // nothing to trim
  }
}

async function analyse(file: string) {
  const { data, info } = await sharp(path.join(LOGO_DIR, file))
    .ensureAlpha()
    .resize(128, 128, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let opaque = 0;
  let dark = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] < 200) continue;
    opaque++;
    if ((data[i] + data[i + 1] + data[i + 2]) / 3 < 60) dark++;
  }
  const corner = (x: number, y: number) => {
    const i = (y * info.width + x) * info.channels;
    return data[i + 3] > 200 && data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235;
  };
  const whiteBackground = [corner(0, 0), corner(info.width - 1, 0), corner(0, info.height - 1), corner(info.width - 1, info.height - 1)].every(Boolean);

  return { mostlyDark: opaque > 0 && dark / opaque > 0.6, whiteBackground };
}

export async function getLogo(file: string): Promise<Logo> {
  const light = asset('logos', file)!;
  const visible = await visibleArea(file, light.width, light.height);
  const aspect = (visible.w * light.width) / (visible.h * light.height);
  const darkFile = file.replace(/(\.[^.]+)$/, '.dark$1');
  if (hasAsset('logos', darkFile)) {
    return { light, dark: asset('logos', darkFile), invertInDark: false, visible, aspect };
  }
  const { mostlyDark, whiteBackground } = await analyse(file);
  return { light, invertInDark: mostlyDark || whiteBackground, visible, aspect };
}
