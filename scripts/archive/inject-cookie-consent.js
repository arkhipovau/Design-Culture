#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const ANALYTICS_BLOCK =
  /[ \t]*<!-- Yandex\.Metrika counter -->[\s\S]*?<!-- \/Google tag \(gtag\.js\) -->\n?/;

const COOKIE_BLOCK =
  /[ \t]*<script defer src="[^"]*m-cookie-consent\.js"><\/script>\n?/;

const LEGACY_COOKIE_BLOCK =
  /[ \t]*<link rel="stylesheet" href="[^"]*cookie-consent\.css" \/>\n?[ \t]*<script defer src="[^"]*cookie-consent\.js"><\/script>\n?/;

const SKIP_FILES = new Set(['sphere-embed.html']);

function relPath(fromDir, toPath) {
  return path.relative(fromDir, toPath).split(path.sep).join('/');
}

function walkHtmlFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(fp, files);
      continue;
    }
    if (entry.name.endsWith('.html')) files.push(fp);
  }
  return files;
}

function cookieBlock(dir, html) {
  const js = relPath(dir, path.join(SRC, 'udf/molecules/cookie-consent/m-cookie-consent.js'));
  const css = relPath(dir, path.join(SRC, 'udf/molecules/cookie-consent/m-cookie-consent.css'));
  const btn = relPath(dir, path.join(SRC, 'udf/atoms/button/a-button.css'));

  const lines = [];
  const usesShell = html.includes('bundles/shell.css');
  if (!usesShell && !html.includes('a-button.css')) {
    lines.push('    <link rel="stylesheet" href="' + btn + '?v=20260522c" />');
  }
  if (!usesShell && !html.includes('m-cookie-consent.css')) {
    lines.push('    <link rel="stylesheet" href="' + css + '" />');
  }
  lines.push('    <script defer src="' + js + '"></script>');
  return lines.join('\n');
}

function update(fp) {
  let html = fs.readFileSync(fp, 'utf8');
  const original = html;
  const dir = path.dirname(fp);
  const skipCookie = SKIP_FILES.has(path.basename(fp));

  html = html.replace(ANALYTICS_BLOCK, '');
  html = html.replace(LEGACY_COOKIE_BLOCK, '');

  if (skipCookie) {
    html = html.replace(COOKIE_BLOCK, '');
  }

  if (!skipCookie && !html.includes('m-cookie-consent.js')) {
    html = html.replace(/\n  <\/head>/, '\n' + cookieBlock(dir, html) + '\n  </head>');
  }

  if (html === original) return false;
  fs.writeFileSync(fp, html);
  return true;
}

function main() {
  let count = 0;
  for (const fp of walkHtmlFiles(SRC)) {
    if (update(fp)) {
      count += 1;
      console.log('Updated:', path.relative(ROOT, fp));
    }
  }
  console.log('Done: ' + count + ' file(s) updated.');
}

main();
