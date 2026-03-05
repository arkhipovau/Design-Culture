import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
    await rm(DOCS, { recursive: true, force: true });
    await mkdir(DOCS, { recursive: true });
    await cp(SRC, DOCS, {
      recursive: true,
      force: true,
      dereference: false,
      filter: (srcPath) => !srcPath.endsWith('.DS_Store')
    });
    await writeFile(path.join(DOCS, '.nojekyll'), '');
    console.log(`[sync-docs] Synced ${SRC} -> ${DOCS}`);
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

  watch(SRC, { recursive: true }, () => {
    clearTimeout(debounce.timer);
    debounce.timer = setTimeout(() => {
      syncDocs();
    }, 120);
  });
}

main();
