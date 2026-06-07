#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = path.join(__dirname, '../src/pages/interviews');
const repoRoot = path.join(__dirname, '..');

const heroRe =
  /(<section class="article-hero interview-hero"[^>]*>[\s\S]*?<p class="article-meta">[^<]*<\/p>\s*<\/div>)(\s*<\/section>)/;

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.html'))) {
  const p = path.join(dir, file);
  let html = fs.readFileSync(p, 'utf8');

  if (html.includes('class="interview-portrait"')) {
    console.log('skip:', file);
    continue;
  }

  const authorMatch = html.match(/<p class="article-author">([^<]*)<\/p>/);
  const author = authorMatch ? authorMatch[1] : '';

  let imgSrc = '';
  try {
    const committed = execSync(
      `git show HEAD:src/pages/interviews/${file}`,
      { cwd: repoRoot, encoding: 'utf8' }
    );
    const bg = committed.match(/background-image:\s*url\('([^']+)'\)/);
    const inline = committed.match(
      /<figure class="interview-portrait">[\s\S]*?<img src="([^"]+)"/
    );
    imgSrc = inline?.[1] || bg?.[1] || '';
  } catch {
    /* not in git */
  }

  if (!imgSrc) {
    console.warn('no image:', file);
    continue;
  }

  const portrait = `
        <figure class="interview-portrait">
          <img src="${imgSrc}" alt="${author}" width="200" height="267" loading="lazy" decoding="async" />
        </figure>`;

  if (!heroRe.test(html)) {
    console.warn('no hero:', file);
    continue;
  }

  html = html.replace(heroRe, `$1${portrait}$2`);
  fs.writeFileSync(p, html);
  console.log('added:', file);
}
