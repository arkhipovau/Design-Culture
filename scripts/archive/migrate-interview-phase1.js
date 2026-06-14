#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const interviewsDir = path.join(__dirname, '../src/pages/interviews');

const organismLinks = [
  '    <link rel="stylesheet" href="../../udf/organisms/interview-body/o-interview-body.css" />',
  '    <link rel="stylesheet" href="../../udf/organisms/interview-footer/o-interview-footer.css" />',
].join('\n');

function upgradeArticleInfo(inner) {
  let block = inner;
  block = block.replace(
    /<div>\s*\n\s*<h3>Линки<\/h3>/,
    '<div class="m-article-info__col">\n          <h3 class="m-article-info__heading">Линки</h3>'
  );
  block = block.replace(
    /<div>\s*\n\s*<h3>О практике<\/h3>/,
    '<div class="m-article-info__col">\n          <h3 class="m-article-info__heading">О практике</h3>'
  );
  block = block.replace(/<ul>/g, '<ul class="m-article-info__list">');
  block = block.replace(/<li>/g, '<li class="m-article-info__item">');
  block = block.replace(
    /(<h3 class="m-article-info__heading">О практике<\/h3>\s*)<p>/,
    '$1<p class="m-article-info__bio">'
  );
  return block;
}

function migrateFile(html) {
  let next = html;

  next = next.replace(
    /class="article-body interview-body a-section"/g,
    'class="o-interview-body a-section"'
  );

  if (!next.includes('o-interview-footer')) {
    next = next.replace(
      /(\s*)<section class="m-article-info a-section">([\s\S]*?)<\/section>\s*\n\s*<section class="m-next-article a-section">([\s\S]*?)<\/section>/,
      (_, indent, infoInner, nextInner) =>
        `${indent}</div>\n\n${indent}<div class="o-interview-footer">\n${indent}  <section class="m-article-info a-section">${upgradeArticleInfo(infoInner)}</section>\n\n${indent}  <section class="m-next-article a-section">${nextInner}</section>\n${indent}</div>`
    );
  } else {
    next = next.replace(
      /<section class="m-article-info a-section">([\s\S]*?)<\/section>/,
      (_, inner) => `<section class="m-article-info a-section">${upgradeArticleInfo(inner)}</section>`
    );
  }

  next = next.replace(/<p>Читать дальше<\/p>/g, '<p class="m-next-article__lead">Читать дальше</p>');
  next = next.replace(
    /<section class="m-next-article a-section">([\s\S]*?)<h3>/g,
    '<section class="m-next-article a-section">$1<h3 class="m-next-article__heading">'
  );

  if (!next.includes('o-interview-body.css')) {
    next = next.replace(
      /(<link rel="stylesheet" href="\.\.\/\.\.\/udf\/organisms\/interview-hero\/o-interview-hero\.css" \/>)/,
      `$1\n${organismLinks}`
    );
  }

  return next;
}

const files = fs.readdirSync(interviewsDir).filter((f) => f.endsWith('.html')).sort();
let updated = 0;

for (const file of files) {
  const filePath = path.join(interviewsDir, file);
  const html = fs.readFileSync(filePath, 'utf8');
  const next = migrateFile(html);
  if (next !== html) {
    fs.writeFileSync(filePath, next);
    updated += 1;
    console.log('updated:', file);
  }
}

console.log(`done: ${updated} files`);
