/**
 * Move pull-quotes inline: after the m-interview-section where the phrase appears
 * (TBI-style), instead of clustered at the end of the article.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const HTML_DIR = path.join(ROOT, 'src', 'pages', 'interviews');

const QUOTE_RE =
  /<blockquote class="m-quote-block">[\s\S]*?<\/blockquote>/g;
const SECTION_OPEN = '<div class="m-interview-section">';

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

function extractQuoteText(block) {
  const p = block.match(/<p>([\s\S]*?)<\/p>/);
  return p ? stripHtml(p[1]) : '';
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

function sectionBodyHtml(sectionHtml) {
  const m = sectionHtml.match(
    /<div class="m-interview-section__body">([\s\S]*?)<\/div>/
  );
  return m ? m[1] : sectionHtml;
}

function removeQuotesFromSection(sectionHtml) {
  return sectionHtml.replace(QUOTE_RE, '').replace(/\s+$/, '');
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

function insertQuotesAfterBody(sectionHtml, quotes) {
  if (quotes.length === 0) return sectionHtml;
  const cleaned = removeQuotesFromSection(sectionHtml);
  const end = closeIndexOfBodyDiv(cleaned);
  if (end === -1) return sectionHtml;
  const indent = cleaned.match(/\n( +)<div class="m-interview-section__body">/)?.[1] ?? '        ';
  const joined = quotes.map((q) => `${indent}${q}`).join('\n');
  return `${cleaned.slice(0, end)}\n${joined}${cleaned.slice(end)}`;
}

function removeStrayQuoteParagraphs(html) {
  return html.replace(/<p>&gt;\s*[^<]*<\/p>/g, '').replace(/<p>>\s*[^<]*<\/p>/g, '');
}

function relocateQuotesInHtml(html) {
  const quotes = [];
  let m;
  while ((m = QUOTE_RE.exec(html)) !== null) {
    quotes.push(m[0]);
  }
  if (quotes.length === 0) return { html, moved: 0 };

  let cleaned = html.replace(QUOTE_RE, '');
  cleaned = removeStrayQuoteParagraphs(cleaned);

  const sections = findSectionBounds(cleaned);
  const assignments = quotes.map((q) => ({
    quote: q,
    text: extractQuoteText(q),
    sectionIdx: -1,
    score: 0,
  }));

  for (const a of assignments) {
    for (let i = 0; i < sections.length; i++) {
      const body = sectionBodyHtml(sections[i].html);
      let score = quoteMatchScore(a.text, body);
      for (const answer of extractAnswerTexts(sections[i].html)) {
        const answerScore = quoteMatchScore(a.text, answer);
        if (answerScore > score) score = answerScore;
      }
      if (score > a.score) {
        a.score = score;
        a.sectionIdx = i;
      }
    }
  }

  const bySection = new Map();
  for (const a of assignments) {
    const idx = a.sectionIdx >= 0 ? a.sectionIdx : sections.length - 1;
    if (!bySection.has(idx)) bySection.set(idx, []);
    bySection.get(idx).push(a.quote);
  }

  let offset = 0;
  let updated = cleaned;
  let moved = 0;

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const toInsert = bySection.get(i);
    if (!toInsert?.length) continue;

    const pos = updated.indexOf(sec.html, offset);
    if (pos === -1) continue;

    const newSection = insertQuotesAfterBody(sec.html, toInsert);
    if (newSection !== sec.html) moved += toInsert.length;
    updated = updated.slice(0, pos) + newSection + updated.slice(pos + sec.html.length);
    offset = pos + newSection.length;
    sections[i] = { ...sec, html: newSection, end: pos + newSection.length };
  }

  return { html: updated, moved };
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const files = fs
    .readdirSync(HTML_DIR)
    .filter((f) => f.endsWith('.html') && f !== 'interview.css')
    .sort();

  for (const file of files) {
    const htmlPath = path.join(HTML_DIR, file);
    const before = fs.readFileSync(htmlPath, 'utf8');
    const { html, moved } = relocateQuotesInHtml(before);

    if (html !== before) {
      if (!dryRun) fs.writeFileSync(htmlPath, html, 'utf8');
      console.log(`${file.replace(/\.html$/, '')}: ${dryRun ? 'would-move' : 'moved'} ${moved} quote(s)`);
    } else {
      console.log(`${file.replace(/\.html$/, '')}: unchanged`);
    }
  }
}

main();
