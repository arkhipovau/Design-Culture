#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EN_DASH = '\u2013';
const TARGET_DIRS = [
  path.join(ROOT, 'src'),
  path.join(ROOT, 'content'),
];

const SKIP_DIR_NAMES = new Set(['node_modules', '.git']);
const SKIP_FILE_RE = /\.fuse_hidden/;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
      continue;
    }
    if (!/\.(html|md|json)$/i.test(entry.name)) continue;
    if (SKIP_FILE_RE.test(entry.name)) continue;
    files.push(full);
  }
  return files;
}

function normalizeDashes(content) {
  const protectedChunks = [];

  const protect = (value) => {
    const token = `\u0000P${protectedChunks.length}\u0000`;
    protectedChunks.push(value);
    return token;
  };

  content = content.replace(
    /\s(?:href|src|content|action|poster|data-[a-z0-9_-]+)=["'][^"']*["']/gi,
    protect,
  );
  content = content.replace(/url\([^)]*\)/gi, protect);

  content = content.replace(/&mdash;|&#8212;/g, EN_DASH);
  content = content.replace(/\u2014/g, EN_DASH);
  content = content.replace(/(\d{4})-(\d{2,4})/g, `$1${EN_DASH}$2`);
  content = content.replace(/ - /g, ` ${EN_DASH} `);

  content = content.replace(/\u0000P(\d+)\u0000/g, (_, index) => protectedChunks[Number(index)]);

  return content;
}

let changed = 0;

for (const dir of TARGET_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const original = fs.readFileSync(file, 'utf8');
    const next = normalizeDashes(original);
    if (next !== original) {
      fs.writeFileSync(file, next);
      changed += 1;
      console.log(`[normalize-dashes] ${path.relative(ROOT, file)}`);
    }
  }
}

console.log(`[normalize-dashes] Updated ${changed} file(s).`);
