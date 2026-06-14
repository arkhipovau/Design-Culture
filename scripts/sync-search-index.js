#!/usr/bin/env node
/**
 * Sync interview titles in menu search from content/interviews-meta.json.
 * Run: node scripts/sync-search-index.js
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const META_PATH = path.join(ROOT, 'content/interviews-meta.json');
const MENU_OVERLAY = path.join(ROOT, 'src/udf/superorganisms/menu/menu-overlay.js');
const DOCS_MENU_OVERLAY = path.join(ROOT, 'docs/udf/superorganisms/menu/menu-overlay.js');

const START = '      // SEARCH_INTERVIEWS_START';
const END = '      // SEARCH_INTERVIEWS_END';

/** Extra search terms per slug (city, studio, brands). */
const KEYWORDS = {
  togetherwithyou: 'студия тбилиси анти дисциплина брендинг крафт ai',
  'aleksey-pyankov': 'екатеринбург pragmatica прагматика студия',
  'polina-zagumenova': 'берлин фриланс щука ai',
  'masha-chern': 'копенгаген дания ton tone verle продукт',
  'yulya-kondratyeva': 'тбилиси werkstatt гроза holystick школа',
  'yan-zaretsky': 'санкт-петербург питер munk мастерская продукт студия',
  'sergey-breus': 'москва ony oni f61 студия',
  'sergey-kudinov': 'москва яндекс 360 продукт',
  'anya-golub': 'бали призма prizma студия',
  'dasha-makurina': 'москва rarible pont design продукт 3d cgi',
  'sasha-barabonova': 'ереван phygital t-банк vk yandex pragmatica lalalai продукт',
  'stefan-lashko': 'москва esh студия преподаватель',
  'olya-bazanova': 'калининград подписные додо издательство',
  'anastasia-sycheva': 'белград студия y combinator брендинг',
  'artem-gerts': 'москва redis студия айдентика',
  'gavril-perov': 'париж франция drinkit продукт архитектура город графический',
  'elena-chinakova': 'лондон великобритания сообщество zorky avito',
  'andrey-maksimenkov': 'ростов spros диджитал интервью проект',
  'sergey-mekryukov': 'москва dodo brands додо продукт ux сервисы',
  'dariia-chertanova':
    'москва the blueprint blueprint bang bang education werkstatt продукт смыслы контекст кодинг',
  'nikita-petrov': 'москва nikipetrov продукт проект foliobin savi medium portfolio',
  'maxim-aksenov': 'москва фриланс дизайн архитектура система lash',
};

function escapeJsString(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n');
}

function buildInterviewBlock(meta) {
  const lines = [START];

  for (const slug of meta.order) {
    const entry = meta.interviews[slug];
    if (!entry) continue;

    const author = escapeJsString(entry.author);
    const subtitle = escapeJsString(entry.subtitle || '');
    const keywords = escapeJsString(KEYWORDS[slug] || '');

    lines.push('      {');
    lines.push(`        title: '${author}',`);
    lines.push(`        subtitle: '${subtitle}',`);
    lines.push("        kind: 'Статья',");
    lines.push(`        href: interview('${slug}'),`);
    lines.push(`        keywords: '${keywords}',`);
    lines.push('        priority: 70');
    lines.push('      },');
  }

  lines.push(END);
  return lines.join('\n');
}

function patchMenuOverlay(filePath, block) {
  const source = fs.readFileSync(filePath, 'utf8');
  const re = /      \/\/ SEARCH_INTERVIEWS_START[\s\S]*?      \/\/ SEARCH_INTERVIEWS_END/;

  if (!re.test(source)) {
    throw new Error(`Markers not found in ${filePath}`);
  }

  const next = source.replace(re, block);
  if (next === source) {
    console.log(`${path.relative(ROOT, filePath)}: unchanged`);
    return false;
  }

  fs.writeFileSync(filePath, next, 'utf8');
  console.log(`${path.relative(ROOT, filePath)}: updated`);
  return true;
}

function main() {
  const meta = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
  const block = buildInterviewBlock(meta);

  for (const slug of meta.order) {
    if (!KEYWORDS[slug]) {
      console.warn(`warn: no search keywords for ${slug}`);
    }
  }

  patchMenuOverlay(MENU_OVERLAY, block);
  if (fs.existsSync(DOCS_MENU_OVERLAY)) {
    try {
      patchMenuOverlay(DOCS_MENU_OVERLAY, block);
    } catch (error) {
      fs.copyFileSync(MENU_OVERLAY, DOCS_MENU_OVERLAY);
      console.log(`${path.relative(ROOT, DOCS_MENU_OVERLAY)}: copied from src`);
    }
  }
}

main();
