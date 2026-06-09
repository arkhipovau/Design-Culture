#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const {
  META_INSTAGRAM_BODY_DISCLAIMER_HTML,
  markInstagramMentions,
  hasInstagramMention,
} = require('./instagram-disclaimer');

const ROOT = path.resolve(__dirname, '..');
const MD_DIR = path.join(ROOT, 'content/interviews');
const HTML_DIR = path.join(ROOT, 'src/pages/interviews');

function markMdFile(fp) {
  const original = fs.readFileSync(fp, 'utf8');
  const next = markInstagramMentions(original);
  if (next !== original) {
    fs.writeFileSync(fp, next);
    return true;
  }
  return false;
}

function markHtmlBody(fp) {
  let html = fs.readFileSync(fp, 'utf8');
  const original = html;

  html = html.replace(
    /(<div class="m-qa-row__answer">)([\s\S]*?)(<\/div>\s*<div class="m-qa-row__spacer")/g,
    (_, open, body, close) => `${open}${markInstagramMentions(body)}${close}`
  );

  if (html !== original) {
    fs.writeFileSync(fp, html);
    return true;
  }
  return false;
}

function ensureBodyDisclaimer(fp) {
  let html = fs.readFileSync(fp, 'utf8');

  if (html.includes('m-article-info__disclaimer')) return false;
  if (!hasInstagramMention(html)) return false;
  if (html.includes('m-interview-disclaimer')) return false;

  const anchor = /(\s*)<section class="m-article-info section">/;
  if (!anchor.test(html)) return false;

  const next = html.replace(anchor, `\n$1${META_INSTAGRAM_BODY_DISCLAIMER_HTML}\n$1<section class="m-article-info section">`);
  if (next === html) return false;

  fs.writeFileSync(fp, next);
  return true;
}

function main() {
  const mdFiles = fs
    .readdirSync(MD_DIR)
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(MD_DIR, name));

  let mdCount = 0;
  for (const fp of mdFiles) {
    if (markMdFile(fp)) {
      mdCount += 1;
      console.log('Marked md:', path.basename(fp));
    }
  }

  const htmlFiles = fs
    .readdirSync(HTML_DIR)
    .filter((name) => name.endsWith('.html'))
    .map((name) => path.join(HTML_DIR, name));

  let htmlCount = 0;
  let disclaimerCount = 0;
  for (const fp of htmlFiles) {
    if (markHtmlBody(fp)) {
      htmlCount += 1;
      console.log('Marked html body:', path.basename(fp));
    }
    if (ensureBodyDisclaimer(fp)) {
      disclaimerCount += 1;
      console.log('Added body disclaimer:', path.basename(fp));
    }
  }

  console.log(`Done: ${mdCount} md, ${htmlCount} html body, ${disclaimerCount} disclaimer(s).`);
}

main();
