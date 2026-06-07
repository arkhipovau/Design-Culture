/**
 * Sync interview Q&A body text from content/interviews/*.md into src/pages/interviews/*.html.
 * Preserves: hero H1/subtitle, lede, speaker name labels, photos, article-info, next-article.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MD_DIR = path.join(ROOT, 'content', 'interviews');
const HTML_DIR = path.join(ROOT, 'src', 'pages', 'interviews');

const SPEAKER_RE = /^\*\*([^*:]+):\*\*\s*(.*)$/;

function inlineMdToHtml(text) {
  let out = text;
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  return out;
}

function paragraphsToHtml(paragraphs) {
  return paragraphs.map((p) => `<p>${inlineMdToHtml(p)}</p>`).join('');
}

function stripPublishable(md) {
  let text = md;
  const rkIdx = text.indexOf('### [РК]');
  if (rkIdx !== -1) text = text.slice(0, rkIdx);

  const quotes = [];
  text = text.replace(/\s*$/u, '');
  const quoteBlock = text.match(/\n---\n\n((?:> .+\n\n?)+)\n---\s*$/u);
  if (quoteBlock) {
    for (const line of quoteBlock[1].split(/\r?\n/)) {
      const m = line.match(/^>\s*(.+)\s*$/u);
      if (!m) continue;
      let q = m[1].trim();
      if (q.startsWith('**') && q.endsWith('**')) q = q.slice(2, -2).trim();
      if (q) quotes.push(q);
    }
    text = text.slice(0, text.length - quoteBlock[0].length);
  }

  const lines = text.split(/\r?\n/);
  let i = 0;
  if (lines[i]?.startsWith('#')) i++;
  while (i < lines.length && lines[i].trim() === '') i++;

  if (lines[i]?.startsWith('*') && !lines[i].startsWith('**')) {
    i++;
  } else if (i < lines.length && lines[i].trim() && !lines[i].startsWith('#')) {
    while (i < lines.length && !lines[i].startsWith('---') && !lines[i].startsWith('##')) {
      i++;
    }
  }

  while (i < lines.length && (lines[i].trim() === '' || lines[i].startsWith('---'))) i++;

  if (lines[i]?.startsWith('>')) {
    while (i < lines.length && (lines[i].startsWith('>') || lines[i].trim() === '')) i++;
    while (i < lines.length && (lines[i].trim() === '' || lines[i].startsWith('---'))) i++;
  }

  return { body: lines.slice(i).join('\n'), quotes };
}

function parseTurns(body) {
  const turns = [];
  const lines = body.split(/\r?\n/);
  let current = null;
  let needNewParagraph = false;

  function flush() {
    if (!current) return;
    current.paragraphs = current.paragraphs.filter((p) => p !== null && p !== '');
    turns.push(current.paragraphs);
    current = null;
    needNewParagraph = false;
  }

  for (const line of lines) {
    if (line.startsWith('## ')) continue;
    if (line.trim() === '---') continue;

    const sm = line.match(SPEAKER_RE);
    if (sm) {
      flush();
      current = { paragraphs: [] };
      if (sm[2].trim()) {
        current.paragraphs.push(sm[2].trim());
        needNewParagraph = false;
      } else {
        needNewParagraph = true;
      }
      continue;
    }

    if (line.trim() === '') {
      if (current) needNewParagraph = true;
      continue;
    }

    if (!current) continue;

    const trimmed = line.trim();
    if (/^\d+\.\s/.test(trimmed)) {
      current.paragraphs.push(trimmed);
      needNewParagraph = false;
      continue;
    }

    if (needNewParagraph || current.paragraphs.length === 0) {
      current.paragraphs.push(trimmed);
      needNewParagraph = false;
    } else {
      const last = current.paragraphs.length - 1;
      current.paragraphs[last] = `${current.paragraphs[last]} ${trimmed}`;
    }
  }

  flush();
  return turns;
}

function extractAnswerBlocks(html) {
  const re =
    /(<div class="m-qa-row__answer">)([\s\S]*?)(<\/div>\s*<div class="m-qa-row__spacer")/g;
  const blocks = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push({ start: m[1], inner: m[2], end: m[3], index: m.index, full: m[0] });
  }
  return blocks;
}

function countParagraphsInAnswerInner(inner) {
  const matches = inner.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi);
  return matches ? matches.length : 0;
}

/** Split MD turns when HTML breaks one speaker block across multiple rows (e.g. photo slots). */
function expandTurnsForHtml(turns, answerBlocks) {
  if (turns.length === answerBlocks.length) return turns;

  const expanded = [];
  let h = 0;
  for (let t = 0; t < turns.length; t++) {
    const htmlRemaining = answerBlocks.length - h;
    const mdRemaining = turns.length - t;

    if (htmlRemaining === mdRemaining) {
      expanded.push(...turns.slice(t));
      return expanded;
    }

    const paras = [...turns[t]];
    while (
      paras.length > 0 &&
      h < answerBlocks.length &&
      answerBlocks.length - h > turns.length - t
    ) {
      const n = countParagraphsInAnswerInner(answerBlocks[h].inner);
      expanded.push(paras.splice(0, n));
      h++;
    }

    if (paras.length > 0) {
      expanded.push(paras);
      h++;
    } else if (h < answerBlocks.length && expanded.length < answerBlocks.length) {
      // turn fully consumed across split blocks
    }
  }

  return expanded;
}

function extractQuoteBlocks(html) {
  const re =
    /(<blockquote class="m-quote-block">\s*<p>)([\s\S]*?)(<\/p>\s*<cite class="m-quote-block__cite">[\s\S]*?<\/cite>\s*<\/blockquote>)/g;
  const blocks = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push({ start: m[1], inner: m[2], end: m[3] });
  }
  return blocks;
}

function quoteMdToHtml(quoteText) {
  const inner = inlineMdToHtml(quoteText);
  if (inner.startsWith('<strong>')) return inner;
  return `<strong>${inner}</strong>`;
}

function syncHtmlFromMd(html, turns, quotes) {
  const answerBlocks = extractAnswerBlocks(html);
  const alignedTurns = expandTurnsForHtml(turns, answerBlocks);

  if (alignedTurns.length !== answerBlocks.length) {
    return {
      html: null,
      error: `answer count mismatch: html=${answerBlocks.length} md=${turns.length} aligned=${alignedTurns.length}`,
    };
  }

  let offset = 0;
  let updated = html;
  for (let i = 0; i < answerBlocks.length; i++) {
    const block = answerBlocks[i];
    const newInner = paragraphsToHtml(alignedTurns[i]);
    const pos = updated.indexOf(block.full, offset);
    if (pos === -1) {
      return { html: null, error: `could not locate answer block ${i + 1}` };
    }
    const replacement = `${block.start}${newInner}${block.end}`;
    updated = updated.slice(0, pos) + replacement + updated.slice(pos + block.full.length);
    offset = pos + replacement.length;
  }

  if (quotes.length > 0) {
    const quoteBlocks = extractQuoteBlocks(updated);
    if (quoteBlocks.length !== quotes.length) {
      return {
        html: null,
        error: `quote count mismatch: html=${quoteBlocks.length} md=${quotes.length}`,
      };
    }
    offset = 0;
    for (let i = 0; i < quoteBlocks.length; i++) {
      const block = quoteBlocks[i];
      const full = block.start + block.inner + block.end;
      const newInner = quoteMdToHtml(quotes[i]);
      const pos = updated.indexOf(full, offset);
      if (pos === -1) {
        return { html: null, error: `could not locate quote block ${i + 1}` };
      }
      const replacement = block.start + newInner + block.end;
      updated = updated.slice(0, pos) + replacement + updated.slice(pos + full.length);
      offset = pos + replacement.length;
    }
  }

  return { html: updated, error: null };
}

function extractHeroAndLede(html) {
  const hero = html.match(/<h1 class="interview-hero__title">[\s\S]*?<\/h1>/);
  const lede = html.match(/<p class="lede">[\s\S]*?<\/p>/);
  return { hero: hero?.[0] ?? '', lede: lede?.[0] ?? '' };
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const files = fs
    .readdirSync(HTML_DIR)
    .filter((f) => f.endsWith('.html') && f !== 'interview.css')
    .sort();

  const results = [];

  for (const file of files) {
    const slug = file.replace(/\.html$/, '');
    const mdPath = path.join(MD_DIR, `${slug}.md`);
    const htmlPath = path.join(HTML_DIR, file);

    if (!fs.existsSync(mdPath)) {
      results.push({ slug, status: 'skip', reason: 'no md file' });
      continue;
    }

    const md = fs.readFileSync(mdPath, 'utf8');
    const htmlBefore = fs.readFileSync(htmlPath, 'utf8');
    const preserved = extractHeroAndLede(htmlBefore);
    const { body, quotes } = stripPublishable(md);
    const turns = parseTurns(body);
    const { html, error } = syncHtmlFromMd(htmlBefore, turns, quotes);

    if (error) {
      results.push({ slug, status: 'error', reason: error });
      continue;
    }

    const preservedAfter = extractHeroAndLede(html);
    if (preserved.hero !== preservedAfter.hero || preserved.lede !== preservedAfter.lede) {
      results.push({ slug, status: 'error', reason: 'hero or lede changed unexpectedly' });
      continue;
    }

    if (html !== htmlBefore) {
      if (!dryRun) fs.writeFileSync(htmlPath, html, 'utf8');
      results.push({ slug, status: dryRun ? 'would-update' : 'updated', turns: turns.length, quotes: quotes.length });
    } else {
      results.push({ slug, status: 'unchanged', turns: turns.length, quotes: quotes.length });
    }
  }

  for (const r of results) {
    const extra = r.turns != null ? ` (${r.turns} answers, ${r.quotes ?? 0} quotes)` : '';
    console.log(`${r.slug}: ${r.status}${r.reason ? ` — ${r.reason}` : ''}${extra}`);
  }

  const errors = results.filter((r) => r.status === 'error');
  if (errors.length) process.exitCode = 1;
}

main();
