#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const META_PATH = path.join(ROOT, 'content/interviews-meta.json');
const ASSETS = path.join(ROOT, 'src/images/interviews');
const IMAGES = path.join(ROOT, 'src/images');

/** Filename prefixes in src/images for interviews already wired on the site. */
const IMAGE_PREFIX = {
  'anastasia-sycheva': 'anastasia-sycheva-',
  'sergey-kudinov': 'sergey-kudinov-',
  'yan-zaretsky': 'yan-zaretsky-',
  'artem-gerts': 'artem-',
  'dasha-makurina': 'dasha-',
  'andrey-maksimenkov': 'maksimenkov-',
};

const STATUS_LABEL = {
  wired: 'готово — фото подключены на сайте',
  placeholders: 'нужны фото — в HTML пока плейсхолдеры',
  'no-photos': 'без фото-слотов в интервью',
};

function interviewStatus(slug, html) {
  const prefix = IMAGE_PREFIX[slug];
  const placeholders = (html.match(/data-placeholder-label/g) || []).length;
  const slots = (html.match(/id="photo-/g) || []).length;
  const named = prefix
    ? fs
        .readdirSync(IMAGES)
        .filter((name) => name.startsWith(prefix))
    : [];

  if (slots === 0) return { status: 'no-photos', slots, placeholders, named };
  if (named.length && placeholders === 0) return { status: 'wired', slots, placeholders, named };
  return { status: 'placeholders', slots, placeholders, named };
}

function copyWiredImages(slug, names) {
  const destDir = path.join(ASSETS, slug);
  fs.mkdirSync(destDir, { recursive: true });
  let copied = 0;

  for (const name of names) {
    const src = path.join(IMAGES, name);
    const dest = path.join(destDir, name);
    if (!fs.existsSync(src)) continue;
    if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs) continue;
    fs.copyFileSync(src, dest);
    copied += 1;
  }

  return copied;
}

function writeFolderReadme(slug, author, info) {
  const destDir = path.join(ASSETS, slug);
  const lines = [
    `# ${author}`,
    '',
    `slug: \`${slug}\``,
    `статус: ${STATUS_LABEL[info.status]}`,
    `слотов в интервью: ${info.slots}`,
    '',
  ];

  if (info.status === 'wired' && info.named.length) {
    lines.push('## Файлы', '');
    for (const name of info.named.sort()) {
      lines.push(`- \`${name}\``);
    }
    lines.push('');
  }

  if (info.status === 'placeholders') {
    lines.push(
      '## Что загружать',
      '',
      'Клади сюда PNG или JPG. Имена — латиницей, через дефис:',
      '`{проект}-{вариант}.png`, например `pragmatica-station-duo.png`.',
      '',
      'Когда файлы готовы — попроси подключить в интервью (скрипт `wire-project-images.js`).',
      ''
    );
  }

  if (info.status === 'no-photos') {
    lines.push('В этой статье пока нет блоков с проектными фото.', '');
  }

  fs.writeFileSync(path.join(destDir, 'README.md'), lines.join('\n'));
}

function writeRootReadme(rows) {
  const lines = [
    '# Ассеты интервью',
    '',
    'Папка для исходников проектных фото по спикерам. Сайт по-прежнему берёт картинки из `src/images/` —',
    'после загрузки сюда их нужно подключить в HTML (или попросить агента).',
    '',
    '| Спикер | slug | Статус | Слотов |',
    '| --- | --- | --- | ---: |',
  ];

  for (const row of rows) {
    lines.push(
      `| ${row.author} | \`${row.slug}\` | ${STATUS_LABEL[row.status]} | ${row.slots} |`
    );
  }

  lines.push(
    '',
    '## Именование',
    '',
    '- одна папка = один спикер (`slug` как в `content/interviews/`)',
    '- файлы: `{проект}-{вариант}.png` / `.jpg` / `.webp`',
    '- для уже подключённых интервью файлы скопированы из `src/images/` с теми же именами',
    '',
    'Пересоздать структуру: `node scripts/init-interview-asset-folders.js`',
    ''
  );

  fs.writeFileSync(path.join(ASSETS, 'README.md'), lines.join('\n'));
}

function main() {
  const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
  const rows = [];
  let copiedTotal = 0;

  fs.mkdirSync(ASSETS, { recursive: true });

  for (const slug of meta.order) {
    const { author } = meta.interviews[slug];
    const htmlPath = path.join(ROOT, 'src/pages/interviews', `${slug}.html`);
    const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
    const info = interviewStatus(slug, html);

    fs.mkdirSync(path.join(ASSETS, slug), { recursive: true });

    if (info.status === 'wired') {
      copiedTotal += copyWiredImages(slug, info.named);
    } else if (info.status === 'placeholders') {
      const keep = path.join(ASSETS, slug, '.gitkeep');
      if (!fs.existsSync(keep)) fs.writeFileSync(keep, '');
    }

    writeFolderReadme(slug, author, info);
    rows.push({ slug, author, ...info });
    console.log(`${slug}: ${info.status} (${info.slots} slots, ${info.named.length} files)`);
  }

  writeRootReadme(rows);
  console.log(`\nDone. Copied ${copiedTotal} file(s) into ${path.relative(ROOT, ASSETS)}/`);
}

main();
