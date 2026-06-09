#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const BRANDING = path.join(SRC, 'udf/quarks/branding');
const MARKER_START = '<!-- deFindings favicons -->';
const MARKER_END = '<!-- /deFindings favicons -->';

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

function brandingHref(fp, fileName) {
  const rel = path
    .relative(path.dirname(fp), BRANDING)
    .split(path.sep)
    .join('/');
  const prefix = rel ? `${rel}/` : './';
  return `${prefix}${fileName}`;
}

function faviconBlock(fp) {
  const light = brandingHref(fp, 'favicon-light.png');
  const dark = brandingHref(fp, 'favicon-dark.png');
  return [
    `    ${MARKER_START}`,
    `    <link rel="icon" type="image/png" sizes="32x32" href="${light}" media="(prefers-color-scheme: light)" />`,
    `    <link rel="icon" type="image/png" sizes="32x32" href="${dark}" media="(prefers-color-scheme: dark)" />`,
    `    <link rel="icon" type="image/png" sizes="32x32" href="${light}" />`,
    `    ${MARKER_END}`,
  ].join('\n');
}

function stripExisting(html) {
  const re = new RegExp(
    `\\s*${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${MARKER_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    'g'
  );
  return html.replace(re, '');
}

function inject(fp) {
  let html = fs.readFileSync(fp, 'utf8');
  const block = faviconBlock(fp);
  const stripped = stripExisting(html);

  if (stripped.includes('favicon-light.png') || stripped.includes('favicon-dark.png')) {
    console.warn('Skip (foreign favicon):', path.relative(ROOT, fp));
    return false;
  }

  const anchor = /<meta name="viewport"[^>]*\/?>/;
  if (!anchor.test(stripped)) {
    throw new Error(`No viewport meta in ${path.relative(ROOT, fp)}`);
  }

  const next = stripped.replace(anchor, (match) => `${match}\n${block}`);
  if (next === html) return false;

  fs.writeFileSync(fp, next);
  return true;
}

function main() {
  const files = walkHtmlFiles(SRC);
  let count = 0;

  for (const fp of files) {
    if (inject(fp)) {
      count += 1;
      console.log('Injected:', path.relative(ROOT, fp));
    }
  }

  console.log(`Done: ${count} file(s) updated.`);
}

main();
