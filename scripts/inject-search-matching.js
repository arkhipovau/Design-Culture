#!/usr/bin/env node
/**
 * Insert search-matching.js before menu-overlay.js in site HTML shells.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const TARGET = 'udf/superorganisms/menu/menu-overlay.js';
const INSERT = 'udf/superorganisms/menu/search-matching.js';

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
}

function patchFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  if (!source.includes(TARGET) || source.includes(INSERT)) return false;

  const re = new RegExp(
    '(<script defer src="([^"]*/' + TARGET.replace(/\//g, '\\/') + ')"></script>)'
  );
  const match = source.match(re);
  if (!match) return false;

  const overlayTag = match[1];
  const overlaySrc = match[2];
  const matchingSrc = overlaySrc.replace(TARGET, INSERT);
  const insertTag = '<script defer src="' + matchingSrc + '"></script>';
  const patched = source.replace(overlayTag, insertTag + '\n    ' + overlayTag);

  if (patched === source) return false;
  fs.writeFileSync(filePath, patched, 'utf8');
  return true;
}

function main() {
  const files = [];
  walk(path.join(ROOT, 'src'), files);
  let changed = 0;
  for (const file of files) {
    if (patchFile(file)) {
      changed += 1;
      console.log('updated', path.relative(ROOT, file));
    }
  }
  console.log(`inject-search-matching: ${changed} file(s)`);
}

main();
