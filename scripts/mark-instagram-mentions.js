#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { unmarkInstagramMentions } = require('./instagram-disclaimer');

const ROOT = path.resolve(__dirname, '..');
const MD_DIR = path.join(ROOT, 'content/interviews');
const HTML_DIR = path.join(ROOT, 'src/pages/interviews');

const DISCLAIMER_RE =
  /\s*<p class="m-(?:article-info__disclaimer|interview-disclaimer)"><sup>\*<\/sup> Meta Platforms Inc\.[\s\S]*?<\/p>/g;

function unmarkMdFile(fp) {
  const original = fs.readFileSync(fp, 'utf8');
  const next = unmarkInstagramMentions(original);
  if (next !== original) {
    fs.writeFileSync(fp, next);
    return true;
  }
  return false;
}

function unmarkHtmlFile(fp) {
  let html = fs.readFileSync(fp, 'utf8');
  const original = html;

  html = html.replace(DISCLAIMER_RE, '');
  html = unmarkInstagramMentions(html);

  if (html !== original) {
    fs.writeFileSync(fp, html);
    return true;
  }
  return false;
}

function main() {
  const mdFiles = fs
    .readdirSync(MD_DIR)
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(MD_DIR, name));

  let mdCount = 0;
  for (const fp of mdFiles) {
    if (unmarkMdFile(fp)) {
      mdCount += 1;
      console.log('Unmarked md:', path.basename(fp));
    }
  }

  const htmlFiles = fs
    .readdirSync(HTML_DIR)
    .filter((name) => name.endsWith('.html'))
    .map((name) => path.join(HTML_DIR, name));

  let htmlCount = 0;
  for (const fp of htmlFiles) {
    if (unmarkHtmlFile(fp)) {
      htmlCount += 1;
      console.log('Cleaned html:', path.basename(fp));
    }
  }

  console.log(`Done: ${mdCount} md, ${htmlCount} html.`);
}

main();
