# Templates

| Template | Pages | Slots |
|----------|-------|-------|
| `t-site.html` | Home, journal, about, gallery, newsletter, privacy | Full shell (sticky + footer) |
| `t-site-minimal.html` | `404.html` | Menu only |
| `t-interview.html` | `src/pages/interviews/*.html` | Article chrome + interview slots |

## `t-site.html`

| Slot | Example |
|------|---------|
| `{{ASSET_ROOT}}` | `./` (home), `../` (pages) |
| `{{TITLE}}` | Page `<title>` |
| `{{READING_PAGE}}` | `data-reading-page` on `<body>` |
| `{{LOGO_HREF}}` | `#top` or `../index.html` |
| `{{PAGES_HREF}}` | `./pages/` or `./` |
| `{{STICKY_CURRENT}}` | Sticky pill label |
| `{{S_MENU_MOD}}` | Optional header modifier, e.g. ` s-menu--newsletter` |
| `{{HEAD_EXTRA}}` | Page bundle + extra stylesheets |
| `{{MAIN}}` | `<main>…</main>` content |
| `{{SCRIPTS_EXTRA}}` | Page-specific deferred scripts |

**`S_MENU_MOD` values (only when CSS exists in page bundle):**

- ` s-menu--newsletter` — newsletter page
- `` (empty) — default for home, journal, about, gallery, privacy

Interview menu modifier `s-menu--article` lives in `t-interview.html` + `bundles/interview.css`.

## `t-site-minimal.html`

404 / error pages: no sticky, footer, or `micro-animations.js`.

| Slot | Notes |
|------|-------|
| `{{HEAD_EXTRA}}` | Usually `bundles/error.css` |
| `{{MAIN}}` | `o-error-page` block |
| `{{SCRIPTS_EXTRA}}` | Usually empty |

## Commands

```bash
node scripts/render-interview-from-template.js <slug>
node scripts/check-site-shell.js --check
```
