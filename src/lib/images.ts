// Resolves image filenames used in src/data/* to optimized Astro images.
// Files live in src/assets/<folder>/ so Astro can resize and convert them.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{png,jpg,jpeg,webp,avif,gif,svg}',
  { eager: true },
);

export type AssetFolder = 'projects' | 'papers' | 'logos' | 'profile' | 'hero';

export function hasAsset(folder: AssetFolder, file: string): boolean {
  return `/src/assets/${folder}/${file}` in files;
}

export function asset(folder: AssetFolder, file: string | undefined): ImageMetadata | undefined {
  if (!file) return undefined;
  const key = `/src/assets/${folder}/${file}`;
  const found = files[key];
  if (!found) {
    throw new Error(`Image not found: ${key} — check the filename in your data file.`);
  }
  return found.default;
}
