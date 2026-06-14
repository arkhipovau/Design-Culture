#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const interviewsDir = path.join(__dirname, '../src/pages/interviews');

const bundleLink =
  '        <link rel="stylesheet" href="../../udf/bundles/interview.css?v=20260614" />\n';

const udfLinkRe =
  /    <link rel="stylesheet" href="\.\.\/\.\.\/udf\/(?:tokens|atoms|molecules|organisms|superorganisms|quarks)\/[^"]+" \/>\n/g;

function migrateHead(html) {
  if (html.includes('bundles/interview.css')) {
    return html.replace(udfLinkRe, '');
  }

  let next = html.replace(udfLinkRe, '');
  next = next.replace(
    /(<link rel="stylesheet" href="\.\/interview\.css[^"]*" \/>)/,
    `$1\n${bundleLink.trim()}`
  );
  return next;
}

const files = fs.readdirSync(interviewsDir).filter((f) => f.endsWith('.html')).sort();
let updated = 0;

for (const file of files) {
  const fp = path.join(interviewsDir, file);
  const html = fs.readFileSync(fp, 'utf8');
  const next = migrateHead(html);
  if (next !== html) {
    fs.writeFileSync(fp, next);
    updated += 1;
    console.log('updated:', file);
  }
}

console.log(`done: ${updated} files`);
