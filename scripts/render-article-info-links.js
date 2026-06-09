#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { INTERVIEW_LINKS } = require('./interview-links-data');

const ROOT = path.resolve(__dirname, '..');
const META_PATH = path.join(ROOT, 'content/interviews-meta.json');
const HTML_DIR = path.join(ROOT, 'src/pages/interviews');

function renderLinksUl(links) {
  if (!links.length) {
    return '          <ul>\n              <li>–</li>\n          </ul>';
  }
  const items = links
    .map(
      (link) =>
        `            <li><a href="${link.href}" target="_blank" rel="noopener noreferrer">${link.label}</a></li>`
    )
    .join('\n');
  return `          <ul>\n${items}\n          </ul>`;
}

function updateHtml(slug, links) {
  const fp = path.join(HTML_DIR, `${slug}.html`);
  let html = fs.readFileSync(fp, 'utf8');
  const ulHtml = renderLinksUl(links);
  const linksBlockRe =
    /<h3>Линки<\/h3>\s*<ul>[\s\S]*?<\/ul>(?:\s*<p class="m-article-info__disclaimer">[\s\S]*?<\/p>)?/;
  if (!linksBlockRe.test(html)) {
    throw new Error(`Could not find links block in ${slug}.html`);
  }
  const next = html.replace(linksBlockRe, `<h3>Линки</h3>\n${ulHtml}`);
  if (next !== html) {
    fs.writeFileSync(fp, next);
  }
}

function hrefToMetaString(href) {
  return href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

function updateMeta(meta, slug, links) {
  if (!meta.interviews[slug]) return;
  meta.interviews[slug].links = links.map((l) => hrefToMetaString(l.href));
}

function main() {
  const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));

  for (const slug of meta.order) {
    const links = INTERVIEW_LINKS[slug];
    if (!links) {
      console.warn('No links defined for', slug);
      continue;
    }
    updateHtml(slug, links);
    updateMeta(meta, slug, links);
    console.log(`${slug}: ${links.length} link(s)`);
  }

  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2) + '\n');
}

main();
