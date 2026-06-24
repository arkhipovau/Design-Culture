#!/usr/bin/env node
const path = require('node:path');
const { rewriteTree } = require('./clean-urls');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

rewriteTree(
  SRC,
  (filePath) =>
    /\.(html|js)$/i.test(filePath) &&
    !filePath.includes('/udf/superorganisms/menu/menu-overlay.js') &&
    !filePath.includes('/udf/runtime/site-gate.js') &&
    !filePath.includes('/udf/molecules/cookie-consent/m-cookie-consent.js')
)
  .then(function () {
    console.log('[rewrite-src-urls] Updated src HTML/JS links to clean URLs');
  })
  .catch(function (error) {
    console.error('[rewrite-src-urls] Failed:', error);
    process.exitCode = 1;
  });
