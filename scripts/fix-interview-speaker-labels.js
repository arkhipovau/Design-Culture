/**
 * Normalize interview Q&A speaker labels to md-style initials (e.g. АП, ПЗ).
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const META = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/interviews-meta.json'), 'utf8'));
const HTML_DIR = path.join(ROOT, 'src/pages/interviews');

/** slug → display label (from md speaker codes) */
const LABEL = {
  'aleksey-pyankov': 'АП',
  'polina-zagumenova': 'ПЗ',
  'masha-chern': 'МЧ',
  'yulya-kondratyeva': 'ЮК',
  'yan-zaretsky': 'ЯЗ',
  'sergey-breus': 'СБ',
  'sergey-kudinov': 'СК',
  'anya-golub': 'АГ',
  'sasha-barabonova': 'СБ',
  'stefan-lashko': 'СЛ',
  'olya-bazanova': 'ОБ',
  'anastasia-sycheva': 'АС',
  'artem-gerts': 'АГ',
  'sergey-mekryukov': 'СМ',
  'gavril-perov': 'ГП',
  'elena-chinakova': 'ЕЧ',
  'andrey-maksimenkov': 'АМ',
  'dasha-makurina': 'ДМ',
  'nikita-petrov': 'НП',
  'maxim-aksenov': 'МА',
};

const TOGETHER = {
  Тарадаш: { title: 'Артём Тарадаш', label: 'АТд' },
  Тарасов: { title: 'Артём Тарасов', label: 'АТр' },
};

function fixGuestLabels(html, title, label) {
  return html.replace(
    /<span class="m-qa-row__name-label" title="(?!DF)[^"]*">[^<]+<\/span>/g,
    `<span class="m-qa-row__name-label" title="${title}">${label}</span>`
  );
}

function fixTogether(html) {
  let out = html;
  for (const [oldTitle, { title, label }] of Object.entries(TOGETHER)) {
    const re = new RegExp(
      `<span class="m-qa-row__name-label" title="${oldTitle}">[^<]+</span>`,
      'g'
    );
    out = out.replace(re, `<span class="m-qa-row__name-label" title="${title}">${label}</span>`);
  }
  return out;
}

function main() {
  const files = fs.readdirSync(HTML_DIR).filter((f) => f.endsWith('.html'));

  for (const file of files) {
    const slug = file.replace(/\.html$/, '');
    const filePath = path.join(HTML_DIR, file);
    const before = fs.readFileSync(filePath, 'utf8');
    let after = before;

    if (slug === 'togetherwithyou') {
      after = fixTogether(after);
    } else if (LABEL[slug] && META.interviews[slug]) {
      after = fixGuestLabels(after, META.interviews[slug].author, LABEL[slug]);
    }

    if (after !== before) {
      fs.writeFileSync(filePath, after, 'utf8');
      console.log(`updated: ${slug}`);
    }
  }
}

main();
