const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const INTERVIEWS_HTML = path.join(ROOT, 'src/pages/interviews');
const INTERVIEWS_MD = path.join(ROOT, 'content/interviews');

/** @param {string} text */
function cleanQuoteText(text) {
  let out = text.trim();

  const outer = out.match(/^«([\s\S]*?)»([.!?…])?$/);
  if (outer) {
    out = outer[1].trim();
    if (outer[2]) out += outer[2];
  }

  out = out
    .replace(/[„"""]/g, '')
    .replace(/[«»]/g, '');

  return out;
}

/** @param {string} html */
function cleanHtmlQuotes(html) {
  return html.replace(
    /(<blockquote class="m-quote-block">\s*<p><strong>)([\s\S]*?)(<\/strong><\/p>)/g,
    (_match, open, quote, close) => `${open}${cleanQuoteText(quote)}${close}`,
  );
}

/** @param {string} md */
function cleanMdQuotes(md) {
  return md.replace(/^> (.+)$/gm, (line, body) => {
    const cleaned = cleanQuoteText(body);
    return cleaned === body.trim() ? line : `> ${cleaned}`;
  });
}

function main() {
  let htmlCount = 0;
  let mdCount = 0;

  for (const file of fs.readdirSync(INTERVIEWS_HTML).filter((f) => f.endsWith('.html'))) {
    const filePath = path.join(INTERVIEWS_HTML, file);
    const original = fs.readFileSync(filePath, 'utf8');
    const updated = cleanHtmlQuotes(original);
    if (updated !== original) {
      fs.writeFileSync(filePath, updated);
      htmlCount += 1;
    }
  }

  for (const file of fs.readdirSync(INTERVIEWS_MD).filter((f) => f.endsWith('.md'))) {
    const filePath = path.join(INTERVIEWS_MD, file);
    const original = fs.readFileSync(filePath, 'utf8');
    const updated = cleanMdQuotes(original);
    if (updated !== original) {
      fs.writeFileSync(filePath, updated);
      mdCount += 1;
    }
  }

  console.log(`[clean-interview-quotes] Updated ${htmlCount} html, ${mdCount} md files`);
}

main();
