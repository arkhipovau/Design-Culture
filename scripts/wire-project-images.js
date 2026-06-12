#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const INTERVIEWS = path.join(ROOT, 'src/pages/interviews');

function slotImg(slug, id, src, alt, title) {
  return `        <figure class="m-photo-slot" id="photo-${slug}-${id}">
          <div class="m-photo-slot__image">
            <img src="../../images/${src}" alt="${alt}" loading="lazy" decoding="async" />
          </div>
          <figcaption class="m-photo-slot__caption">
            <span class="m-photo-slot__title">${title}</span>
          </figcaption>
        </figure>`;
}

function wideSlot(slug, id, src, alt, title) {
  return `    <figure class="m-photo-slot m-photo-slot--wide" id="photo-${slug}-${id}">
      <div class="m-photo-slot__image">
        <img src="../../images/${src}" alt="${alt}" loading="lazy" decoding="async" />
      </div>
      <figcaption class="m-photo-slot__caption">
        <span class="m-photo-slot__title">${title}</span>
      </figcaption>
    </figure>`;
}

function replaceFigureById(html, slug, id, figureHtml) {
  const re = new RegExp(
    `<figure class="m-photo-slot[^"]*" id="photo-${slug}-${id}">[\\s\\S]*?<\\/figure>`,
    'm'
  );
  if (!re.test(html)) {
    throw new Error(`Figure photo-${slug}-${id} not found`);
  }
  return html.replace(re, figureHtml.trim());
}

function insertAfterFigure(html, slug, afterId, newHtml) {
  const re = new RegExp(
    `(<figure class="m-photo-slot[^"]*" id="photo-${slug}-${afterId}">[\\s\\S]*?<\\/figure>)`,
    'm'
  );
  if (!re.test(html)) {
    throw new Error(`Figure photo-${slug}-${afterId} not found for insert`);
  }
  return html.replace(re, `$1\n\n${newHtml.trim()}`);
}

function wireKudinov(html) {
  const slots = [
    [0, 'sergey-kudinov-simulators.jpg', 'Яндекс Практикум — симуляторы', 'Яндекс Практикум'],
    [1, 'sergey-kudinov-practicum-brand.png', 'Яндекс Практикум — брендинг', 'Яндекс Практикум'],
    [2, 'sergey-kudinov-practicum-wide.jpg', 'Яндекс Практикум — интерфейс', 'Яндекс Практикум', true],
    [3, 'sergey-kudinov-music.jpg', 'Яндекс Музыка — лендинг', 'Яндекс Музыка'],
    [4, 'sergey-kudinov-music-mobile.jpg', 'Яндекс Музыка — мобильное приложение', 'Яндекс Музыка'],
    [5, 'sergey-kudinov-browser.jpg', 'Яндекс Браузер', 'Яндекс Браузер'],
    [6, 'sergey-kudinov-works.jpg', 'Yandex Games — работы 2023–2025', 'Yandex Games', true],
  ];
  for (const [id, src, alt, title, wide] of slots) {
    const fig = wide
      ? wideSlot('sergey-kudinov', id, src, alt, title)
      : slotImg('sergey-kudinov', id, src, alt, title);
    html = replaceFigureById(html, 'sergey-kudinov', id, fig);
  }
  return html;
}

function wireAnastasia(html) {
  const slots = [
    [0, 'anastasia-sycheva-lancer.png', 'Lancer', 'Lancer'],
    [1, 'anastasia-sycheva-lancer-02.png', 'Lancer', 'Lancer'],
    [2, 'anastasia-sycheva-southleap.png', 'Southleap', 'Southleap', true],
    [3, 'anastasia-sycheva-noxus.png', 'Noxus', 'Noxus'],
    [4, 'anastasia-sycheva-noxus-02.png', 'Noxus', 'Noxus'],
    [5, 'anastasia-sycheva-noxus-03.png', 'Noxus', 'Noxus'],
  ];
  for (const [id, src, alt, title, wide] of slots) {
    const fig = wide
      ? wideSlot('anastasia-sycheva', id, src, alt, title)
      : slotImg('anastasia-sycheva', id, src, alt, title);
    html = replaceFigureById(html, 'anastasia-sycheva', id, fig);
  }

  const elementorSlot = wideSlot('anastasia-sycheva', 7, 'anastasia-sycheva-elementor.png', 'Elementor', 'Elementor');
  const basicCapitalRow = `
    <div class="m-photo-row">
${slotImg('anastasia-sycheva', 8, 'anastasia-sycheva-basic-capital.png', 'Basic Capital', 'Basic Capital')}
${slotImg('anastasia-sycheva', 9, 'anastasia-sycheva-basic-capital-02.png', 'Basic Capital', 'Basic Capital')}
    </div>`;

  if (!html.includes('photo-anastasia-sycheva-7')) {
    const brandingAnchor = /(Её мы будем транслировать в первую очередь\.<\/p><\/div>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/;
    if (!brandingAnchor.test(html)) {
      throw new Error('Anastasia branding section not found for Elementor insert');
    }
    html = html.replace(brandingAnchor, `$1\n\n${elementorSlot.trim()}`);
  }

  if (!html.includes('photo-anastasia-sycheva-8')) {
    const quoteAnchor = /(<blockquote class="m-quote-block">[\s\S]*?<\/blockquote>\s*<\/div>)/;
    if (!quoteAnchor.test(html)) {
      throw new Error('Anastasia quote block not found for Basic Capital insert');
    }
    html = html.replace(quoteAnchor, `$1\n\n${basicCapitalRow.trim()}`);
  }
  return html;
}

function wireYan(html) {
  const slots = [
    [0, 'yan-zaretsky-aspekt-pack.png', 'Аспект — комплект технологических карт', 'Аспект'],
    [1, 'yan-zaretsky-aspekt-spine.png', 'Аспект — переплёт с красными нитками', 'Аспект'],
    [2, 'yan-zaretsky-aspekt-spread.png', 'Аспект — технология и эскизы', 'Аспект', true],
    [3, 'yan-zaretsky-grad-04.png', 'Град — корреляционная схема', 'Град'],
    [4, 'yan-zaretsky-spb-digest.png', 'St.Petersburg Digest', 'St.Petersburg Digest'],
    [5, 'yan-zaretsky-nwcc-barista-journal.png', 'Северо-Западная Кофейная Компания — Barista Journal', 'Северо-Западная Кофейная Компания'],
    [6, 'yan-zaretsky-spb-digest-02.png', 'St.Petersburg Digest', 'St.Petersburg Digest', true],
  ];
  for (const [id, src, alt, title, wide] of slots) {
    const fig = wide
      ? wideSlot('yan-zaretsky', id, src, alt, title)
      : slotImg('yan-zaretsky', id, src, alt, title);
    html = replaceFigureById(html, 'yan-zaretsky', id, fig);
  }

  if (!html.includes('photo-yan-zaretsky-9')) {
    html = insertAfterFigure(
      html,
      'yan-zaretsky',
      2,
      wideSlot('yan-zaretsky', 9, 'yan-zaretsky-aspekt-guide.png', 'Аспект — инструкция и оглавление', 'Аспект')
    );
  }

  if (!html.includes('photo-yan-zaretsky-10')) {
    const gradBlock = `
    <div class="m-photo-row">
${slotImg('yan-zaretsky', 10, 'yan-zaretsky-grad.png', 'Град — онтологическая модель', 'Град')}
${slotImg('yan-zaretsky', 11, 'yan-zaretsky-grad-02.png', 'Град — 2D вид скважин', 'Град')}
    </div>

${wideSlot('yan-zaretsky', 12, 'yan-zaretsky-grad-03.png', 'Град — карта пористости', 'Град')}`;
    html = html.replace(
      /(    <div class="m-photo-row m-photo-row--three">\s*<figure class="m-photo-slot" id="photo-yan-zaretsky-3">)/m,
      `${gradBlock}\n\n$1`
    );
  }

  if (!html.includes('photo-yan-zaretsky-7')) {
    const nwccBlock = `
${wideSlot('yan-zaretsky', 7, 'yan-zaretsky-nwcc-brewing-guides.png', 'Северо-Западная Кофейная Компания — руководства по завариванию', 'Северо-Западная Кофейная Компания')}

${wideSlot('yan-zaretsky', 8, 'yan-zaretsky-nwcc-website.png', 'Северо-Западная Кофейная Компания — сайт', 'Северо-Западная Кофейная Компания')}`;
    html = insertAfterFigure(html, 'yan-zaretsky', 5, nwccBlock);
  }

  return html;
}

function updateGalleryData() {
  const fp = path.join(ROOT, 'src/pages/gallery-data.js');
  let js = fs.readFileSync(fp, 'utf8');

  const kudinovEntries = [
    ['sergey-kudinov-simulators.jpg', 'Яндекс Практикум', 0],
    ['sergey-kudinov-practicum-brand.png', 'Яндекс Практикум', 1],
    ['sergey-kudinov-practicum-wide.jpg', 'Яндекс Практикум', 2],
    ['sergey-kudinov-music.jpg', 'Яндекс Музыка', 3],
    ['sergey-kudinov-music-mobile.jpg', 'Яндекс Музыка', 4],
    ['sergey-kudinov-browser.jpg', 'Яндекс Браузер', 5],
    ['sergey-kudinov-works.jpg', 'Yandex Games', 6],
  ]
    .map(
      ([src, project, i]) => `    {
      "src": "../images/${src}",
      "author": "Сергей Кудинов",
      "project": "${project}",
      "subtitle": "Культура или симулятор",
      "href": "./interviews/sergey-kudinov.html#photo-sergey-kudinov-${i}"
    }`
    )
    .join(',\n');

  js = js.replace(
    /    \{\n      "src": "\.\.\/images\/[^"]+",\n      "author": "Сергей Кудинов",[\s\S]*?#photo-sergey-kudinov-6"\n    \},/,
    kudinovEntries + ','
  );

  const anastasiaEntries = [
    ['anastasia-sycheva-lancer.png', 'Lancer', 0],
    ['anastasia-sycheva-lancer-02.png', 'Lancer', 1],
    ['anastasia-sycheva-southleap.png', 'Southleap', 2],
    ['anastasia-sycheva-noxus.png', 'Noxus', 3],
    ['anastasia-sycheva-noxus-02.png', 'Noxus', 4],
    ['anastasia-sycheva-noxus-03.png', 'Noxus', 5],
    ['anastasia-sycheva-elementor.png', 'Elementor', 7],
    ['anastasia-sycheva-basic-capital.png', 'Basic Capital', 8],
    ['anastasia-sycheva-basic-capital-02.png', 'Basic Capital', 9],
  ]
    .map(
      ([src, project, i]) => `    {
      "src": "../images/${src}",
      "author": "Анастасия Сычева",
      "project": "${project}",
      "subtitle": "AI как краска",
      "href": "./interviews/anastasia-sycheva.html#photo-anastasia-sycheva-${i}"
    }`
    )
    .join(',\n');

  js = js.replace(
    /    \{\n      "src": "\.\.\/images\/[^"]+",\n      "author": "Анастасия Сычева",[\s\S]*?#photo-anastasia-sycheva-5"\n    \}/,
    anastasiaEntries
  );

  const yanEntries = [
    ['yan-zaretsky-aspekt-pack.png', 'Аспект', 0],
    ['yan-zaretsky-aspekt-spine.png', 'Аспект', 1],
    ['yan-zaretsky-aspekt-spread.png', 'Аспект', 2],
    ['yan-zaretsky-grad-04.png', 'Град', 3],
    ['yan-zaretsky-spb-digest.png', 'St.Petersburg Digest', 4],
    ['yan-zaretsky-nwcc-barista-journal.png', 'Северо-Западная Кофейная Компания', 5],
    ['yan-zaretsky-spb-digest-02.png', 'St.Petersburg Digest', 6],
    ['yan-zaretsky-nwcc-brewing-guides.png', 'Северо-Западная Кофейная Компания', 7],
    ['yan-zaretsky-nwcc-website.png', 'Северо-Западная Кофейная Компания', 8],
    ['yan-zaretsky-aspekt-guide.png', 'Аспект', 9],
    ['yan-zaretsky-grad.png', 'Град', 10],
    ['yan-zaretsky-grad-02.png', 'Град', 11],
    ['yan-zaretsky-grad-03.png', 'Град', 12],
  ]
    .map(
      ([src, project, i]) => `    {
      "src": "../images/${src}",
      "author": "Ян Зарецкий",
      "project": "${project}",
      "subtitle": "Генотип и фенотип",
      "href": "./interviews/yan-zaretsky.html#photo-yan-zaretsky-${i}"
    }`
    )
    .join(',\n');

  js = js.replace(
    /    \{\n      "src": "\.\.\/images\/[^"]+",\n      "author": "Ян Зарецкий",[\s\S]*?#photo-yan-zaretsky-6"\n    \}/,
    yanEntries
  );

  fs.writeFileSync(fp, js);
}

function updateMeta() {
  const fp = path.join(ROOT, 'content/interviews-meta.json');
  const meta = JSON.parse(fs.readFileSync(fp, 'utf8'));

  meta.interviews['sergey-kudinov'].images = [
    { src: '../images/sergey-kudinov-simulators.jpg', title: 'Яндекс Практикум' },
    { src: '../images/sergey-kudinov-practicum-brand.png', title: 'Яндекс Практикум' },
    { src: '../images/sergey-kudinov-practicum-wide.jpg', title: 'Яндекс Практикум' },
    { src: '../images/sergey-kudinov-music.jpg', title: 'Яндекс Музыка' },
    { src: '../images/sergey-kudinov-music-mobile.jpg', title: 'Яндекс Музыка' },
    { src: '../images/sergey-kudinov-browser.jpg', title: 'Яндекс Браузер' },
    { src: '../images/sergey-kudinov-works.jpg', title: 'Yandex Games' },
  ];

  meta.interviews['anastasia-sycheva'].images = [
    { src: '../images/anastasia-sycheva-lancer.png', title: 'Lancer' },
    { src: '../images/anastasia-sycheva-lancer-02.png', title: 'Lancer' },
    { src: '../images/anastasia-sycheva-southleap.png', title: 'Southleap' },
    { src: '../images/anastasia-sycheva-noxus.png', title: 'Noxus' },
    { src: '../images/anastasia-sycheva-noxus-02.png', title: 'Noxus' },
    { src: '../images/anastasia-sycheva-noxus-03.png', title: 'Noxus' },
    { src: '../images/anastasia-sycheva-elementor.png', title: 'Elementor' },
    { src: '../images/anastasia-sycheva-basic-capital.png', title: 'Basic Capital' },
    { src: '../images/anastasia-sycheva-basic-capital-02.png', title: 'Basic Capital' },
  ];

  meta.interviews['yan-zaretsky'].images = [
    { src: '../images/yan-zaretsky-aspekt-pack.png', title: 'Аспект' },
    { src: '../images/yan-zaretsky-aspekt-spine.png', title: 'Аспект' },
    { src: '../images/yan-zaretsky-aspekt-spread.png', title: 'Аспект' },
    { src: '../images/yan-zaretsky-grad-04.png', title: 'Град' },
    { src: '../images/yan-zaretsky-spb-digest.png', title: 'St.Petersburg Digest' },
    { src: '../images/yan-zaretsky-nwcc-barista-journal.png', title: 'Северо-Западная Кофейная Компания' },
    { src: '../images/yan-zaretsky-spb-digest-02.png', title: 'St.Petersburg Digest' },
    { src: '../images/yan-zaretsky-nwcc-brewing-guides.png', title: 'Северо-Западная Кофейная Компания' },
    { src: '../images/yan-zaretsky-nwcc-website.png', title: 'Северо-Западная Кофейная Компания' },
    { src: '../images/yan-zaretsky-aspekt-guide.png', title: 'Аспект' },
    { src: '../images/yan-zaretsky-grad.png', title: 'Град' },
    { src: '../images/yan-zaretsky-grad-02.png', title: 'Град' },
    { src: '../images/yan-zaretsky-grad-03.png', title: 'Град' },
  ];

  fs.writeFileSync(fp, JSON.stringify(meta, null, 2) + '\n');
}

function main() {
  for (const [slug, wire] of [
    ['sergey-kudinov', wireKudinov],
    ['anastasia-sycheva', wireAnastasia],
    ['yan-zaretsky', wireYan],
  ]) {
    const fp = path.join(INTERVIEWS, `${slug}.html`);
    const next = wire(fs.readFileSync(fp, 'utf8'));
    fs.writeFileSync(fp, next);
    console.log('Wired:', slug);
  }
  updateGalleryData();
  updateMeta();
  console.log('Updated gallery-data.js and interviews-meta.json');
}

main();
