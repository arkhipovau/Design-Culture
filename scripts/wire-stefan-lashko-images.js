#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const HTML = path.join(ROOT, 'src/pages/interviews/stefan-lashko.html');
const META = path.join(ROOT, 'content/interviews-meta.json');
const GALLERY = path.join(ROOT, 'src/pages/gallery-data.js');
const IMG_DIR = path.join(ROOT, 'src/images/interviews/stefan-lashko');

const BASE = '../../images/interviews/stefan-lashko/';

function fileName(match) {
  const files = fs.readdirSync(IMG_DIR);
  const hit = files.find((f) => f.normalize('NFC') === match.normalize('NFC') || f === match);
  if (!hit) throw new Error(`Missing image: ${match}`);
  return hit;
}

function enc(file) {
  return encodeURIComponent(file);
}

function slot(id, file, title, wide) {
  const wideClass = wide ? ' m-photo-slot--wide' : '';
  const src = BASE + enc(fileName(file));
  return `          <figure class="m-photo-slot${wideClass}" id="photo-stefan-lashko-${id}">
            <div class="m-photo-slot__image">
              <img src="${src}" alt="${title}" loading="lazy" decoding="async" />
            </div>
            <figcaption class="m-photo-slot__caption">
              <span class="m-photo-slot__title">${title}</span>
            </figcaption>
          </figure>`;
}

function row(items) {
  return `          <div class="m-photo-row">\n${items
    .map(([id, file, title]) => slot(id, file, title))
    .join('\n')}\n          </div>`;
}

const SOVREMENNIK = [
  row([
    [0, 'Современник 1.jpg', 'Современник'],
    [1, 'Современник 2.jpg', 'Современник'],
  ]),
  row([
    [2, 'Современник 3.webp', 'Современник'],
    [3, 'Современник 4.webp', 'Современник'],
  ]),
  row([
    [4, 'Современник 5.webp', 'Современник'],
    [5, 'Современник 6.webp', 'Современник'],
  ]),
].join('\n\n');

const RICHTER = [
  row([
    [6, 'Рихтер.jpg', 'Рихтер'],
    [7, 'Рихтер 2.jpg', 'Рихтер'],
  ]),
  row([
    [8, 'Рихтер 3.jpg', 'Рихтер'],
    [9, 'Рихтер 4.jpg', 'Рихтер'],
  ]),
  slot(10, 'Рихтер 7.webp', 'Рихтер', true),
  row([
    [11, 'Рихтер 5.webp', 'Рихтер'],
    [12, 'Рихтер 6.webp', 'Рихтер'],
  ]),
].join('\n\n');

const YOUNG = [
  row([
    [13, 'Young&&Yandex.webp', 'Young&&Yandex'],
    [14, 'Young&&Yandex 2.webp', 'Young&&Yandex'],
  ]),
  row([
    [15, 'Young&&Yandex 3.webp', 'Young&&Yandex'],
    [16, 'Young&&Yandex 4.webp', 'Young&&Yandex'],
  ]),
].join('\n\n');

const RENT = [
  row([
    [17, 'Yandex Rent.webp', 'Yandex Rent'],
    [18, 'Yandex Rent 2.webp', 'Yandex Rent'],
  ]),
  row([
    [19, 'Yandex Rent 3.webp', 'Yandex Rent'],
    [20, 'Yandex Rent 4.webp', 'Yandex Rent'],
  ]),
].join('\n\n');

const JENEK = [
  slot(21, 'Jenëk.webp', 'Jenëk', true),
  row([
    [22, 'Jenëk 2.webp', 'Jenëk'],
    [23, 'Jenëk 3.webp', 'Jenëk'],
  ]),
].join('\n\n');

const ALL_IMAGES = [
  ['Современник 1.jpg', 'Современник'],
  ['Современник 2.jpg', 'Современник'],
  ['Современник 3.webp', 'Современник'],
  ['Современник 4.webp', 'Современник'],
  ['Современник 5.webp', 'Современник'],
  ['Современник 6.webp', 'Современник'],
  ['Рихтер.jpg', 'Рихтер'],
  ['Рихтер 2.jpg', 'Рихтер'],
  ['Рихтер 3.jpg', 'Рихтер'],
  ['Рихтер 4.jpg', 'Рихтер'],
  ['Рихтер 7.webp', 'Рихтер'],
  ['Рихтер 5.webp', 'Рихтер'],
  ['Рихтер 6.webp', 'Рихтер'],
  ['Young&&Yandex.webp', 'Young&&Yandex'],
  ['Young&&Yandex 2.webp', 'Young&&Yandex'],
  ['Young&&Yandex 3.webp', 'Young&&Yandex'],
  ['Young&&Yandex 4.webp', 'Young&&Yandex'],
  ['Yandex Rent.webp', 'Yandex Rent'],
  ['Yandex Rent 2.webp', 'Yandex Rent'],
  ['Yandex Rent 3.webp', 'Yandex Rent'],
  ['Yandex Rent 4.webp', 'Yandex Rent'],
  ['Jenëk.webp', 'Jenëk'],
  ['Jenëk 2.webp', 'Jenëk'],
  ['Jenëk 3.webp', 'Jenëk'],
];

function replaceRegion(html, startId, endId, newHtml) {
  const re = new RegExp(
    `[\\s\\S]*?<figure class="m-photo-slot[^"]*" id="photo-stefan-lashko-${endId}">[\\s\\S]*?<\\/figure>\\n`,
    'm'
  );
  const startRe = new RegExp(
    `([\\s\\S]*?<figure class="m-photo-slot[^"]*" id="photo-stefan-lashko-${startId}">)`
  );
  const match = html.match(
    new RegExp(
      `(\\s*<(?:div class="m-photo-row(?: m-photo-row--three)?"|figure class="m-photo-slot)[^>]*>[\\s\\S]*?id="photo-stefan-lashko-${startId}"[\\s\\S]*?id="photo-stefan-lashko-${endId}"[\\s\\S]*?</(?:div|figure)>\\s*(?:</div>\\s*)?)`,
      'm'
    )
  );
  if (!match) throw new Error(`Region ${startId}-${endId} not found`);
  return html.replace(match[0], `\n${newHtml}\n      \n`);
}

function wireHtml(html) {
  let next = html;

  next = replaceRegion(next, 0, 1, SOVREMENNIK);

  next = replaceRegion(next, 2, 5, RICHTER);

  const practicesEnd =
    '                </div>\n              </div>\n            </div>\n      \n            <div class="m-interview-section">\n              <div class="m-interview-section__body">\n                <div class="m-qa-row">\n                  <div class="m-qa-row__name"><span class="m-qa-row__name-label" title="Стефан Лашко">СЛ</span></div>\n                  <div class="m-qa-row__answer"><p>При этом в студии';
  if (!next.includes(practicesEnd)) throw new Error('Practices boundary not found');
  next = next.replace(practicesEnd, `                </div>\n              </div>\n            </div>\n      \n${YOUNG}\n      \n            <div class="m-interview-section">\n              <div class="m-interview-section__body">\n                <div class="m-qa-row">\n                  <div class="m-qa-row__name"><span class="m-qa-row__name-label" title="Стефан Лашко">СЛ</span></div>\n                  <div class="m-qa-row__answer"><p>При этом в студии`);

  const studioEnd =
    '                </div>\n              </div>\n            </div>\n      \n            <div class="m-interview-section">\n              <div class="m-interview-section__body">\n                <div class="m-qa-row m-qa-row--question">\n                  <div class="m-qa-row__name"><span class="m-qa-row__name-label" title="DF">DF</span></div>\n                  <div class="m-qa-row__answer"><p>Что вы в команде считаете качеством?';
  if (!next.includes(studioEnd)) throw new Error('Studio boundary not found');
  next = next.replace(studioEnd, `                </div>\n              </div>\n            </div>\n      \n${RENT}\n      \n            <div class="m-interview-section">\n              <div class="m-interview-section__body">\n                <div class="m-qa-row m-qa-row--question">\n                  <div class="m-qa-row__name"><span class="m-qa-row__name-label" title="DF">DF</span></div>\n                  <div class="m-qa-row__answer"><p>Что вы в команде считаете качеством?`);

  const placeholderRe =
    /\s*<figure class="m-photo-slot m-photo-slot--placeholder m-photo-slot--wide" id="photo-stefan-lashko-6">[\s\S]*?<\/figure>\n/;
  if (!placeholderRe.test(next)) throw new Error('Placeholder not found');
  next = next.replace(placeholderRe, `\n${JENEK}\n      \n`);

  return next;
}

function updateMeta() {
  const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
  meta.interviews['stefan-lashko'].images = ALL_IMAGES.map(([file, title]) => ({
    src: `../images/interviews/stefan-lashko/${enc(fileName(file))}`,
    title,
  }));
  fs.writeFileSync(META, JSON.stringify(meta, null, 2) + '\n');
}

function updateGallery() {
  let js = fs.readFileSync(GALLERY, 'utf8');
  const entries = ALL_IMAGES.map(([file, project], index) => {
    return `    {
      "src": "../images/interviews/stefan-lashko/${enc(fileName(file))}",
      "author": "Стефан Лашко",
      "project": "${project}",
      "subtitle": "Порядок из хаоса",
      "href": "./interviews/stefan-lashko.html#photo-stefan-lashko-${index}"
    }`;
  }).join(',\n');

  if (js.includes('photo-stefan-lashko-23')) {
    js = js.replace(
      /    \{\n      "src": "\.\.\/images\/interviews\/stefan-lashko\/[^"]+",[\s\S]*?#photo-stefan-lashko-23"\n    \},/,
      entries + ','
    );
  } else {
    js = js.replace(
      /    \{\n      "src": "\.\.\/images\/[^"]+",\n      "author": "Стефан Лашко",[\s\S]*?#photo-stefan-lashko-5"\n    \},/,
      entries + ','
    );
  }
  fs.writeFileSync(GALLERY, js);
}

function main() {
  const html = fs.readFileSync(HTML, 'utf8');
  fs.writeFileSync(HTML, wireHtml(html));
  updateMeta();
  updateGallery();
  console.log('Wired stefan-lashko: 24 images in 5 blocks');
}

main();
