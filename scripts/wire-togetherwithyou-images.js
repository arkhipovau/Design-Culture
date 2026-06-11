#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const HTML = path.join(ROOT, 'src/pages/interviews/togetherwithyou.html');
const GALLERY = path.join(ROOT, 'src/pages/gallery-data.js');
const META = path.join(ROOT, 'content/interviews-meta.json');

let photoId = 0;

function figure(file, title, wide) {
  const id = photoId++;
  const wideClass = wide ? ' m-photo-slot--wide' : '';
  return `    <figure class="m-photo-slot${wideClass}" id="photo-togetherwithyou-${id}">
      <div class="m-photo-slot__image">
        <img src="../../images/interviews/togetherwithyou/${encodeURIComponent(file)}" alt="${title}" loading="lazy" decoding="async" />
      </div>
      <figcaption class="m-photo-slot__caption">
        <span class="m-photo-slot__title">${title}</span>
      </figcaption>
    </figure>`;
}

function row(files, title, opts) {
  const classes = ['m-photo-row'];
  if (opts && opts.equal) {
    classes.push('m-photo-row--equal');
    if (opts.ratio) classes.push(`m-photo-row--ratio-${opts.ratio}`);
  }
  return `    <div class="${classes.join(' ')}">\n${files.map((file) => figure(file, title, false)).join('\n')}\n    </div>`;
}

function renderBlocks(blocks) {
  return blocks
    .map((item) => {
      if (item.type === 'row') return row(item.files, item.title, item.opts);
      if (item.type === 'wide') return figure(item.file, item.title, true);
      throw new Error('Unknown block type');
    })
    .join('\n\n');
}

const placements = [
  {
    marker:
      '      <div class="m-interview-section">\n        <div class="m-interview-section__body">\n          <div class="m-qa-row m-qa-row--question">\n            <div class="m-qa-row__name"><span class="m-qa-row__name-label" title="DF">DF</span></div>\n            <div class="m-qa-row__answer"><p>Эти принципы',
    blocks: [
      {
        type: 'row',
        title: 'Biceps Grotesk',
        files: ['Biceps Grotesk.webp', 'Biceps Grotesk 2.webp'],
        opts: { equal: true, ratio: '2-3' },
      },
    ],
  },
  {
    marker:
      '      <div class="m-interview-section">\n        <div class="m-interview-section__body">\n          <div class="m-qa-row m-qa-row--question">\n            <div class="m-qa-row__name"><span class="m-qa-row__name-label" title="DF">DF</span></div>\n            <div class="m-qa-row__answer"><p>Хочется спросить про рутину.',
    blocks: [
      { type: 'wide', file: 'Arrival.webp', title: 'Arrival' },
      {
        type: 'row',
        title: 'Arrival',
        files: ['Arrival 3.webp', 'Arrival 4.webp'],
        opts: { equal: true, ratio: '2-3' },
      },
      {
        type: 'row',
        title: 'Arrival',
        files: ['Arrival 7.webp', 'Arrival 13.webp'],
        opts: { equal: true, ratio: '8-5' },
      },
    ],
  },
  {
    marker:
      '            <div class="m-qa-row__answer"><p>Ритуал «быть эффективным» – немного дурацкая тема. Кажется, всё должно быть в удовольствие в одной степени: кофеёк сделать, ужин приготовить, прогуляться, спортом заняться, дизайн поделать. Не «отдыхаю от одного, делая другое», и не «пойду похайпать, чтобы потом сделать дизайн».</p></div>\n            <div class="m-qa-row__spacer" aria-hidden="true"></div>\n          </div>',
    insertAfter: true,
    blocks: [
      {
        type: 'row',
        title: 'Äther',
        files: ['Ather.webp', 'Ather 2.webp'],
        opts: { equal: true, ratio: '8-5' },
      },
      {
        type: 'row',
        title: 'Äther',
        files: ['Ather 3.webp', 'Ather 4.webp'],
        opts: { equal: true, ratio: '8-5' },
      },
      {
        type: 'row',
        title: 'Äther',
        files: ['Ather 5.webp', 'Ather 6.webp'],
        opts: { equal: true, ratio: '8-5' },
      },
      { type: 'wide', file: 'Ather 7.webp', title: 'Äther' },
      {
        type: 'row',
        title: 'Äther',
        files: ['Ather 8.webp', 'Ather 9.webp'],
        opts: { equal: true, ratio: '8-5' },
      },
    ],
  },
  {
    marker:
      '      <div class="m-interview-section">\n        <div class="m-interview-section__body">\n          <div class="m-qa-row m-qa-row--question">\n            <div class="m-qa-row__name"><span class="m-qa-row__name-label" title="DF">DF</span></div>\n            <div class="m-qa-row__answer"><p>Зацепилась за энтропию.',
    blocks: [
      {
        type: 'row',
        title: 'Etoso',
        files: ['Etoso.webp', 'Etoso 2.webp'],
        opts: { equal: true, ratio: '2-3' },
      },
      { type: 'wide', file: 'Etoso 4.webp', title: 'Etoso' },
      {
        type: 'row',
        title: 'MARCO',
        files: ['MARCO.png', 'MARCO 2.webp'],
        opts: { equal: true, ratio: '2-3' },
      },
      { type: 'wide', file: 'MARCO 5.png', title: 'MARCO' },
      {
        type: 'row',
        title: 'Silk &amp; Silk Road',
        files: ['Silk & Silk Road.png', 'Silk & Silk Road 5.webp'],
        opts: { equal: true, ratio: '2-3' },
      },
      { type: 'wide', file: 'Silk & Silk Road 2.webp', title: 'Silk &amp; Silk Road' },
      { type: 'wide', file: 'Silk & Silk Road 3.webp', title: 'Silk &amp; Silk Road' },
    ],
  },
  {
    marker: '      <section class="m-article-info section">',
    blocks: [
      { type: 'wide', file: 'Eleganza 2.webp', title: 'Eleganza' },
      {
        type: 'row',
        title: 'Eleganza',
        files: ['Eleganza 1.webp', 'Ather 10.webp'],
        opts: { equal: true, ratio: '2-3' },
      },
      { type: 'wide', file: 'Arrival 6.webp', title: 'Arrival' },
      {
        type: 'row',
        title: 'Arrival',
        files: ['Arrival 8.webp', 'Arrival 9.webp'],
        opts: { equal: true, ratio: '2-3' },
      },
      {
        type: 'row',
        title: 'Arrival',
        files: ['Arrival 5.webp', 'Arrival 12.webp'],
        opts: { equal: true, ratio: '2-3' },
      },
      { type: 'wide', file: 'Arrival 10.webp', title: 'Arrival' },
      { type: 'wide', file: 'Arrival 11.webp', title: 'Arrival' },
      { type: 'wide', file: 'Arrival 2.webp', title: 'Arrival' },
      { type: 'wide', file: 'Ather 11.webp', title: 'Äther' },
      { type: 'wide', file: 'Etoso 5.webp', title: 'Etoso' },
      { type: 'wide', file: 'Etoso 3.webp', title: 'Etoso' },
    ],
  },
];

function stripPhotos(html) {
  return html
    .replace(/    <div class="m-photo-row[\s\S]*?<\/div>\n\n/g, '')
    .replace(/    <figure class="m-photo-slot[\s\S]*?<\/figure>\n\n/g, '');
}

function applyPlacements(html) {
  photoId = 0;
  let out = stripPhotos(html);
  for (const placement of placements) {
    const insertHtml = '\n' + renderBlocks(placement.blocks) + '\n\n';
    if (!out.includes(placement.marker)) {
      throw new Error('Marker not found');
    }
    out = placement.insertAfter
      ? out.replace(placement.marker, placement.marker + insertHtml)
      : out.replace(placement.marker, insertHtml + placement.marker);
  }
  return out;
}

function rebuildGalleryIds(html) {
  const items = [];
  const re =
    /<figure class="m-photo-slot[^"]*" id="photo-togetherwithyou-(\d+)">[\s\S]*?<img src="([^"]+)"[\s\S]*?<span class="m-photo-slot__title">([^<]*)<\/span>/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    items.push({ id: Number(match[1]), src: match[2], title: match[3] });
  }
  return items;
}

function updateGallery(items) {
  let js = fs.readFileSync(GALLERY, 'utf8');
  const entries = items
    .map(
      (item) => `    {
      "src": "${item.src.replace('../../images/', '../images/')}",
      "author": "Артём Тарасов и Артём Тарадаш",
      "project": "${item.title.replace(/"/g, '\\"')}",
      "subtitle": "Мир постдизайна",
      "href": "./interviews/togetherwithyou.html#photo-togetherwithyou-${item.id}"
    }`
    )
    .join(',\n');

  js = js.replace(
    /    \{\n      "src": "\.\.\/images\/[^"]+",\n      "author": "Артём Тарасов и Артём Тарадаш",[\s\S]*?\},\n    \{\n      "src": "\.\.\/images\/07fe256693582605e691\.webp"/,
    entries + ',\n    {\n      "src": "../images/07fe256693582605e691.webp"'
  );

  fs.writeFileSync(GALLERY, js);
}

function updateMeta(items) {
  const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
  if (!meta.interviews.togetherwithyou) {
    meta.interviews.togetherwithyou = {};
  }
  meta.interviews.togetherwithyou.images = items.map((item) => ({
    src: item.src.replace('../../images/', '../images/'),
    title: item.title,
  }));
  fs.writeFileSync(META, JSON.stringify(meta, null, 2) + '\n');
}

function main() {
  const html = applyPlacements(fs.readFileSync(HTML, 'utf8'));
  fs.writeFileSync(HTML, html);
  const items = rebuildGalleryIds(html);
  updateGallery(items);
  updateMeta(items);
  console.log(`Wired togetherwithyou: ${items.length} photos`);
}

main();
