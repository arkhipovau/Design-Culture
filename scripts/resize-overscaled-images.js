#!/usr/bin/env node
/**
 * Downscale overscaled WebP assets in place (quality-safe: q100, no extra compression).
 *
 * Usage:
 *   node scripts/resize-overscaled-images.js --dry-run
 *   node scripts/resize-overscaled-images.js
 *   node scripts/resize-overscaled-images.js --only about
 */
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');

const TARGETS = [
  {
    id: 'about',
    dir: path.join(ROOT, 'src/images/about'),
    maxWidth: 880,
    match: (name) => /\.webp$/i.test(name),
  },
  {
    id: 'maxim',
    dir: path.join(ROOT, 'src/images/interviews/maxim-aksenov'),
    maxWidth: 2216,
    match: (name) => /^L2025.*\.webp$/i.test(name),
  },
];

function parseArgs(argv) {
  const opts = { dryRun: false, only: '' };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--only') opts.only = argv[++i] || '';
  }
  return opts;
}

async function resizeFile(filePath, maxWidth, dryRun) {
  const meta = await sharp(filePath).metadata();
  if (!meta.width || meta.width <= maxWidth) {
    return { changed: false, before: meta.width || 0, after: meta.width || 0, bytesBefore: 0, bytesAfter: 0 };
  }

  const bytesBefore = fs.statSync(filePath).size;
  if (dryRun) {
    const ratio = maxWidth / meta.width;
    const estAfter = Math.round(bytesBefore * ratio * ratio);
    return {
      changed: true,
      before: meta.width,
      after: maxWidth,
      bytesBefore,
      bytesAfter: estAfter,
    };
  }

  const buffer = await sharp(filePath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 100 })
    .toBuffer();
  await fsp.writeFile(filePath, buffer);
  return {
    changed: true,
    before: meta.width,
    after: maxWidth,
    bytesBefore,
    bytesAfter: buffer.length,
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  let changedCount = 0;
  let savedBytes = 0;

  for (const target of TARGETS) {
    if (opts.only && target.id !== opts.only) continue;
    const names = await fsp.readdir(target.dir);
    for (const name of names.sort()) {
      if (!target.match(name)) continue;
      const filePath = path.join(target.dir, name);
      const result = await resizeFile(filePath, target.maxWidth, opts.dryRun);
      if (!result.changed) continue;
      changedCount += 1;
      savedBytes += result.bytesBefore - result.bytesAfter;
      const rel = path.relative(ROOT, filePath);
      console.log(
        `${opts.dryRun ? '[dry-run]' : '[resize]'} ${rel}: ${result.before}px → ${result.after}px, ` +
          `${(result.bytesBefore / 1024 / 1024).toFixed(2)} MB → ${(result.bytesAfter / 1024 / 1024).toFixed(2)} MB`,
      );
    }
  }

  console.log(
    `${opts.dryRun ? 'Would resize' : 'Resized'} ${changedCount} file(s), save ~${(savedBytes / 1024 / 1024).toFixed(1)} MB`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
