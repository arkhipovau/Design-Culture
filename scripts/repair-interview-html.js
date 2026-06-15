#!/usr/bin/env node
/**
 * Repair interview HTML broken when photos were wired (commit 701a056).
 * Restores body from f6cb4e0, re-applies photo/video blocks from current file,
 * syncs Q&A text from markdown, keeps preview-lock + current hero titles.
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const HTML_DIR = path.join(ROOT, 'src/pages/interviews');
const CLEAN_COMMIT = 'f6cb4e0';

const SLUGS = [
  'masha-chern',
  'sergey-mekryukov',
  'dariia-chertanova',
  'sergey-breus',
];

function findClosingDiv(html, start) {
  const openEnd = html.indexOf('>', start);
  if (openEnd === -1) throw new Error('Malformed div');
  let depth = 1;
  let pos = openEnd + 1;
  while (depth > 0 && pos < html.length) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);
    if (nextClose === -1) throw new Error('Unclosed div');
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      pos = nextOpen + 4;
    } else {
      depth -= 1;
      pos = nextClose + 6;
    }
  }
  return pos;
}

const PHOTO_BLOCK_RE =
  /(?:\s*<div class="m-photo-row[^"]*">[\s\S]*?<\/div>|\s*<figure class="m-photo-slot[\s\S]*?<\/figure>)/g;

function gitShow(commit, filePath) {
  const result = spawnSync('git', ['show', `${commit}:${filePath}`], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`git show failed for ${commit}:${filePath}\n${result.stderr}`);
  }
  return result.stdout;
}

function extractBody(html) {
  const match = html.match(
    /<div class="o-interview-body a-section">([\s\S]*?)<div class="o-interview-footer">/,
  );
  if (!match) throw new Error('o-interview-body block not found');
  return match[1];
}

function extractFooter(html) {
  const match = html.match(/<div class="o-interview-footer">[\s\S]*?<\/main>/);
  if (!match) throw new Error('o-interview-footer block not found');
  return match[0].replace(/<div class="o-interview-footer">\s*<div class="o-interview-footer">/, '<div class="o-interview-footer">').replace(/<\/main>$/, '');
}

function extractHero(html) {
  const match = html.match(/<section class="o-interview-hero[\s\S]*?<\/section>/);
  if (!match) throw new Error('o-interview-hero block not found');
  return match[0];
}

function extractPhotoBlocks(body) {
  const blocks = [];
  let i = 0;
  while (i < body.length) {
    const rowStart = body.indexOf('<div class="m-photo-row', i);
    const figureStart = body.indexOf('<figure class="m-photo-slot', i);
    if (rowStart === -1 && figureStart === -1) break;

    const useRow = rowStart !== -1 && (figureStart === -1 || rowStart < figureStart);
    if (useRow) {
      const end = findClosingDiv(body, rowStart);
      blocks.push(body.slice(rowStart, end).trim());
      i = end;
    } else {
      const end = body.indexOf('</figure>', figureStart) + '</figure>'.length;
      blocks.push(body.slice(figureStart, end).trim());
      i = end;
    }
  }
  return blocks;
}

function stripPhotoBlocks(body) {
  let out = body;
  const blocks = extractPhotoBlocks(body);
  for (const block of [...blocks].reverse()) {
    out = out.replace(block, '');
  }
  return out.replace(/\n{3,}/g, '\n\n');
}

function replacePhotoBlocks(cleanBody, photoBlocks) {
  const placeholders = extractPhotoBlocks(cleanBody);
  if (placeholders.length !== photoBlocks.length) {
    throw new Error(
      `Photo count mismatch: clean=${placeholders.length} source=${photoBlocks.length}`,
    );
  }
  let out = cleanBody;
  for (let i = 0; i < placeholders.length; i++) {
    out = out.replace(placeholders[i], photoBlocks[i]);
  }
  return out;
}
function insertAfterNeedle(body, needle, block) {
  const idx = body.indexOf(needle);
  if (idx === -1) {
    throw new Error(`Anchor not found: ${needle.slice(0, 80)}…`);
  }
  const pos = idx + needle.length;
  return `${body.slice(0, pos)}\n\n${block}\n${body.slice(pos)}`;
}

function insertBeforeNeedle(body, needle, block) {
  const idx = body.indexOf(needle);
  if (idx === -1) {
    throw new Error(`Anchor not found: ${needle.slice(0, 80)}…`);
  }
  return `${body.slice(0, idx)}\n\n${block}\n\n${body.slice(idx)}`;
}

function speakerRow(name, initials, inner) {
  return `<div class="m-qa-row">
                  <div class="m-qa-row__name"><span class="m-qa-row__name-label" title="${name}">${initials}</span></div>
                  <div class="m-qa-row__answer">${inner}</div>
                  <div class="m-qa-row__spacer" aria-hidden="true"></div>
                </div>`;
}

const PHOTO_REPLACE_SLUGS = new Set(['sergey-breus']);

const INSERTIONS = {
  'masha-chern': (body, photos) => {
    let out = body;

    out = insertAfterNeedle(
      out,
      'супер крутых проектов.</p></div>\n                  <div class="m-qa-row__spacer" aria-hidden="true"></div>\n                </div>\n              </div>\n            </div>',
      `\n      \n          ${photos[0]}`,
    );

    const expoSplitRe =
      /(<p>Так мы сделали проект для Expo\.)( Это очень крупная[\s\S]*?Были совсем не такими, как все\.)( Это очень классно сработало и привлекло нужную нам аудиторию\.)(<\/p>)/;
    if (!expoSplitRe.test(out)) throw new Error('masha-chern: Expo paragraph not found');
    out = out.replace(expoSplitRe, (_match, _g1, middle, ending) =>
      `<p>Так мы сделали проект для Expo.</p></div>
                  <div class="m-qa-row__spacer" aria-hidden="true"></div>
                </div>
      
${photos[1]}
      
${speakerRow('Маша Черн', 'МЧ', `<p>${middle.trim()}</p>`)}
      
${photos[2]}
      
${speakerRow('Маша Черн', 'МЧ', `<p>${ending.trim()}</p>`)}
      
${photos[3]}
      
${photos[4]}`,
    );

    out = insertAfterNeedle(
      out,
      'Даже с нуля.</p></div>\n                  <div class="m-qa-row__spacer" aria-hidden="true"></div>\n                </div>',
      `\n      \n          ${photos[5]}\n      \n          ${photos[6]}\n      \n          ${photos[7]}`,
    );
    out = insertAfterNeedle(
      out,
      '<p><strong>Был подход: не умеешь что-то делать, окей, садись и сделай всё равно.</strong></p>\n          <cite class="m-quote-block__cite">– Маша Черн</cite>\n        </blockquote>',
      `\n      \n          ${photos[8]}\n      \n          ${photos[9]}\n      \n          ${photos[10]}`,
    );
    out = insertAfterNeedle(
      out,
      '<p><strong>Нужно, чтобы было хобби, которое даёт сто процентов всего: счастья, эндорфинов, радости, спокойствия. И чтобы это было не диджитал-хобби.</strong></p>\n          <cite class="m-quote-block__cite">– Маша Черн</cite>\n        </blockquote>',
      `\n      \n          ${photos[11]}`,
    );

    const aiSplitRe =
      /(<p>В ребрендинге Тона мы придумали, какой это мир, какая-то вселенная Тона, где всё выглядит каким-то образом\.)( И это всё равно будут промпты[\s\S]*?)(<\/p>)/;
    if (!aiSplitRe.test(out)) throw new Error('masha-chern: AI paragraph not found');
    out = out.replace(aiSplitRe, (_match, _g1, ending) =>
      `<p>В ребрендинге Тона мы придумали, какой это мир, какая-то вселенная Тона, где всё выглядит каким-то образом.</p></div>
                  <div class="m-qa-row__spacer" aria-hidden="true"></div>
                </div>
      
${photos[12]}
      
${photos[13]}
      
${speakerRow('Маша Черн', 'МЧ', `<p>${ending.trim()}</p>`)}`,
    );
    out = insertAfterNeedle(
      out,
      '<p><strong>Креативная смысловая вещь, концепции и идеи по улучшению всего, всё равно будут за людьми, а не за искусственным интеллектом.</strong></p>\n          <cite class="m-quote-block__cite">– Маша Черн</cite>\n        </blockquote>',
      `\n      \n          ${photos[14]}`,
    );
    return out;
  },

  'sergey-mekryukov': (body, photos) => {
    let out = body;

    out = insertAfterNeedle(
      out,
      'принимать правильные решения вместе.</p></div>\n                  <div class="m-qa-row__spacer" aria-hidden="true"></div>\n                </div>\n              </div>\n            </div>',
      `\n      \n          ${photos[0]}`,
    );
    out = insertAfterNeedle(
      out,
      'понимаешь с первого дня.</p></div>\n                  <div class="m-qa-row__spacer" aria-hidden="true"></div>\n                </div>\n              </div>\n            </div>',
      `\n      \n          ${photos[1]}`,
    );

    const valuesRe =
      /(<div class="m-qa-row">\s*<div class="m-qa-row__name"><span class="m-qa-row__name-label" title="Сергей Мекрюков">СМ<\/span><\/div>\s*<div class="m-qa-row__answer">)(<p>В первую очередь[\s\S]*?<p>Drinkit – это про атмосферу и вайб\. Ты заходишь в приложение и сразу чувствуешь, что здесь кайф\.<\/p>)(<p>Pizza – это про скорость, удобство и эмоции\. Быстро, просто, но с душой\.<\/p>)(<p>B2B –[\s\S]*?«похожим»\.<\/p>)(<\/div>\s*<div class="m-qa-row__spacer" aria-hidden="true"><\/div>\s*<\/div>)/;
    if (!valuesRe.test(out)) throw new Error('sergey-mekryukov: values qa-row not found');
    out = out.replace(valuesRe, (_match, open, drinkitPart, pizzaPart, b2bPart) =>
      `${open}${drinkitPart}</div>
                  <div class="m-qa-row__spacer" aria-hidden="true"></div>
                </div>
      
${photos[2]}
      
${speakerRow('Сергей Мекрюков', 'СМ', pizzaPart)}
      
${photos[3]}
      
${speakerRow('Сергей Мекрюков', 'СМ', b2bPart)}`,
    );

    out = insertAfterNeedle(
      out,
      'а не просто «похожим».</p></div>\n                  <div class="m-qa-row__spacer" aria-hidden="true"></div>\n                </div>\n              </div>\n            </div>',
      `\n      \n          ${photos[4]}`,
    );
    out = insertAfterNeedle(
      out,
      'Но это потом больнее.</p></div>\n                  <div class="m-qa-row__spacer" aria-hidden="true"></div>\n                </div>\n              </div>\n            </div>',
      `\n      \n          ${photos[5]}`,
    );
    out = insertAfterNeedle(
      out,
      'и рост команды.</p></div>\n                  <div class="m-qa-row__spacer" aria-hidden="true"></div>\n                </div>\n              </div>\n            </div>',
      `\n      \n          ${photos[6]}\n      \n          ${photos[7]}`,
    );
    return out;
  },

  'dariia-chertanova': (body, photos) => {
    let out = body;

    out = insertAfterNeedle(
      out,
      'подходящий инструмент или визуальное решение.</p></div>\n                  <div class="m-qa-row__spacer" aria-hidden="true"></div>\n                </div>\n              </div>\n              \n            </div>',
      `\n      \n          ${photos[0]}`,
    );

    const pathRe =
      /(<div class="m-qa-row">\s*<div class="m-qa-row__name"><span class="m-qa-row__name-label" title="ДЧ">ДЧ<\/span><\/div>\s*<div class="m-qa-row__answer">)(<p>Мне кажется, интересно узнать именно про путь человека[\s\S]*?Вспомнила про дизайн\. И уже осмысленно пришла в эту профессию через то, что мне действительно должно понравиться\.<\/p>)(<p>Архитектурное направление[\s\S]*?иллюстрации\.<\/p>)(<\/div>\s*<div class="m-qa-row__spacer" aria-hidden="true"><\/div>\s*<\/div>)/;
    if (!pathRe.test(out)) throw new Error('dariia-chertanova: path qa-row not found');
    out = out.replace(pathRe, (_match, open, introPart, restPart) =>
      `${open}${introPart}</div>
                  <div class="m-qa-row__spacer" aria-hidden="true"></div>
                </div>
      
${photos[1]}
      
${photos[2]}
      
${speakerRow('ДЧ', 'ДЧ', restPart)}`,
    );

    out = insertAfterNeedle(
      out,
      'Я прямо текстом прописывала, как всё должно вместе сложиться.</p></div>\n                  <div class="m-qa-row__spacer" aria-hidden="true"></div>\n                </div>\n              </div>\n            </div>',
      `\n      \n          ${photos[3]}\n      \n          ${photos[4]}\n      \n          ${photos[5]}`,
    );

    out = insertAfterNeedle(
      out,
      '<p><strong>Я не ищу идеи активно, они как-то сами ко мне приходят. Главное – включить активное слушание.</strong></p>\n          <cite class="m-quote-block__cite">– Даша Чертанова</cite>\n        </blockquote>',
      `\n      \n          ${photos[6]}\n      \n          ${photos[7]}`,
    );

    out = insertAfterNeedle(
      out,
      '<p><strong>У каждого свой путь, и не нужно его стыдиться. Мы можем быть счастливыми именно тогда, когда выбираем себя.</strong></p>\n          <cite class="m-quote-block__cite">– Даша Чертанова</cite>\n        </blockquote>',
      `\n      \n          ${photos[8]}\n      \n          ${photos[9]}\n      \n          ${photos[10]}`,
    );
    return out;
  },

  'sergey-breus': (body, photos) => {
    let out = body;
    out = insertAfterNeedle(
      out,
      '→ ONI.</p></div>\n                  <div class="m-qa-row__spacer" aria-hidden="true"></div>\n                </div>\n              </div>\n            </div>',
      `\n      \n          ${photos[0]}`,
    );
    out = insertAfterNeedle(
      out,
      'Стараюсь никого не абьюзить – это шутка.</p></div>\n                  <div class="m-qa-row__spacer" aria-hidden="true"></div>\n                </div>\n              </div>\n            </div>',
      `\n      \n          ${photos[1]}\n      \n          ${photos[2]}`,
    );
    out = insertAfterNeedle(
      out,
      'потом начну основную работу.</p></div>\n                  <div class="m-qa-row__spacer" aria-hidden="true"></div>\n                </div>\n              </div>\n            </div>',
      `\n      \n          ${photos[3]}`,
    );
    return out;
  },
};

function ensurePreviewLock(head) {
  let out = head;
  if (!out.includes('preview-lock.css')) {
    out = out.replace(
      '<link rel="stylesheet" href="../../udf/runtime/micro-animations.css" />',
      '<link rel="stylesheet" href="../../udf/runtime/micro-animations.css" />\n    <link rel="stylesheet" href="../../udf/runtime/preview-lock.css" />',
    );
  }
  if (!out.includes('preview-lock.js')) {
    out = out.replace(
      '<script defer src="../../udf/runtime/micro-animations.js"></script>',
      '<script defer src="../../udf/runtime/preview-lock.js"></script>\n    <script defer src="../../udf/runtime/micro-animations.js"></script>',
    );
  }
  return out;
}

function buildHtml(slug, currentHtml) {
  const rel = `src/pages/interviews/${slug}.html`;
  const cleanHtml = gitShow(CLEAN_COMMIT, rel);
  const currentHero = extractHero(currentHtml);
  const cleanFooter = extractFooter(cleanHtml);
  const footer = cleanFooter;
  const cleanBodyRaw = extractBody(cleanHtml);

  let photoSourceHtml = currentHtml;
  try {
    const headHtml = gitShow('HEAD', rel);
    const headPhotos = extractPhotoBlocks(extractBody(headHtml));
    const currentPhotos = extractPhotoBlocks(extractBody(currentHtml));
    if (headPhotos.length >= currentPhotos.length) {
      photoSourceHtml = headHtml;
    }
  } catch {
    photoSourceHtml = currentHtml;
  }
  const photoBlocks = extractPhotoBlocks(extractBody(photoSourceHtml));

  const insert = INSERTIONS[slug];
  if (!insert && !PHOTO_REPLACE_SLUGS.has(slug)) {
    throw new Error(`No insertion map for ${slug}`);
  }
  if (photoBlocks.length === 0) throw new Error(`No photo blocks found for ${slug}`);

  let bodyWithPhotos;
  const cleanPlaceholders = extractPhotoBlocks(cleanBodyRaw);
  if (PHOTO_REPLACE_SLUGS.has(slug) && cleanPlaceholders.length === photoBlocks.length) {
    bodyWithPhotos = replacePhotoBlocks(cleanBodyRaw, photoBlocks);
  } else {
    const cleanBody = stripPhotoBlocks(cleanBodyRaw);
    bodyWithPhotos = insert(cleanBody, photoBlocks);
  }

  const headMatch = currentHtml.match(/<!doctype html>[\s\S]*?<body[^>]*>/i);
  const cleanHeadMatch = cleanHtml.match(/<!doctype html>[\s\S]*?<body[^>]*>/i);
  if (!headMatch || !cleanHeadMatch) throw new Error('Could not parse document head');

  let head = cleanHeadMatch[0];
  const title = currentHtml.match(/<title>([^<]*)<\/title>/)?.[1];
  const heroTitle = currentHero.match(/<h1 class="o-interview-hero__title">([\s\S]*?)<\/h1>/)?.[1];
  if (title) head = head.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  head = ensurePreviewLock(head);

  return `${head}
    <div class="q-findings-overlay" aria-hidden="true"></div>
    <header class="s-menu s-menu--ready s-menu--article">
      <button class="s-menu__search" type="button" aria-label="Поиск" aria-expanded="false"></button>
      <a class="s-menu__logo" href="../../index.html" aria-label="deFindings">
        <img class="s-menu__logo-mark" src="../../udf/quarks/branding/deFindings.svg" alt="" aria-hidden="true" />
        <span class="a-visually-hidden">deFindings</span>
      </a>
    <button class="s-menu__toggle" type="button" aria-label="Открыть меню" aria-expanded="false"></button>
    </header>

    <main class="o-interview-page">
      ${currentHero.replace(
        /<h1 class="o-interview-hero__title">[\s\S]*?<\/h1>/,
        `<h1 class="o-interview-hero__title">${heroTitle}</h1>`,
      )}
      <div class="o-interview-body a-section">
      ${bodyWithPhotos}
      ${footer}
    </main>

    <div class="a-sticky-scroll-wrap">
      <div class="a-sticky-scroll">
        <span class="a-sticky-scroll__rec" aria-hidden="true"></span>
        <span class="a-sticky-scroll__content">
          <span class="a-sticky-scroll__dot" aria-hidden="true"></span>
          <span class="a-sticky-scroll__text">
            <span class="a-sticky-scroll__prefix">Вы читаете</span>
            <span class="a-sticky-scroll__current">«${title?.replace(/ – deFindings$/, '') ?? slug}»</span>
          </span>
        </span>
      </div>
    </div>

    <footer class="s-footer">
      <div class="s-footer__grid">
        <div>
          <h4>Смотрите</h4>
          <a href="../journal.html">Журнал</a>
          <a href="../gallery.html">Галерея</a>
        </div>
        <div>
          <h4>Узнайте больше</h4>
          <a href="../about.html">О проекте</a>
          <a href="../privacy.html">Политика конфиденциальности</a>
        </div>
        <div>
          <h4>Подписывайтесь</h4>
          <a href="../newsletter.html">Рассылка</a>
        </div>
        <div>
          <h4>Другие медиумы</h4>
          <a href="https://t.me/defindings">Telegram</a>
          <a href="https://www.linkedin.com/in/arkhipovau/">LinkedIn</a>
        </div>
        <div>
          <h4>Реализация проекта</h4>
          <a href="https://arkhipovau.xyz/">Юлия Архипова</a>
          <a href="https://t.me/dayglobal">Куратор – Захар День</a>
        </div>
        <div class="s-footer__up">
          <button class="a-arrow-button a-arrow-button--up" type="button" aria-label="Наверх"></button>
        </div>
      </div>
      <div class="s-footer__bottom">
        <span>© 2025 – 2026 deFindings</span>
        <span>HSE Art&amp;Design School</span>
      </div>
    </footer>
    <script defer src="../../udf/superorganisms/menu/search-matching.js"></script>
    <script defer src="../../udf/superorganisms/menu/menu-overlay.js"></script>
    <script defer src="../../udf/superorganisms/menu/s-menu.js"></script>
    <script defer src="../../udf/superorganisms/footer/s-footer.js"></script>
    <script defer src="../../udf/atoms/sticky-scroll/a-sticky-scroll.js"></script>
    <script defer src="../../udf/molecules/article-share/m-article-share.js"></script>
    <script defer src="../../udf/runtime/preview-lock.js"></script>
    <script defer src="../../udf/runtime/micro-animations.js"></script>
  </body>
</html>
`;
}

function validate(html, slug, expectedPhotoCount) {
  const photos = extractPhotoBlocks(extractBody(html));
  if (photos.length !== expectedPhotoCount) {
    throw new Error(`${slug}: photo count ${photos.length} !== ${expectedPhotoCount}`);
  }
  const bad = [
    /m-qa-row__answer"><p>[^<]*<div class="m-/,
    /<blockquote class="m-quote-block">\s*<blockquote class="m-quote-block">/,
    /<div class="o-interview-footer">\s*<div class="o-interview-footer">/,
    /<p><p>/,
  ];
  for (const re of bad) {
    if (re.test(html)) {
      throw new Error(`${slug}: validation failed for ${re}`);
    }
  }
}

function main() {
  const only = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
  const slugs = only.length ? SLUGS.filter((slug) => only.includes(slug)) : SLUGS;
  if (!slugs.length) {
    console.error(`No matching slugs. Available: ${SLUGS.join(', ')}`);
    process.exit(1);
  }

  for (const slug of slugs) {
    const fp = path.join(HTML_DIR, `${slug}.html`);
    const current = fs.readFileSync(fp, 'utf8');
    const rel = `src/pages/interviews/${slug}.html`;
    let expectedPhotos = 0;
    try {
      const headHtml = gitShow('HEAD', rel);
      expectedPhotos = extractPhotoBlocks(extractBody(headHtml)).length;
    } catch {
      expectedPhotos = extractPhotoBlocks(extractBody(current)).length;
    }
    const repaired = buildHtml(slug, current);
    validate(repaired, slug, expectedPhotos);
    fs.writeFileSync(fp, repaired);
    console.log(`Repaired: ${slug}`);
  }

  const sync = spawnSync(
    'node',
    ['scripts/sync-interview-body-from-md.js', ...slugs.map((slug) => `--only=${slug}`)],
    {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'inherit',
    },
  );
  if (sync.status !== 0) process.exit(sync.status || 1);
}

main();
