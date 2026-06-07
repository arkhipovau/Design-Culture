#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/pages/interviews');

const coverRe =
  /<header class="m-article-cover section"([^>]*)>\s*<div class="m-article-cover__inner">\s*<h1 class="m-article-cover__title">([^<]*)<\/h1>\s*<p class="m-article-cover__deck">([^<]*)<\/p>\s*<ul class="m-article-cover__credits">[\s\S]*?<\/ul>\s*<\/div>\s*<figure class="m-article-cover__hero">\s*<div class="m-article-cover__hero-frame">\s*<img src="([^"]+)"[^>]*\/>\s*<\/div>\s*<\/figure>\s*<\/header>/;

const layoutOpenRe =
  /<div class="article-body interview-body section">\s*<div class="interview-layout">\s*<aside class="interview-layout__rail"[^>]*>[\s\S]*?<\/aside>\s*<div class="interview-layout__content">/;

const layoutCloseRe =
  /(\s*)<\/div>\s*<\/div>\s*<\/div>\s*\n\s*<section class="m-article-info section">/;

const coverLinkRe =
  /\n?<link rel="stylesheet" href="\.\.\/\.\.\/udf\/molecules\/article-cover\/m-article-cover\.css" \/>\n?/;

function buildHero(attrs, author, title, meta, imgSrc) {
  const idAttr = attrs.includes('id=') ? ' id="hero"' : '';
  return `<section class="article-hero interview-hero"${idAttr}>
        <div class="hero-content section">
          <p class="article-author">${author}</p>
          <h1 class="interview-hero__title">${title}</h1>
          <p class="article-meta">${meta}</p>
        </div>
        <figure class="interview-hero__media">
          <img src="${imgSrc}" alt="" loading="eager" decoding="async" />
        </figure>
      </section>`;
}

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.html'))) {
  const p = path.join(dir, file);
  let html = fs.readFileSync(p, 'utf8');

  const coverMatch = html.match(coverRe);
  if (!coverMatch) {
    console.warn('skip cover:', file);
    continue;
  }

  const [, attrs, title, meta, imgSrc] = coverMatch;
  const authorMatch = html.match(
    /<aside class="interview-layout__rail"[^>]*>[\s\S]*?alt="([^"]*)"/
  );
  const author = authorMatch ? authorMatch[1] : meta.split('•')[0]?.trim() || '';

  html = html.replace(coverRe, buildHero(attrs, author, title, meta, imgSrc));
  html = html.replace(layoutOpenRe, '<div class="article-body interview-body section">');
  html = html.replace(
    layoutCloseRe,
    '$1</div>\n\n      <section class="m-article-info section">'
  );
  html = html.replace(coverLinkRe, '\n');

  fs.writeFileSync(p, html);
  console.log('fixed:', file);
}
