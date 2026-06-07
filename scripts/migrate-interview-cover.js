#!/usr/bin/env node
/**
 * Migrates interview heroes to m-article-cover + interview-layout rail.
 * Run: node scripts/migrate-interview-cover.js
 */
const fs = require('fs');
const path = require('path');

const interviewsDir = path.join(__dirname, '../src/pages/interviews');
const coverCssLink =
  '    <link rel="stylesheet" href="../../udf/molecules/article-cover/m-article-cover.css" />\n';

const heroRe =
  /<section class="article-hero interview-hero"([^>]*)>\s*<div class="hero-overlay"><\/div>\s*<div class="hero-content section">\s*<p class="article-author">([^<]*)<\/p>\s*<h1 class="interview-hero__title">([^<]*)<\/h1>\s*<p class="article-meta">([^<]*)<\/p>\s*<\/div>\s*<\/section>/s;

const bodyOpenRe = /<div class="article-body interview-body section">/;

function buildCover(attrs, author, title, meta, imageUrl) {
  const idAttr = attrs.includes('id=') ? ' id="hero"' : '';
  const imgSrc = imageUrl.replace(/^url\(['"]?|['"]?\)$/g, '');
  return `<header class="m-article-cover section"${idAttr}>
        <div class="m-article-cover__inner">
          <h1 class="m-article-cover__title">${title}</h1>
          <p class="m-article-cover__deck">${meta}</p>
          <ul class="m-article-cover__credits">
            <li><span class="m-article-cover__role">Интервью</span> ${author}</li>
            <li><span class="m-article-cover__role">Текст</span> deFindings</li>
          </ul>
        </div>
        <figure class="m-article-cover__hero">
          <div class="m-article-cover__hero-frame">
            <img src="${imgSrc}" alt="" loading="eager" decoding="async" />
          </div>
        </figure>
      </header>`;
}

function buildRail(author, imageUrl) {
  const imgSrc = imageUrl.replace(/^url\(['"]?|['"]?\)$/g, '');
  return `<div class="interview-layout">
        <aside class="interview-layout__rail" aria-label="Портрет">
          <figure class="m-photo-slot m-photo-slot--portrait">
            <div class="m-photo-slot__image">
              <img src="${imgSrc}" alt="${author}" loading="lazy" decoding="async" />
            </div>
          </figure>
        </aside>
        <div class="interview-layout__content">`;
}

function migrateFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  const heroMatch = html.match(heroRe);
  if (!heroMatch) {
    console.warn('skip (no hero match):', path.basename(filePath));
    return false;
  }

  const [, attrs, author, title, meta] = heroMatch;
  const bgMatch = attrs.match(/background-image:\s*([^;]+)/);
  const imageUrl = bgMatch ? bgMatch[1].trim() : '';

  html = html.replace(heroRe, buildCover(attrs, author, title, meta, imageUrl));

  if (!html.includes('m-article-cover.css')) {
    html = html.replace(
      /<link rel="stylesheet" href="\.\.\/\.\.\/udf\/molecules\/article-info\/m-article-info\.css" \/>/,
      `$&\n${coverCssLink.trim()}`
    );
  }

  if (!html.includes('interview-layout')) {
    html = html.replace(bodyOpenRe, (m) => {
      return `${m}\n${buildRail(author, imageUrl)}`;
    });
    html = html.replace(
      /(\s*)<\/div>\s*\n\s*<\/div>\s*\n\s*<section class="m-article-info section">/,
      '$1</div>\n      </div>\n      </div>\n\n      <section class="m-article-info section">'
    );
  }

  fs.writeFileSync(filePath, html);
  console.log('ok:', path.basename(filePath));
  return true;
}

const files = fs.readdirSync(interviewsDir).filter((f) => f.endsWith('.html'));
let ok = 0;
for (const f of files) {
  if (migrateFile(path.join(interviewsDir, f))) ok += 1;
}
console.log(`\nMigrated ${ok}/${files.length} interviews.`);
