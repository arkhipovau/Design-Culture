#!/usr/bin/env node
/**
 * Re-encode interview MP4s with visually lossless H.264 settings.
 *
 * Usage:
 *   node scripts/reencode-interview-video.js --dry-run
 *   node scripts/reencode-interview-video.js --slug dariia-chertanova
 *
 * Requires ffmpeg in PATH.
 */
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const INTERVIEWS_DIR = path.join(ROOT, 'src/images/interviews');

function parseArgs(argv) {
  const opts = { dryRun: false, slug: '' };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--slug') opts.slug = argv[++i] || '';
  }
  return opts;
}

function hasFfmpeg() {
  const result = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  return result.status === 0;
}

async function collectMp4s(slug) {
  const files = [];
  const stack = slug ? [path.join(INTERVIEWS_DIR, slug)] : [INTERVIEWS_DIR];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (/\.mp4$/i.test(entry.name)) files.push(fullPath);
    }
  }
  return files.sort();
}

function reencode(filePath, dryRun) {
  const bytesBefore = fs.statSync(filePath).size;
  const tmpPath = filePath + '.reencode.tmp.mp4';
  if (dryRun) {
    return { changed: true, bytesBefore, bytesAfter: Math.round(bytesBefore * 0.45) };
  }

  const args = [
    '-y',
    '-i',
    filePath,
    '-c:v',
    'libx264',
    '-crf',
    '18',
    '-preset',
    'slow',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    tmpPath,
  ];
  const result = spawnSync('ffmpeg', args, { stdio: 'pipe' });

  if (result.status !== 0 || !fs.existsSync(tmpPath)) {
    throw new Error(`ffmpeg failed for ${filePath}`);
  }

  const bytesAfter = fs.statSync(tmpPath).size;
  if (bytesAfter >= bytesBefore) {
    fs.unlinkSync(tmpPath);
    return { changed: false, bytesBefore, bytesAfter: bytesBefore };
  }

  fs.renameSync(tmpPath, filePath);
  return { changed: true, bytesBefore, bytesAfter };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.dryRun && !hasFfmpeg()) {
    console.error('ffmpeg not found in PATH');
    process.exit(1);
  }

  const files = await collectMp4s(opts.slug);
  let changed = 0;
  let saved = 0;

  for (const filePath of files) {
    const result = reencode(filePath, opts.dryRun);
    if (!result.changed) continue;
    changed += 1;
    saved += result.bytesBefore - result.bytesAfter;
    const rel = path.relative(ROOT, filePath);
    console.log(
      `${opts.dryRun ? '[dry-run]' : '[reencode]'} ${rel}: ` +
        `${(result.bytesBefore / 1024 / 1024).toFixed(1)} MB → ${(result.bytesAfter / 1024 / 1024).toFixed(1)} MB`,
    );
  }

  console.log(
    `${opts.dryRun ? 'Would re-encode' : 'Re-encoded'} ${changed} file(s), save ~${(saved / 1024 / 1024).toFixed(1)} MB`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
