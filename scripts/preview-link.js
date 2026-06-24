#!/usr/bin/env node
/**
 * Print a guest preview URL for an interview page.
 * Usage: node scripts/preview-link.js sergey-breus [base-url]
 */
const slug = process.argv[2];
const base = (process.argv[3] || 'https://defindings.com/interviews').replace(/\/$/, '');

if (!slug) {
  console.error('Usage: node scripts/preview-link.js <slug> [base-url]');
  process.exit(1);
}

const url = `${base}/${slug}/?preview=1`;
console.log(url);
