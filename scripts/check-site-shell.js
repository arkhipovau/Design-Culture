#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INTERVIEW_DIR = path.join(ROOT, 'src/pages/interviews');

const FULL_SHELL_PAGES = [
  { file: 'src/index.html', label: 'home' },
  { file: 'src/pages/journal.html', label: 'journal' },
  { file: 'src/pages/about.html', label: 'about' },
  { file: 'src/pages/gallery.html', label: 'gallery' },
  { file: 'src/pages/newsletter.html', label: 'newsletter' },
  { file: 'src/pages/privacy.html', label: 'privacy' },
];

const INTERVIEW_SHELL_PAGES = fs
  .readdirSync(INTERVIEW_DIR)
  .filter((f) => f.endsWith('.html'))
  .map((f) => ({ file: `src/pages/interviews/${f}`, label: f.replace(/\.html$/, '') }));

const MINIMAL_SHELL_PAGES = [
  { file: 'src/404.html', label: '404' },
];

const FULL_REQUIRED = [
  'o-site-shell',
  'q-findings-overlay',
  '<header class="s-menu',
  'a-sticky-scroll-wrap',
  'class="s-footer"',
  'bundles/shell.css',
  'm-cookie-consent.js',
  'search-matching.js',
  'menu-overlay.js',
  'udf/atoms/sticky-scroll/a-sticky-scroll.js',
  'udf/runtime/micro-animations.js',
];

const INTERVIEW_REQUIRED = [
  'o-site-shell',
  'q-findings-overlay',
  '<header class="s-menu',
  'a-sticky-scroll-wrap',
  'class="s-footer"',
  'bundles/shell.css',
  'bundles/interview.css',
  'search-matching.js',
  'menu-overlay.js',
  'udf/atoms/sticky-scroll/a-sticky-scroll.js',
  'udf/runtime/micro-animations.js',
];

const MINIMAL_REQUIRED = [
  'o-site-shell',
  'q-findings-overlay',
  '<header class="s-menu',
  'bundles/shell.css',
  'm-cookie-consent.js',
  'search-matching.js',
  'menu-overlay.js',
];

const LEGACY_FORBIDDEN = [
  'class="topbar',
  'topbar--menu',
  'class="logo"',
  'class="logo-mark"',
  'class="footer"',
  'article-page interview-page',
  'class="article-page"',
  'class="journal-page"',
  'class="gallery-page"',
  'class="newsletter-page"',
  'class="page-404',
  'class="hero-copy"',
  'class="hero-over"',
  'class="menu-search"',
  'class="menu-toggle"',
  'site-menu-layer',
  'site-search-layer',
  'class="site-menu"',
  'class="site-search"',
  'javascripts/sticky-scroll.js',
  'javascripts/micro-animations.js',
  'javascripts/card-reveal.js',
  'javascripts/analytics.js',
  'stylesheets/micro-animations.css',
];

function checkLegacy(html, label) {
  const hits = LEGACY_FORBIDDEN.filter((token) => html.includes(token));
  if (!hits.length) return 0;
  console.error(`[site-shell] ${label}: legacy markup ${hits.join(', ')}`);
  return 1;
}

function stickyBeforeFooter(html) {
  const sticky = html.indexOf('a-sticky-scroll-wrap');
  const footer = html.indexOf('class="s-footer"');
  if (sticky < 0 || footer < 0) return false;
  return sticky < footer;
}

function checkPage({ file, label }, required, expectSticky) {
  const fp = path.join(ROOT, file);
  const html = fs.readFileSync(fp, 'utf8');
  let failures = 0;

  const missing = required.filter((token) => !html.includes(token));
  if (missing.length) {
    failures += 1;
    console.error(`[site-shell] ${label}: missing ${missing.join(', ')}`);
  }

  if (expectSticky && !stickyBeforeFooter(html)) {
    failures += 1;
    console.error(`[site-shell] ${label}: sticky must come before footer`);
  }

  failures += checkLegacy(html, label);

  return failures;
}

function main() {
  let failures = 0;

  for (const page of FULL_SHELL_PAGES) {
    failures += checkPage(page, FULL_REQUIRED, true);
  }

  for (const page of INTERVIEW_SHELL_PAGES) {
    failures += checkPage(page, INTERVIEW_REQUIRED, true);
  }

  for (const page of MINIMAL_SHELL_PAGES) {
    failures += checkPage(page, MINIMAL_REQUIRED, false);
  }

  if (failures) {
    process.exitCode = 1;
    console.error(`[site-shell] ${failures} issue(s)`);
    return;
  }

  const total = FULL_SHELL_PAGES.length + INTERVIEW_SHELL_PAGES.length + MINIMAL_SHELL_PAGES.length;
  console.log(`[site-shell] OK — ${total} pages`);
}

main();
