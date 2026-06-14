#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const REPLACEMENTS = [
  [
    '<a href="#top">О проекте</a>',
    '<a href="./pages/about.html">О проекте</a>\n          <a href="./pages/privacy.html">Политика конфиденциальности</a>',
  ],
  [
    '<a href="./about.html">О проекте</a>',
    '<a href="./about.html">О проекте</a>\n          <a href="./privacy.html">Политика конфиденциальности</a>',
  ],
  [
    '<a href="../about.html">О проекте</a>',
    '<a href="../about.html">О проекте</a>\n          <a href="../privacy.html">Политика конфиденциальности</a>',
  ],
];

function walkHtmlFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(fp, files);
      continue;
    }
    if (entry.name.endsWith('.html') && entry.name !== 'privacy.html') files.push(fp);
  }
  return files;
}

function main() {
  let count = 0;

  for (const fp of walkHtmlFiles(SRC)) {
    let html = fs.readFileSync(fp, 'utf8');
    const original = html;

    for (const [from, to] of REPLACEMENTS) {
      html = html.replace(from, to);
    }

    if (html !== original) {
      fs.writeFileSync(fp, html);
      count += 1;
      console.log('Updated:', path.relative(ROOT, fp));
    }
  }

  console.log(`Done: ${count} file(s) updated.`);
}

main();
