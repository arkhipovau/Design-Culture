# Archived scripts

One-off migration and injection scripts kept for reference. Not part of the build or deploy workflow.

| Script | Purpose |
|--------|---------|
| `migrate-shell-udf.js` | Shell markup → UDF classes |
| `migrate-interview-phase1.js` / `phase2.js` | Interview page UDF migration |
| `migrate-interview-hero-udf.js` | Interview hero block |
| `fix-interview-layout-v2.js` | Interview layout fixes |
| `interview-portrait-layout.js` / `add-interview-portrait-hero.js` | Portrait hero |
| `inject-cookie-consent.js` | Cookie banner injection |
| `inject-google-analytics.js` / `inject-yandex-metrika.js` | Analytics snippets |
| `inject-favicons.js` | Favicon links |
| `add-privacy-footer-links.js` | Privacy links in footer |
| `migrate-runtime-js-paths.js` | Move runtime JS from `javascripts/` into UDF paths |

Run manually only if you need to re-apply a historical change. Prefer editing `src/` and `scripts/check-site-shell.js` for ongoing work.
