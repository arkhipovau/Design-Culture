#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'src');
const MARKER = 'udf/runtime/site-gate.js';
const SKIP = new Set([path.join(ROOT, 'pages/sphere-embed.html')]);

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full);
  }
}

function depthFromSrc(filePath) {
  const rel = path.relative(ROOT, filePath);
  const parts = rel.split(path.sep);
  parts.pop();
  return parts.length;
}

function gateTag(depth) {
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  return `    <script src="${prefix}udf/runtime/site-gate.js"></script>`;
}

function inject(filePath) {
  if (SKIP.has(filePath)) return false;
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes(MARKER)) return false;

  const tag = gateTag(depthFromSrc(filePath));
  const viewportMatch = html.match(/<meta name="viewport"[^>]*>\s*/i);
  if (!viewportMatch) {
    console.warn('[inject-site-gate] skip (no viewport):', path.relative(ROOT, filePath));
    return false;
  }

  const insertAt = viewportMatch.index + viewportMatch[0].length;
  html = html.slice(0, insertAt) + tag + '\n' + html.slice(insertAt);
  fs.writeFileSync(filePath, html);
  return true;
}

const files = [];
walk(ROOT, files);

let count = 0;
for (const filePath of files) {
  if (filePath.includes(`${path.sep}templates${path.sep}`)) continue;
  if (inject(filePath)) count += 1;
}

for (const template of ['t-site.html', 't-interview.html', 't-site-minimal.html']) {
  const filePath = path.join(ROOT, 'udf/templates', template);
  if (fs.existsSync(filePath) && inject(filePath)) count += 1;
}

console.log(`[inject-site-gate] Updated ${count} files`);
