const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const SECTION_PAGES = ['about', 'journal', 'gallery', 'newsletter', 'privacy', 'sphere', 'sphere-embed', 'sphere-test'];

const REDIRECT_STUB = (target) =>
  '<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="UTF-8" />\n' +
  `<link rel="canonical" href="${target}" />\n` +
  `<meta http-equiv="refresh" content="0; url=${target}" />\n` +
  `<script>location.replace(${JSON.stringify(target)})</script>\n` +
  '</head>\n<body></body>\n</html>\n';

function rewriteContent(text, options) {
  let out = text;
  const collapseSlashes = !options || options.collapseSlashes !== false;

  out = out.replace(/(?:\.\.\/|\.\/)?pages\/interviews\/([a-z0-9-]+)\.html/g, '/interviews/$1/');
  out = out.replace(/(?:\.\.\/|\.\/)interviews\/([a-z0-9-]+)\.html/g, '/interviews/$1/');

  for (const page of SECTION_PAGES) {
    out = out.replace(new RegExp('(?:\\.\\./|\\./)?pages/' + page + '\\.html', 'g'), '/' + page + '/');
    out = out.replace(new RegExp('(?:\\.\\./|\\./)' + page + '\\.html', 'g'), '/' + page + '/');
  }

  out = out.replace(/href="\.\/([a-z0-9-]+)\.html"/g, 'href="/interviews/$1/"');

  out = out.replace(/(?:\.\.\/|\.\/)index\.html/g, '/');
  out = out.replace(/href="index\.html/g, 'href="/');
  out = out.replace(/href='index\.html/g, "href='/");

  out = out.replace(/(?:\.\.\/|\.\/)udf\//g, '/udf/');
  out = out.replace(/(?:\.\.\/|\.\/)images\//g, '/images/');
  out = out.replace(/(?:\.\.\/|\.\/)stylesheets\//g, '/stylesheets/');
  out = out.replace(/href="udf\//g, 'href="/udf/');
  out = out.replace(/src="udf\//g, 'src="/udf/');

  out = out.replace(/([^:])\/\/(images|udf|stylesheets)\//g, '$1/$2/');

  if (collapseSlashes) {
    out = out.replace(/([^:])\/\/+/g, '$1/');
  }

  return out;
}

async function walkFiles(dir, filter, files = []) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(fullPath, filter, files);
    } else if (filter(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function rewriteTree(rootDir, filter) {
  const files = await walkFiles(rootDir, filter);
  for (const filePath of files) {
    const original = await fsp.readFile(filePath, 'utf8');
    const isHtml = /\.html$/i.test(filePath);
    const rewritten = rewriteContent(original, { collapseSlashes: isHtml });
    if (rewritten !== original) {
      await fsp.writeFile(filePath, rewritten);
    }
  }
}

async function restructureDocs(docsDir) {
  for (const page of SECTION_PAGES) {
    const legacyPath = path.join(docsDir, 'pages', page + '.html');
    if (!fs.existsSync(legacyPath)) continue;

    const content = await fsp.readFile(legacyPath, 'utf8');
    const newPath = path.join(docsDir, page, 'index.html');
    await fsp.mkdir(path.dirname(newPath), { recursive: true });
    await fsp.writeFile(newPath, content);
    await fsp.writeFile(legacyPath, REDIRECT_STUB('/' + page + '/'));
  }

  const interviewsLegacyDir = path.join(docsDir, 'pages', 'interviews');
  if (fs.existsSync(interviewsLegacyDir)) {
    const files = await fsp.readdir(interviewsLegacyDir);
    for (const fileName of files) {
      if (!fileName.endsWith('.html')) continue;
      const slug = fileName.replace(/\.html$/, '');
      const legacyPath = path.join(interviewsLegacyDir, fileName);
      const content = await fsp.readFile(legacyPath, 'utf8');
      const newPath = path.join(docsDir, 'interviews', slug, 'index.html');
      await fsp.mkdir(path.dirname(newPath), { recursive: true });
      await fsp.writeFile(newPath, content);
      await fsp.writeFile(legacyPath, REDIRECT_STUB('/interviews/' + slug + '/'));
    }
  }

  const galleryDataLegacy = path.join(docsDir, 'pages', 'gallery-data.js');
  if (fs.existsSync(galleryDataLegacy)) {
    const content = await fsp.readFile(galleryDataLegacy, 'utf8');
    await fsp.mkdir(path.join(docsDir, 'gallery'), { recursive: true });
    await fsp.writeFile(path.join(docsDir, 'gallery', 'gallery-data.js'), content);
    await fsp.unlink(galleryDataLegacy);
  }

  const sphereRuntimeLegacy = path.join(docsDir, 'pages', 'sphere-runtime-v2.js');
  if (fs.existsSync(sphereRuntimeLegacy)) {
    const runtime = await fsp.readFile(sphereRuntimeLegacy, 'utf8');
    for (const targetDir of ['sphere-embed', 'sphere']) {
      const targetPath = path.join(docsDir, targetDir, 'sphere-runtime-v2.js');
      if (fs.existsSync(path.join(docsDir, targetDir, 'index.html'))) {
        await fsp.writeFile(targetPath, runtime);
      }
    }
  }
}

async function applyCleanUrls(docsDir) {
  await rewriteTree(docsDir, (filePath) => /\.(html|js)$/i.test(filePath));
  await restructureDocs(docsDir);
}

module.exports = {
  SECTION_PAGES,
  rewriteContent,
  rewriteTree,
  restructureDocs,
  applyCleanUrls,
};
