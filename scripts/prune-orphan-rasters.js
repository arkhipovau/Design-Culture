#!/usr/bin/env node
/**
 * Remove JPG/PNG files that already have a WebP sibling and are no longer referenced in src/.
 *
 * Usage:
 *   node scripts/prune-orphan-rasters.js --dry-run
 *   node scripts/prune-orphan-rasters.js --delete
 */
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'src/images');
const SCAN_DIRS = [
  path.join(ROOT, 'src'),
  path.join(ROOT, 'content'),
  path.join(ROOT, 'scripts'),
];

const RASTER_EXT = new Set(['.jpg', '.jpeg', '.png']);

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run') || !argv.includes('--delete'),
    delete: argv.includes('--delete'),
  };
}

async function walkFiles(dir, files = []) {
  let entries;
  try {
    entries = await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'docs') continue;
      await walkFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function loadReferenceText() {
  const files = [];
  for (const dir of SCAN_DIRS) {
    await walkFiles(dir, files);
  }
  const textFiles = files.filter((filePath) => /\.(html|js|json|md|css)$/i.test(filePath));
  const chunks = await Promise.all(textFiles.map((filePath) => fsp.readFile(filePath, 'utf8')));
  return chunks.join('\n');
}

function relativeImageRef(filePath) {
  const rel = path.relative(IMAGES_DIR, filePath).split(path.sep).join('/');
  return rel;
}

function isReferenced(relPath, haystack) {
  const fileName = path.basename(relPath);
  const normalized = relPath.replace(/\\/g, '/');
  const patterns = [
    normalized,
    'images/' + normalized,
    '/images/' + normalized,
    './images/' + normalized,
    '../images/' + normalized,
    '../../images/' + normalized,
    fileName,
  ];
  return patterns.some((pattern) => haystack.includes(pattern));
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const haystack = await loadReferenceText();
  const orphans = [];
  let totalBytes = 0;

  for (const ext of RASTER_EXT) {
    const stack = [IMAGES_DIR];
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
        if (entry.isDirectory()) {
          stack.push(fullPath);
          continue;
        }
        if (path.extname(entry.name).toLowerCase() !== ext) continue;
        const webpPath = fullPath.replace(/\.(jpe?g|png)$/i, '.webp');
        if (!fs.existsSync(webpPath)) continue;
        const rel = relativeImageRef(fullPath);
        if (isReferenced(rel, haystack)) continue;
        const size = fs.statSync(fullPath).size;
        orphans.push({ fullPath, rel, size });
        totalBytes += size;
      }
    }
  }

  orphans.sort((a, b) => b.size - a.size);
  console.log(
    opts.dryRun ? '[dry-run]' : '[delete]',
    `${orphans.length} orphan raster(s), ${(totalBytes / 1024 / 1024).toFixed(1)} MB`,
  );
  orphans.slice(0, 20).forEach((item) => {
    console.log(`  ${(item.size / 1024 / 1024).toFixed(2)} MB  ${item.rel}`);
  });
  if (orphans.length > 20) {
    console.log(`  ... and ${orphans.length - 20} more`);
  }

  if (opts.dryRun || !opts.delete) {
    if (orphans.length) {
      console.log('\nRe-run with --delete to remove unreferenced orphans.');
    }
    return;
  }

  for (const item of orphans) {
    await fsp.unlink(item.fullPath);
  }
  console.log(`Deleted ${orphans.length} file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
