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
const QUOTE_LINE_RE = /^>\s*(.+)\s*$/u;

function parseQuoteLine(line) {
  const m = line.match(QUOTE_LINE_RE);
  if (!m) return null;
  let q = m[1].trim();
  if (!q || q === '>') return null;

  if (/^##\s/.test(q) && !/^###\s/.test(q)) return null;
  if (/^#{1,6}\s/.test(q)) q = q.replace(/^#{1,6}\s+/, '').trim();

  if (/атрибуция\s+а[¹12]/i.test(q)) return null;
  if (/редакторск/i.test(q)) return null;

  if (q.startsWith('**') && q.endsWith('**')) q = q.slice(2, -2).trim();
  if (q.startsWith('*') && q.endsWith('*')) q = q.slice(1, -1).trim();

  if (q.length < 15) return null;
  return q || null;
}

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

  let bodyText = lines.slice(i).join('\n');
  const inlineQuotes = [];
  bodyText = bodyText
    .split(/\r?\n/)
    .filter((line) => {
      const q = parseQuoteLine(line);
      if (q) {
        inlineQuotes.push(q);
        return false;
      }
      return true;
    })
    .join('\n');

  const allQuotes = inlineQuotes.length > 0 ? inlineQuotes : quotes;
  return { body: bodyText, quotes: allQuotes };
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

    const inlineQuote = parseQuoteLine(line);
    if (inlineQuote !== null) continue;

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

const QUOTE_BLOCK_RE =
  /<blockquote class="m-quote-block">[\s\S]*?<\/blockquote>/g;

function stripHtml(text) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeText(text) {
  return stripHtml(text)
    .replace(/[«»""„"''—–\-.,!?;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function quoteMdToHtml(quoteText) {
  const inner = inlineMdToHtml(quoteText);
  if (inner.startsWith('<strong>')) return inner;
  return `<strong>${inner}</strong>`;
}

function buildQuoteBlock(quoteText, citeHtml) {
  const inner = quoteMdToHtml(quoteText);
  const cite = citeHtml ?? '';
  return `<blockquote class="m-quote-block">\n          <p>${inner}</p>\n          ${cite}\n        </blockquote>`;
}

function extractCiteFromQuote(block) {
  const m = block.match(/<cite class="m-quote-block__cite">[\s\S]*?<\/cite>/);
  return m ? m[0] : '';
}

function extractQuoteTextsFromHtml(html) {
  const texts = [];
  const re = /<blockquote class="m-quote-block">[\s\S]*?<\/blockquote>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const p = m[0].match(/<p>([\s\S]*?)<\/p>/);
    texts.push(p ? stripHtml(p[1]) : '');
  }
  return texts;
}

function quoteMatchScore(quoteText, sectionText) {
  const q = normalizeText(quoteText);
  const s = normalizeText(sectionText);
  if (!q || !s) return 0;
  if (s.includes(q)) return q.length * 2;

  let best = 0;
  const maxWindow = Math.min(q.length, 80);
  for (let len = maxWindow; len >= 12; len--) {
    for (let start = 0; start <= q.length - len; start++) {
      const sub = q.slice(start, start + len);
      if (s.includes(sub) && len > best) best = len;
    }
  }
  if (best >= 12) return best;

  const words = q.split(' ').filter((w) => w.length > 3);
  if (words.length === 0) return 0;
  const matched = words.filter((w) => s.includes(w)).length;
  const ratio = matched / words.length;
  if (ratio < 0.45) return 0;
  return Math.floor(q.length * ratio);
}

function extractAnswerTexts(sectionHtml) {
  const texts = [];
  const re = /<div class="m-qa-row__answer">([\s\S]*?)<\/div>\s*<div class="m-qa-row__spacer"/g;
  let m;
  while ((m = re.exec(sectionHtml)) !== null) {
    texts.push(m[1]);
  }
  return texts;
}

const SECTION_OPEN = '<div class="m-interview-section">';

function findSectionBounds(html) {
  const sections = [];
  let searchFrom = 0;
  while (true) {
    const start = html.indexOf(SECTION_OPEN, searchFrom);
    if (start === -1) break;
    let depth = 1;
    let i = html.indexOf('>', start) + 1;
    let end = -1;
    while (i < html.length) {
      const openIdx = html.indexOf('<div', i);
      const closeIdx = html.indexOf('</div>', i);
      if (closeIdx === -1) break;
      if (openIdx !== -1 && openIdx < closeIdx) {
        depth++;
        i = html.indexOf('>', openIdx) + 1;
      } else {
        depth--;
        end = closeIdx + 6;
        if (depth === 0) break;
        i = closeIdx + 6;
      }
    }
    if (end === -1) break;
    sections.push({ start, end, html: html.slice(start, end) });
    searchFrom = end;
  }
  return sections;
}

function closeIndexOfBodyDiv(sectionHtml) {
  const open = '<div class="m-interview-section__body">';
  const start = sectionHtml.indexOf(open);
  if (start === -1) return -1;
  let depth = 1;
  let i = sectionHtml.indexOf('>', start) + 1;
  while (i < sectionHtml.length) {
    const openIdx = sectionHtml.indexOf('<div', i);
    const closeIdx = sectionHtml.indexOf('</div>', i);
    if (closeIdx === -1) break;
    if (openIdx !== -1 && openIdx < closeIdx) {
      depth++;
      i = sectionHtml.indexOf('>', openIdx) + 1;
    } else {
      depth--;
      if (depth === 0) return closeIdx + 6;
      i = closeIdx + 6;
    }
  }
  return -1;
}

function sectionBodyHtml(sectionHtml) {
  const open = '<div class="m-interview-section__body">';
  const start = sectionHtml.indexOf(open);
  const end = closeIndexOfBodyDiv(sectionHtml);
  if (start === -1 || end === -1) return sectionHtml;
  const innerStart = sectionHtml.indexOf('>', start) + 1;
  return sectionHtml.slice(innerStart, end - 6);
}

function removeStrayQuoteParagraphs(html) {
  return html.replace(/<p>&gt;\s*[^<]*<\/p>/g, '').replace(/<p>>\s*[^<]*<\/p>/g, '');
}

function relocateAndSyncQuotes(html, quotes) {
  if (quotes.length === 0) {
    return html.replace(QUOTE_BLOCK_RE, '');
  }

  const existing = html.match(QUOTE_BLOCK_RE) ?? [];
  const cite = existing[0] ? extractCiteFromQuote(existing[0]) : '';

  let cleaned = html.replace(QUOTE_BLOCK_RE, '');
  cleaned = removeStrayQuoteParagraphs(cleaned);

  const sections = findSectionBounds(cleaned);
  const assignments = quotes.map((text, idx) => {
    const oldText = extractQuoteTextsFromHtml(html)[idx] ?? text;
    return { text, oldText, sectionIdx: -1, score: 0 };
  });

  for (const a of assignments) {
    for (let i = 0; i < sections.length; i++) {
      let score = quoteMatchScore(a.text, sectionBodyHtml(sections[i].html));
      for (const answer of extractAnswerTexts(sections[i].html)) {
        const answerScore = quoteMatchScore(a.text, answer);
        if (answerScore > score) score = answerScore;
      }
      if (score > a.score) {
        a.score = score;
        a.sectionIdx = i;
      }
    }
    if (a.sectionIdx < 0 && sections.length) {
      for (let i = 0; i < sections.length; i++) {
        let score = quoteMatchScore(a.oldText, sectionBodyHtml(sections[i].html));
        for (const answer of extractAnswerTexts(sections[i].html)) {
          const answerScore = quoteMatchScore(a.oldText, answer);
          if (answerScore > score) score = answerScore;
        }
        if (score > a.score) {
          a.score = score;
          a.sectionIdx = i;
        }
      }
    }
  }

  const bySection = new Map();
  for (const a of assignments) {
    const idx = a.sectionIdx >= 0 ? a.sectionIdx : sections.length - 1;
    if (!bySection.has(idx)) bySection.set(idx, []);
    bySection.get(idx).push(buildQuoteBlock(a.text, cite));
  }

  let offset = 0;
  let updated = cleaned;
  for (let i = 0; i < sections.length; i++) {
    const toInsert = bySection.get(i);
    if (!toInsert?.length) continue;
    const sec = sections[i];
    const pos = updated.indexOf(sec.html, offset);
    if (pos === -1) continue;
    const indent = sec.html.match(/\n( +)<div class="m-interview-section__body">/)?.[1] ?? '        ';
    const joined = toInsert.map((q) => `${indent}${q}`).join('\n');
    const bodyOnly = sec.html.replace(QUOTE_BLOCK_RE, '');
    const bodyEnd = closeIndexOfBodyDiv(bodyOnly);
    const newSection =
      bodyEnd === -1
        ? bodyOnly
        : `${bodyOnly.slice(0, bodyEnd)}\n${joined}${bodyOnly.slice(bodyEnd)}`;
    updated = updated.slice(0, pos) + newSection + updated.slice(pos + sec.html.length);
    offset = pos + newSection.length;
    sections[i] = { ...sec, html: newSection };
  }

  return updated;
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

  updated = removeStrayQuoteParagraphs(updated);
  updated = relocateAndSyncQuotes(updated, quotes);

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
