#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const MEASUREMENT_ID = 'G-45ZC96BSF5';

function gaBlock(scriptSrc) {
  return [
    '    <!-- Google tag (gtag.js) -->',
    `    <script src="${scriptSrc}"></script>`,
    '    <!-- /Google tag (gtag.js) -->',
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
  if (html.includes('google-analytics.js') || html.includes(MEASUREMENT_ID)) {
    return false;
  }

  const rel = path.relative(path.dirname(fp), path.join(SRC, 'javascripts')).split(path.sep).join('/');
  const scriptSrc = (rel ? rel + '/' : './') + 'google-analytics.js';
  const block = gaBlock(scriptSrc);

  let next = html.replace(
    /<!-- \/Yandex\.Metrika counter -->\n/,
    '<!-- /Yandex.Metrika counter -->\n' + block + '\n'
  );

  if (next === html) {
    next = html.replace(/\n  <\/head>/, '\n' + block + '\n  </head>');
  }

  if (next === html) {
    throw new Error(`Could not inject GA into ${path.relative(ROOT, fp)}`);
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
