#!/usr/bin/env node
/**
 * Convert interview media to lighter web formats without aggressive compression.
 *
 * Strategy (thoughtful defaults):
 *   - PNG  → WebP lossless   (same pixels, usually smaller than PNG)
 *   - JPEG → WebP quality 100 (visually lossless; JPEG is already lossy)
 *   - GIF  → keep as-is (animated WebP can drop frames; use --gif-target webm for video)
 *
 * WebM is a VIDEO container — not for still photos. Still images go to WebP.
 *
 * Usage:
 *   npm install
 *   node scripts/convert-interview-media.js --dry-run
 *   node scripts/convert-interview-media.js --slug maxim-aksenov
 *   node scripts/convert-interview-media.js --rewrite --delete-source
 *   node scripts/convert-interview-media.js --gif-target webm --rewrite --slug polina-zagumenova
 *
 * Requires: sharp (npm). For GIF→WebM: ffmpeg in PATH.
 */
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_DIRS = [
  path.join(ROOT, 'src/images/interviews'),
  path.join(ROOT, 'src/images'),
];
const REWRITE_GLOBS = [
  path.join(ROOT, 'src/pages'),
  path.join(ROOT, 'src/index.html'),
  path.join(ROOT, 'src/404.html'),
  path.join(ROOT, 'src/udf'),
  path.join(ROOT, 'content/interviews-meta.json'),
  path.join(ROOT, 'scripts'),
];

const SRC_PREFIXES = [
  '../../images/',
  '../images/',
  '../../../images/',
  './images/',
];

const RASTER_EXT = new Set(['.png', '.jpg', '.jpeg']);
const GIF_EXT = new Set(['.gif']);

function parseArgs(argv) {
  const opts = {
    dryRun: false,
    rewrite: false,
    deleteSource: false,
    force: false,
    toWebp: false,
    rewriteOnly: false,
    onlyReferenced: false,
    slug: '',
    dirs: [...DEFAULT_DIRS],
    jpegQuality: 100,
    gifTarget: 'webp',
    includeFlatImages: true,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--rewrite') opts.rewrite = true;
    else if (arg === '--delete-source') opts.deleteSource = true;
    else if (arg === '--force') opts.force = true;
    else if (arg === '--to-webp') opts.toWebp = true;
    else if (arg === '--rewrite-only') opts.rewriteOnly = true;
    else if (arg === '--only-referenced') opts.onlyReferenced = true;
    else if (arg === '--interviews-only') opts.includeFlatImages = false;
    else if (arg === '--slug') opts.slug = argv[++i] || '';
    else if (arg === '--dir') opts.dirs = [path.resolve(argv[++i] || '')];
    else if (arg === '--jpeg-quality') opts.jpegQuality = Number(argv[++i] || 98);
    else if (arg === '--gif-target') opts.gifTarget = (argv[++i] || 'webp').toLowerCase();
    else if (arg === '--help' || arg === '-h') {
      console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 22).join('\n'));
      process.exit(0);
    } else {
      console.error('Unknown argument:', arg);
      process.exit(1);
    }
  }

  if (!opts.includeFlatImages) {
    opts.dirs = opts.dirs.filter((dir) => dir.includes('interviews'));
  }

  if (!['webp', 'webm'].includes(opts.gifTarget)) {
    console.error('--gif-target must be webp or webm');
    process.exit(1);
  }

  if (opts.gifTarget === 'webm' && !opts.rewrite) {
    console.error('GIF→WebM changes <img> to <video>. Pass --rewrite to update HTML.');
    process.exit(1);
  }

  if (opts.deleteSource && !opts.rewrite && !opts.rewriteOnly) {
    console.error('--delete-source requires --rewrite (or run --rewrite-only first).');
    process.exit(1);
  }

  return opts;
}

function hasFfmpeg() {
  const result = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
  return result.status === 0;
}

async function loadSharp() {
  try {
    return require('sharp');
  } catch (_) {
    console.error('Missing dependency: sharp. Run: npm install');
    process.exit(1);
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function walkFiles(dir, slugFilter) {
  const out = [];
  if (!fs.existsSync(dir)) return out;

  function walk(current) {
    for (const name of fs.readdirSync(current)) {
      if (name === '.DS_Store' || name === '.gitkeep') continue;
      const full = path.join(current, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (slugFilter && dir.endsWith('interviews') && current === dir && name !== slugFilter) continue;
        walk(full);
        continue;
      }
      const ext = path.extname(name).toLowerCase();
      if (RASTER_EXT.has(ext) || GIF_EXT.has(ext)) out.push(full);
    }
  }

  walk(dir);
  return out;
}

function collectReferencedPaths() {
  const refs = new Set();
  const patterns = [
    path.join(ROOT, 'src/pages/interviews'),
    path.join(ROOT, 'src/pages/gallery-data.js'),
    path.join(ROOT, 'content/interviews-meta.json'),
  ];

  const mediaRe = /(?:\.\.\/)+images\/[^"'\s<>]+?\.(?:png|jpe?g|gif)/gi;

  for (const target of patterns) {
    if (!fs.existsSync(target)) continue;
    if (fs.statSync(target).isDirectory()) {
      for (const file of fs.readdirSync(target)) {
        if (!file.endsWith('.html')) continue;
        const text = fs.readFileSync(path.join(target, file), 'utf8');
        for (const match of text.match(mediaRe) || []) {
          const rel = match.replace(/^(\.\.\/)+images\//, '');
          for (const key of refLookupKeys(rel)) refs.add(key);
        }
      }
    } else {
      const text = fs.readFileSync(target, 'utf8');
      for (const match of text.match(mediaRe) || []) {
        const rel = match.replace(/^(\.\.\/)+images\//, '');
        for (const key of refLookupKeys(rel)) refs.add(key);
      }
    }
  }

  return refs;
}

function normalizeRelPath(rel) {
  try {
    return decodeURIComponent(rel).normalize('NFC');
  } catch (_) {
    return rel.normalize('NFC');
  }
}

function strictEncodePathPart(part) {
  // encodeURIComponent leaves !'()* unescaped; HTML src often uses %21 etc.
  return encodeURIComponent(part).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`,
  );
}

function pathVariants(relPath) {
  const bases = [...new Set([relPath, relPath.normalize('NFC'), relPath.normalize('NFD')])];
  const variants = new Set();

  for (const base of bases) {
    const parts = base.split('/');
    variants.add(base);
    variants.add(parts.map(encodeURIComponent).join('/'));
    variants.add(parts.map(strictEncodePathPart).join('/'));
    variants.add(parts.map((part) => encodeURI(part)).join('/'));
  }

  return [...variants];
}

function refLookupKeys(rel) {
  const keys = new Set();
  for (const variant of pathVariants(rel)) {
    keys.add(variant);
    keys.add(normalizeRelPath(variant));
  }
  return keys;
}

function relFromImages(absPath) {
  const imagesRoot = path.join(ROOT, 'src/images');
  return path.relative(imagesRoot, absPath).split(path.sep).join('/');
}

function isReferenced(absPath, referenced) {
  const rel = relFromImages(absPath);
  for (const key of refLookupKeys(rel)) {
    if (referenced.has(key)) return true;
  }
  return false;
}

async function convertRaster(sharp, inputPath, jpegQuality) {
  const ext = path.extname(inputPath).toLowerCase();
  const outputPath = inputPath.replace(/\.(png|jpe?g)$/i, '.webp');
  const image = sharp(inputPath, { animated: false, limitInputPixels: false });
  const meta = await image.metadata();

  if (ext === '.png') {
    await image.webp({ lossless: true, effort: 6 }).toFile(outputPath);
  } else {
    await image.webp({
      quality: jpegQuality,
      effort: 6,
      smartSubsample: false,
    }).toFile(outputPath);
  }

  return { outputPath, meta };
}

async function verifyDimensions(sharp, inputPath, outputPath) {
  const [inMeta, outMeta] = await Promise.all([
    sharp(inputPath).metadata(),
    sharp(outputPath).metadata(),
  ]);
  if (inMeta.width !== outMeta.width || inMeta.height !== outMeta.height) {
    throw new Error(`dimension mismatch ${inMeta.width}x${inMeta.height} → ${outMeta.width}x${outMeta.height}`);
  }
  if (inMeta.pages && outMeta.pages && inMeta.pages !== outMeta.pages) {
    console.warn(`warn: frame count changed ${inputPath} ${inMeta.pages} → ${outMeta.pages}`);
  }
}

async function convertGifWebp(sharp, inputPath, lossless) {
  const outputPath = inputPath.replace(/\.gif$/i, '.webp');
  const options = lossless
    ? { lossless: true, effort: 6 }
    : { quality: 100, effort: 6 };
  await sharp(inputPath, { animated: true, limitInputPixels: false }).webp(options).toFile(outputPath);
  return outputPath;
}

function convertGifWebm(inputPath) {
  const outputPath = inputPath.replace(/\.gif$/i, '.webm');
  const result = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-i', inputPath,
      '-an',
      '-c:v', 'libvpx-vp9',
      '-pix_fmt', 'yuv420p',
      '-crf', '30',
      '-b:v', '0',
      '-auto-alt-ref', '0',
      outputPath,
    ],
    { encoding: 'utf8' },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || 'ffmpeg failed');
  }
  return outputPath;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceRasterExtInUrl(url, toExt) {
  return url.replace(/\.(png|jpe?g|gif)(\?[^"'")\s]*)?$/i, `.${toExt}$2`);
}

async function rewriteTextFile(filePath, replacements) {
  let text = await fsp.readFile(filePath, 'utf8');
  let changed = false;

  for (const rep of replacements) {
    for (const prefix of SRC_PREFIXES) {
      for (const variant of pathVariants(rep.fromRel)) {
        for (const fromExt of ['png', 'jpg', 'jpeg', 'gif']) {
          const stem = `${prefix}${variant}`.replace(/\.(png|jpe?g|gif)$/i, '');
          const re = new RegExp(`${escapeRegExp(stem)}\\.${fromExt}(\\?[^"'\\s<>)]*)?`, 'gi');
          const next = text.replace(re, (_match, query = '') => `${stem}.${rep.toExt}${query}`);
          if (next !== text) {
            text = next;
            changed = true;
          }
        }
      }
    }

    if (rep.imgToVideo) {
      for (const prefix of SRC_PREFIXES) {
        for (const variant of pathVariants(rep.fromRel)) {
          const from = `${prefix}${variant}`;
          const imgRe = new RegExp(`<img([^>]*?)src="${escapeRegExp(from)}"([^>]*?)>`, 'g');
          const videoTag = `<video src="${prefix}${pathVariants(rep.toRel)[0]}" controls playsinline muted loop preload="metadata"></video>`;
          const next = text.replace(imgRe, videoTag);
          if (next !== text) {
            text = next;
            changed = true;
          }
        }
      }
    }
  }

  if (changed) await fsp.writeFile(filePath, text);
  return changed;
}

function collectRewriteFiles(dir, files) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      collectRewriteFiles(full, files);
      continue;
    }
    if (name.endsWith('.html') || name.endsWith('.js') || name.endsWith('.json') || name.endsWith('.css')) {
      files.push(full);
    }
  }
}

async function rewriteReferences(replacements) {
  const files = [];
  for (const target of REWRITE_GLOBS) {
    if (!fs.existsSync(target)) continue;
    if (fs.statSync(target).isDirectory()) {
      collectRewriteFiles(target, files);
    } else files.push(target);
  }

  let count = 0;
  for (const file of files) {
    if (await rewriteTextFile(file, replacements)) count += 1;
  }
  return count;
}

function buildRewriteOnlyReplacements(jobs) {
  const replacements = [];
  for (const inputPath of jobs) {
    const webp = inputPath.replace(/\.(png|jpe?g|gif)$/i, '.webp');
    if (!fs.existsSync(webp)) continue;
    const srcSize = fs.statSync(inputPath).size;
    const webpSize = fs.statSync(webp).size;
    if (webpSize >= srcSize) continue;
    const rel = relFromImages(inputPath);
    replacements.push({
      fromRel: rel,
      toRel: rel.replace(/\.[^.]+$/, '.webp'),
      toExt: 'webp',
      imgToVideo: false,
    });
  }
  return replacements;
}

async function main() {
  const opts = parseArgs(process.argv);
  const sharp = await loadSharp();
  const ffmpegOk = hasFfmpeg();

  if (opts.gifTarget === 'webm' && !ffmpegOk) {
    console.error('ffmpeg not found. Install ffmpeg or use --gif-target webp');
    process.exit(1);
  }

  const referenced = opts.onlyReferenced ? collectReferencedPaths() : null;
  const inputs = [];

  for (const dir of opts.dirs) {
    inputs.push(...walkFiles(dir, opts.slug || ''));
  }

  const unique = [...new Set(inputs)].sort();
  const jobs = unique.filter((file) => {
    if (referenced && !isReferenced(file, referenced)) return false;
    const ext = path.extname(file).toLowerCase();
    if (GIF_EXT.has(ext)) return opts.gifTarget === 'webm';
    if (RASTER_EXT.has(ext)) {
      const webp = file.replace(/\.(png|jpe?g)$/i, '.webp');
      if (!opts.toWebp && !opts.rewriteOnly && fs.existsSync(webp) && fs.statSync(webp).mtimeMs >= fs.statSync(file).mtimeMs) {
        return false;
      }
      return true;
    }
    return false;
  });

  if (opts.rewriteOnly) {
    const replacements = buildRewriteOnlyReplacements(jobs);
    if (!replacements.length) {
      console.log('Nothing to rewrite.');
      return;
    }
    const changed = await rewriteReferences(replacements);
    console.log(`Rewrote references in ${changed} file(s) for ${replacements.length} asset(s).`);
    console.log('Run: node scripts/sync-docs.js');
    return;
  }

  if (!jobs.length) {
    console.log('Nothing to convert.');
    return;
  }

  console.log(`Found ${jobs.length} file(s). dryRun=${opts.dryRun} gifTarget=${opts.gifTarget}`);
  const replacements = [];
  let saved = 0;

  for (const inputPath of jobs) {
    const ext = path.extname(inputPath).toLowerCase();
    const before = fs.statSync(inputPath).size;
    const rel = relFromImages(inputPath);

    try {
      let outputPath;
      let imgToVideo = false;
      let after;

      if (GIF_EXT.has(ext)) {
        if (opts.gifTarget === 'webm') {
          if (opts.dryRun) {
            outputPath = inputPath.replace(/\.gif$/i, '.webm');
            after = before;
          } else {
            outputPath = convertGifWebm(inputPath);
            imgToVideo = true;
            after = fs.statSync(outputPath).size;
          }
        } else if (opts.dryRun) {
          outputPath = inputPath.replace(/\.gif$/i, '.webp');
          const buffer = await sharp(inputPath, { animated: true }).webp({ lossless: true, effort: 6 }).toBuffer();
          after = buffer.length;
        } else {
          outputPath = await convertGifWebp(sharp, inputPath, true);
          after = fs.statSync(outputPath).size;
          await verifyDimensions(sharp, inputPath, outputPath);
        }
      } else if (opts.dryRun) {
        outputPath = inputPath.replace(/\.(png|jpe?g)$/i, '.webp');
        const image = sharp(inputPath);
        const buffer =
          ext === '.png'
            ? await image.webp({ lossless: true, effort: 6 }).toBuffer()
            : await image.webp({
                quality: opts.jpegQuality,
                effort: 6,
                smartSubsample: false,
              }).toBuffer();
        after = buffer.length;
      } else {
        const result = await convertRaster(sharp, inputPath, opts.jpegQuality);
        outputPath = result.outputPath;
        after = fs.statSync(outputPath).size;
        await verifyDimensions(sharp, inputPath, outputPath);
      }

      const delta = before - after;
      saved += Math.max(0, delta);

      if (!opts.force && !opts.toWebp && after >= before) {
        console.log(
          `${opts.dryRun ? '[dry-run] ' : ''}${rel}`,
          '→ skip (webp would be larger;',
          `${formatBytes(before)} vs ${formatBytes(after)})`,
        );
        if (!opts.dryRun && outputPath && fs.existsSync(outputPath) && outputPath !== inputPath) {
          await fsp.unlink(outputPath);
        }
        continue;
      }

      const toExt = path.extname(outputPath).slice(1);
      const toRel = rel.replace(/\.[^.]+$/, `.${toExt}`);

      replacements.push({
        fromRel: rel,
        toRel,
        toExt,
        imgToVideo,
      });

      console.log(
        `${opts.dryRun ? '[dry-run] ' : ''}${rel}`,
        `→ .${toExt}`,
        `${formatBytes(before)} → ${formatBytes(after)}`,
        `(${before ? Math.round((1 - after / before) * 100) : 0}% smaller)`,
      );

      if (!opts.dryRun && opts.deleteSource) {
        await fsp.unlink(inputPath);
      }
    } catch (error) {
      console.error(`FAILED ${rel}:`, error.message || error);
    }
  }

  console.log(`Estimated total saved: ${formatBytes(saved)}`);

  if (!opts.dryRun && opts.rewrite && replacements.length) {
    const changed = await rewriteReferences(replacements);
    console.log(`Rewrote references in ${changed} file(s).`);
    console.log('Run: node scripts/sync-docs.js');
  } else if (!opts.dryRun && replacements.length) {
    console.log('References not updated. Re-run with --rewrite when ready.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
