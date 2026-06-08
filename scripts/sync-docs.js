const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DOCS = path.join(ROOT, 'docs');

let syncing = false;
let pending = false;

async function syncDocs() {
  if (syncing) {
    pending = true;
    return;
  }

  syncing = true;
  try {
    await fsp.rm(DOCS, { recursive: true, force: true });
    await fsp.mkdir(DOCS, { recursive: true });
    await fsp.cp(SRC, DOCS, {
      recursive: true,
      force: true,
      dereference: false,
      filter: function (srcPath) {
        return !srcPath.endsWith('.DS_Store');
      }
    });
    await fsp.writeFile(path.join(DOCS, '.nojekyll'), '');
    await fsp.writeFile(path.join(DOCS, 'CNAME'), 'defindings.com\n');
    console.log('[sync-docs] Synced ' + SRC + ' -> ' + DOCS);
  } catch (error) {
    console.error('[sync-docs] Sync failed:', error);
    process.exitCode = 1;
  } finally {
    syncing = false;
    if (pending) {
      pending = false;
      queueMicrotask(syncDocs);
    }
  }
}

async function main() {
  const watchMode = process.argv.includes('--watch');
  await syncDocs();

  if (!watchMode) return;

  console.log('[sync-docs] Watching src/ for changes...');
  const debounce = { timer: null };

  fs.watch(SRC, { recursive: true }, function () {
    clearTimeout(debounce.timer);
    debounce.timer = setTimeout(function () {
      syncDocs();
    }, 120);
  });
}

main();
