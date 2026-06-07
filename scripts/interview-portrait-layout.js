#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/pages/interviews');

const heroMediaRe =
  /(\s*)<figure class="interview-hero__media">\s*<img src="([^"]+)"[^>]*\/>\s*<\/figure>\s*<\/section>\s*\n\s*<div class="article-body interview-body section">/;

const bodyCloseRe =
  /(\s*)<\/div>\s*\n\s*<section class="m-article-info section">/;

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.html'))) {
  const p = path.join(dir, file);
  let html = fs.readFileSync(p, 'utf8');

  if (html.includes('interview-body__layout')) {
    console.log('skip:', file);
    continue;
  }

  const authorMatch = html.match(/<p class="article-author">([^<]*)<\/p>/);
  const author = authorMatch ? authorMatch[1] : '';

  const mediaMatch = html.match(heroMediaRe);
  if (!mediaMatch) {
    console.warn('no media:', file);
    continue;
  }

  const imgSrc = mediaMatch[2];

  html = html.replace(
    heroMediaRe,
    `</section>

      <div class="article-body interview-body section">
        <div class="interview-body__layout">
          <figure class="interview-portrait">
            <img src="${imgSrc}" alt="${author}" loading="lazy" decoding="async" />
          </figure>
          <div class="interview-body__main">`
  );

  html = html.replace(
    bodyCloseRe,
    '$1</div>\n        </div>\n      </div>\n\n      <section class="m-article-info section">'
  );

  fs.writeFileSync(p, html);
  console.log('ok:', file);
}
