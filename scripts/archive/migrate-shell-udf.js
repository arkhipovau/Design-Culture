#!/usr/bin/env node
/**
 * One-off: remove legacy topbar/footer classes in favour of s-menu / s-footer UDF.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HTML_DIRS = [
  path.join(ROOT, 'src'),
  path.join(ROOT, 'src/pages'),
  path.join(ROOT, 'src/pages/interviews'),
  path.join(ROOT, 'src/udf/templates'),
];

function migrateHtml(html) {
  return html
    .replace(
      /class="topbar topbar--menu s-menu article-topbar"/g,
      'class="s-menu s-menu--article"',
    )
    .replace(
      /class="topbar topbar--menu s-menu about-topbar"/g,
      'class="s-menu s-menu--about"',
    )
    .replace(
      /class="topbar topbar--menu s-menu gallery-topbar"/g,
      'class="s-menu s-menu--gallery"',
    )
    .replace(
      /class="topbar topbar--menu s-menu newsletter-topbar"/g,
      'class="s-menu s-menu--newsletter"',
    )
    .replace(
      /class="topbar topbar--menu s-menu journal-topbar"/g,
      'class="s-menu"',
    )
    .replace(/class="footer s-footer"/g, 'class="s-footer"')
    .replace(/class="footer-grid"/g, 'class="s-footer__grid"')
    .replace(/class="footer-bottom"/g, 'class="s-footer__bottom"')
    .replace(/class="logo-mark"/g, 'class="s-menu__logo-mark"')
    .replace(/class="logo"/g, 'class="s-menu__logo"');
}

function migrateCss(css, kind) {
  if (kind === 'menu') {
    return css
      .replace(/\.topbar\.topbar--menu/g, 'header.s-menu.s-menu--ready')
      .replace(/\.topbar\.s-menu/g, 'header.s-menu')
      .replace(/\.topbar/g, 'header.s-menu')
      .replace(/\.logo-mark/g, '.s-menu__logo-mark')
      .replace(/\.logo\b/g, '.s-menu__logo');
  }
  if (kind === 'footer') {
    return css
      .replace(/\.footer\.s-footer/g, '.s-footer')
      .replace(/\.footer-grid/g, '.s-footer__grid')
      .replace(/\.footer-bottom/g, '.s-footer__bottom')
      .replace(/\.footer-up/g, '.s-footer__up')
      .replace(/\.footer-meta-disclaimer/g, '.s-footer__disclaimer');
  }
  return css;
}

let htmlCount = 0;
for (const dir of HTML_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.html')) continue;
    const fp = path.join(dir, file);
    const next = migrateHtml(fs.readFileSync(fp, 'utf8'));
    fs.writeFileSync(fp, next);
    htmlCount += 1;
  }
}

const menuCss = path.join(ROOT, 'src/udf/superorganisms/menu/s-menu.css');
fs.writeFileSync(menuCss, migrateCss(fs.readFileSync(menuCss, 'utf8'), 'menu'));

const footerCss = path.join(ROOT, 'src/udf/superorganisms/footer/s-footer.css');
fs.writeFileSync(footerCss, migrateCss(fs.readFileSync(footerCss, 'utf8'), 'footer'));

console.log(`[migrate-shell-udf] updated ${htmlCount} HTML files + s-menu.css + s-footer.css`);
