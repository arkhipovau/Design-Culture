#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const interviewsDir = path.join(__dirname, '../src/pages/interviews');

const heroCssLinks = [
  '    <link rel="stylesheet" href="../../udf/organisms/interview-hero/o-interview-hero.css" />',
  '    <link rel="stylesheet" href="../../udf/molecules/interview-portrait/m-interview-portrait.css" />',
].join('\n');

function migrateHero(html) {
  let next = html;

  next = next.replace(
    /<section class="article-hero interview-hero"([^>]*)>/g,
    '<section class="o-interview-hero a-section"$1>'
  );
  next = next.replace(/<div class="hero-content a-section">/g, '<div class="o-interview-hero__content">');
  next = next.replace(/<p class="article-author">/g, '<p class="o-interview-hero__author">');
  next = next.replace(/class="interview-hero__title"/g, 'class="o-interview-hero__title"');
  next = next.replace(/<p class="article-meta">/g, '<p class="o-interview-hero__meta">');
  next = next.replace(
    /class="interview-portrait interview-portrait--placeholder"/g,
    'class="m-interview-portrait m-interview-portrait--placeholder"'
  );
  next = next.replace(/class="interview-portrait"/g, 'class="m-interview-portrait"');
  next = next.replace(/interview-portrait__image/g, 'm-interview-portrait__image');

  if (!next.includes('o-interview-hero.css')) {
    next = next.replace(
      /(<link rel="stylesheet" href="\.\/interview\.css[^"]*" \/>)/,
      `$1\n${heroCssLinks}`
    );
  }

  return next;
}

const files = fs
  .readdirSync(interviewsDir)
  .filter((f) => f.endsWith('.html'))
  .sort();

let updated = 0;
for (const file of files) {
  const filePath = path.join(interviewsDir, file);
  const html = fs.readFileSync(filePath, 'utf8');
  const next = migrateHero(html);
  if (next !== html) {
    fs.writeFileSync(filePath, next);
    updated += 1;
    console.log('updated:', file);
  }
}

console.log(`done: ${updated} files`);
