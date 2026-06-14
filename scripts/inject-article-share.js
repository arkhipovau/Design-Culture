#!/usr/bin/env node
/**
 * Injects m-article-share block + script into interview article pages.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const INTERVIEWS_DIR = path.join(ROOT, 'src/pages/interviews');
const TEMPLATE_PATH = path.join(ROOT, 'src/udf/templates/t-interview.html');

const SHARE_BLOCK = `<div class="m-article-share" data-article-share>
          <button class="m-article-share__copy a-button a-button--s a-button--black" type="button" data-share-copy>Поделиться</button>
          <a class="m-article-share__telegram a-arrow-button a-arrow-button--telegram" href="#" target="_blank" rel="noopener noreferrer" data-share-telegram aria-label="Открыть в Telegram"></a>
          <span class="a-visually-hidden m-article-share__status" role="status" aria-live="polite" data-share-status></span>
        </div>
`;

const SHARE_SCRIPT = '    <script defer src="../../udf/molecules/article-share/m-article-share.js"></script>\n';

const FOOTER_RE = /(<div class="o-interview-footer">\s*\n)(?!\s*<div class="m-article-share")/;
const SCRIPT_RE = /    <script defer src="\.\.\/\.\.\/udf\/molecules\/article-share\/m-article-share\.js"><\/script>\n?/;

function patchHtml(html) {
  let next = html;
  let changed = false;

  if (!next.includes('data-article-share')) {
    if (!FOOTER_RE.test(next)) return { html: next, changed: false, error: 'footer anchor not found' };
    next = next.replace(FOOTER_RE, `$1        ${SHARE_BLOCK}`);
    changed = true;
  }

  if (!next.includes('m-article-share.js')) {
    const anchor = '    <script defer src="../../udf/runtime/micro-animations.js"></script>\n';
    if (!next.includes(anchor)) return { html: next, changed, error: 'script anchor not found' };
    next = next.replace(anchor, `${SHARE_SCRIPT}${anchor}`);
    changed = true;
  } else {
    next = next.replace(SCRIPT_RE, SHARE_SCRIPT);
  }

  return { html: next, changed, error: null };
}

function patchFile(filePath) {
  const before = fs.readFileSync(filePath, 'utf8');
  const { html, changed, error } = patchHtml(before);
  if (error) return { status: 'error', reason: error };
  if (!changed) return { status: 'unchanged' };
  fs.writeFileSync(filePath, html);
  return { status: 'updated' };
}

function main() {
  const targets = fs
    .readdirSync(INTERVIEWS_DIR)
    .filter((name) => name.endsWith('.html'))
    .map((name) => path.join(INTERVIEWS_DIR, name));

  targets.push(TEMPLATE_PATH);

  for (const filePath of targets) {
    const rel = path.relative(ROOT, filePath);
    const result = patchFile(filePath);
    console.log(`${rel}: ${result.status}${result.reason ? ` — ${result.reason}` : ''}`);
    if (result.status === 'error') process.exitCode = 1;
  }
}

main();
