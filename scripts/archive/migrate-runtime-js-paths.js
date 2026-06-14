#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

const REPLACEMENTS = [
  ['../../stylesheets/micro-animations.css', '../../udf/runtime/micro-animations.css'],
  ['../stylesheets/micro-animations.css', '../udf/runtime/micro-animations.css'],
  ['./stylesheets/micro-animations.css', './udf/runtime/micro-animations.css'],
  ['{{ASSET_ROOT}}stylesheets/micro-animations.css', '{{ASSET_ROOT}}udf/runtime/micro-animations.css'],
  ['../../javascripts/sticky-scroll.js', '../../udf/atoms/sticky-scroll/a-sticky-scroll.js'],
  ['../javascripts/sticky-scroll.js', '../udf/atoms/sticky-scroll/a-sticky-scroll.js'],
  ['./javascripts/sticky-scroll.js', './udf/atoms/sticky-scroll/a-sticky-scroll.js'],
  ['{{ASSET_ROOT}}javascripts/sticky-scroll.js', '{{ASSET_ROOT}}udf/atoms/sticky-scroll/a-sticky-scroll.js'],
  ['../../javascripts/card-reveal.js', '../../udf/molecules/card-reveal/m-card-reveal.js'],
  ['../javascripts/card-reveal.js', '../udf/molecules/card-reveal/m-card-reveal.js'],
  ['./javascripts/card-reveal.js', './udf/molecules/card-reveal/m-card-reveal.js'],
];

const MICRO_ANIM_JS = /javascripts\/micro-animations\.js(\?[^"']*)?/g;

function microAnimReplacement(_match, query) {
  const prefix = _match.startsWith('../../')
    ? '../../'
    : _match.startsWith('../')
      ? '../'
      : _match.startsWith('./')
        ? './'
        : '{{ASSET_ROOT}}';
  return `${prefix}udf/runtime/micro-animations.js`;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fp, files);
    else if (/\.(html|md|js)$/.test(entry.name)) files.push(fp);
  }
  return files;
}

function migrateFile(fp) {
  let html = fs.readFileSync(fp, 'utf8');
  const original = html;

  for (const [from, to] of REPLACEMENTS) {
    html = html.split(from).join(to);
  }

  html = html.replace(
    /(\.\.\/\.\.\/|\.\.\/|\.\/|{{ASSET_ROOT}})javascripts\/micro-animations\.js(\?[^"']*)?/g,
    (match) => {
      const prefix = match.match(/^(\.\.\/\.\.\/|\.\.\/|\.\/|{{ASSET_ROOT}})/)[1];
      return `${prefix}udf/runtime/micro-animations.js`;
    }
  );

  if (html !== original) {
    fs.writeFileSync(fp, html);
    return true;
  }
  return false;
}

function main() {
  const files = walk(SRC);
  let changed = 0;
  for (const fp of files) {
    if (migrateFile(fp)) {
      changed += 1;
      console.log('updated:', path.relative(SRC, fp));
    }
  }
  console.log(`[migrate-runtime-js] ${changed} file(s) updated`);
}

main();
