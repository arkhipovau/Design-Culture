#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TEMPLATE_PATH = path.join(ROOT, 'src/udf/templates/t-interview.html');
const HTML_DIR = path.join(ROOT, 'src/pages/interviews');

const SLOT_RE = {
  hero: /<section class="o-interview-hero[\s\S]*?<\/section>/,
  body: /<div class="o-interview-body a-section">[\s\S]*?<\/div>\s*\n\s*<div class="o-interview-footer">/,
  footer: /<div class="o-interview-footer">[\s\S]*?<\/div>\s*\n\s*<\/main>/,
};

function extractSlots(html) {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const readingMatch = html.match(/data-reading-page="([^"]*)"/);
  const stickyMatch = html.match(/a-sticky-scroll__current">«([^»]*)»/);
  const heroMatch = html.match(SLOT_RE.hero);
  const bodyMatch = html.match(SLOT_RE.body);
  const footerMatch = html.match(SLOT_RE.footer);

  if (!heroMatch || !bodyMatch || !footerMatch) {
    return { error: 'missing hero, body, or footer block' };
  }

  const body = bodyMatch[0].replace(/\s*<div class="o-interview-footer">$/, '');

  return {
    title: titleMatch ? titleMatch[1].replace(/ – deFindings$/, '') : '',
    readingPage: readingMatch?.[1] ?? '',
    stickyName: stickyMatch?.[1] ?? '',
    hero: heroMatch[0],
    body,
    footer: footerMatch[0].replace(/\s*<\/main>$/, ''),
  };
}

function fillTemplate(slots) {
  let out = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const indent = '      ';
  out = out
    .replace('{{TITLE}}', slots.title)
    .replace('{{READING_PAGE}}', slots.readingPage)
    .replace('{{STICKY_NAME}}', slots.stickyName)
    .replace('{{HERO}}', indent + slots.hero.trim().replace(/\n/g, `\n${indent}`))
    .replace('{{BODY}}', indent + slots.body.trim().replace(/\n/g, `\n${indent}`))
    .replace('{{FOOTER}}', indent + slots.footer.trim().replace(/\n/g, `\n${indent}`));
  return out;
}

function validateContent(html) {
  const required = [
    'o-interview-hero',
    'o-interview-body',
    'o-interview-footer',
    'm-article-info__col',
    'm-next-article__lead',
    'q-findings-overlay',
    'bundles/interview.css',
  ];
  return required.filter((token) => !html.includes(token));
}

function validate(html) {
  const missing = validateContent(html);
  if (!html.includes('o-site-shell')) missing.push('o-site-shell');
  return missing;
}

function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--check');
  const checkOnly = process.argv.includes('--check');
  const slug = args[0];

  const files = slug
    ? [`${slug}.html`]
    : fs.readdirSync(HTML_DIR).filter((f) => f.endsWith('.html'));

  let failures = 0;

  for (const file of files) {
    const fp = path.join(HTML_DIR, file);
    const html = fs.readFileSync(fp, 'utf8');
    const missing = checkOnly || !slug
      ? validate(html)
      : validateContent(html);
    if (missing.length) {
      failures += 1;
      console.error(`${file}: missing ${missing.join(', ')}`);
      continue;
    }

    if (checkOnly) {
      console.log(`${file}: ok`);
      continue;
    }

    if (!slug) continue;

    const slots = extractSlots(html);
    if (slots.error) {
      failures += 1;
      console.error(`${file}: ${slots.error}`);
      continue;
    }

    const rendered = fillTemplate(slots);
    const postMissing = validate(rendered);
    if (postMissing.length) {
      failures += 1;
      console.error(`${file}: rendered output missing ${postMissing.join(', ')}`);
      continue;
    }

    fs.writeFileSync(fp, rendered);
    console.log(`rendered: ${file}`);
  }

  if (checkOnly && failures === 0) {
    console.log(`all ${files.length} interviews pass UDF structure check`);
  }

  process.exit(failures ? 1 : 0);
}

main();
