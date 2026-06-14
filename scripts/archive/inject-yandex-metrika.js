#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const COUNTER_ID = '109727534';

function metrikaBlock(scriptSrc) {
  return [
    '    <!-- Yandex.Metrika counter -->',
    `    <script src="${scriptSrc}"></script>`,
    `    <noscript><div><img src="https://mc.yandex.ru/watch/${COUNTER_ID}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>`,
    '    <!-- /Yandex.Metrika counter -->',
  ].join('\n');
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

function inject(fp) {
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes('yandex-metrika.js') || html.includes('mc.yandex.ru/metrika')) {
    return false;
  }

  const rel = path.relative(path.dirname(fp), path.join(SRC, 'javascripts')).split(path.sep).join('/');
  const scriptSrc = (rel ? rel + '/' : './') + 'yandex-metrika.js';
  const block = metrikaBlock(scriptSrc);
  const next = html.replace(/\n  <\/head>/, '\n' + block + '\n  </head>');

  if (next === html) {
    throw new Error(`Could not inject Metrika into ${path.relative(ROOT, fp)}`);
  }

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
