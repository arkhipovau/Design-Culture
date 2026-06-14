#!/usr/bin/env node
/**
 * bump-cache.js
 *
 * Updates the `?v=...` cache-buster on every <link> and <script> reference
 * inside src/**.html and docs/**.html to a single shared version string.
 *
 * Usage:
 *   node scripts/bump-cache.js              # auto-generate: YYYYMMDD + 2 random hex chars
 *   node scripts/bump-cache.js 20260614a    # use explicit version
 *
 * Why: we have CSS bundles that @import nested files. If you edit a nested file,
 * the bundle filename does not change, so the browser keeps the old cached copy.
 * One shared `?v=` across every HTML reference avoids any "did I bump it?" guessing.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ROOTS = ['src', 'docs'];

function generateVersion() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const suffix = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  return `${ymd}${suffix}`;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

function bump(file, version) {
  const before = fs.readFileSync(file, 'utf8');
  // Replace any ?v=<alnum> in href/src attributes with the new version.
  // Only touch attributes — leaves arbitrary `?v=` in markup or scripts untouched.
  const re = /(\b(?:href|src)\s*=\s*"[^"]*\?v=)([A-Za-z0-9._-]+)/g;
  const after = before.replace(re, (_, prefix) => `${prefix}${version}`);
  if (before === after) return false;
  fs.writeFileSync(file, after);
  return true;
}

function main() {
  const explicit = process.argv[2];
  const version = explicit && /^[A-Za-z0-9._-]+$/.test(explicit) ? explicit : generateVersion();

  console.log(`Cache-buster → ?v=${version}`);
  console.log();

  let touched = 0;
  let scanned = 0;
  for (const r of ROOTS) {
    const files = walk(path.join(ROOT, r));
    for (const f of files) {
      scanned++;
      if (bump(f, version)) {
        touched++;
        console.log(`  ${path.relative(ROOT, f)}`);
      }
    }
  }

  console.log();
  console.log(`Updated ${touched} of ${scanned} HTML files.`);
}

main();
