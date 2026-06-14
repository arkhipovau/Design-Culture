#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/pages/interviews');

const layoutBlockRe =
  /<div class="interview-body__layout">\s*<figure class="interview-portrait">\s*<img src="([^"]+)" alt="([^"]*)"[^>]*\/>\s*<\/figure>\s*<div class="interview-body__main">/;

const heroCloseRe =
  /(<p class="article-meta">[^<]*<\/p>\s*<\/div>)(\s*<\/section>)/;

const bodyEndRe =
  /\s*<\/div>\s*<\/div>\s*<\/div>\s*\n\s*<section class="m-article-info a-section">/;

const bodyEndSingleRe =
  /\s*<\/div>\s*\n\s*<section class="m-article-info a-section">/;

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.html'))) {
  const p = path.join(dir, file);
  let html = fs.readFileSync(p, 'utf8');

  const layoutMatch = html.match(layoutBlockRe);
  if (!layoutMatch) {
    if (html.includes('interview-portrait') && !html.includes('interview-body__layout')) {
      console.log('already ok:', file);
      continue;
    }
    console.warn('skip:', file);
    continue;
  }

  const [, imgSrc, alt] = layoutMatch;
  const portrait = `
        <figure class="interview-portrait">
          <img src="${imgSrc}" alt="${alt}" width="200" height="267" loading="lazy" decoding="async" />
        </figure>`;

  if (!html.includes('class="interview-portrait"')) {
    html = html.replace(heroCloseRe, `$1${portrait}$2`);
  }

  html = html.replace(layoutBlockRe, '');

  if (bodyEndRe.test(html)) {
    html = html.replace(bodyEndRe, '\n      </div>\n\n      <section class="m-article-info a-section">');
  } else if (!bodyEndSingleRe.test(html)) {
    console.warn('body end?', file);
  }

  html = html.replace(/<\/div><\/section>/g, '</div>\n      </section>');

  fs.writeFileSync(p, html);
  console.log('fixed:', file);
}
