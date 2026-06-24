# UDF — deFindings UI

Layered design system (Atomic Design). Prefixes match Figma component names.

## Layers

| Layer | Prefix | Folder | Role |
|-------|--------|--------|------|
| Tokens | — | `tokens/` | Colors, type scale, grid |
| Quarks | `q-` | `quarks/` | SVG/CSS assets (icons, dots, branding) |
| Atoms | `a-` | `atoms/` | Buttons, inputs, arrows, tags |
| Molecules | `m-` | `molecules/` | Small UI blocks (qa-row, journal-card, portrait) |
| Organisms | `o-` | `organisms/` | Page sections built from molecules |
| Superorganisms | `s-` | `superorganisms/` | Site-wide chrome (menu, footer, lightbox) |
| Templates | `t-` | `templates/` | Page skeletons with content slots |
| Bundles | — | `bundles/` | Combined CSS imports per page type |
| Pages | — | `src/pages/` | Concrete HTML with real content |

## Conventions

- One folder per component: `{layer}/{name}/{prefix}-{name}.css`
- BEM elements: `m-qa-row__answer`, `o-interview-hero__title`
- States: `.is-active`, `[data-state='error']`
- Each component README lists markup, dependencies, and where it is used in production

## Interview article stack (current)

```
o-interview-hero          author + title + meta + m-interview-portrait
o-interview-body          m-interview-section × N + m-photo-slot / m-photo-row
o-interview-footer        m-article-info + m-next-article
```

Template: `templates/t-interview.html`  
CSS bundle: `bundles/interview.css`

## Journal listing (current)

```
o-journal-listing          section wrapper + __grid of m-journal-card
```

Used on `src/index.html` (homepage preview) and `src/pages/journal.html` (full list + filters above).

## Homepage (current)

```
o-hero-sphere              fullscreen iframe sphere (homepage only)
o-hero-intro               animated headline + pills
o-journal-listing          journal card grid preview
o-home-issue               print issue spotlight
o-home-highlights          interview slider (hidden in production)
o-home-gallery-preview     gallery strip preview (hidden)
o-home-newsletter          newsletter CTA block
m-split-links              journal / gallery navigation cards
```

CSS bundle: `bundles/home.css` on `src/index.html`  
Layout atom: `a-section` (content width) in `bundles/shell.css`

## About + Privacy (current)

```
o-about-page              main wrapper
o-about-spacer            top offset on privacy (no hero)
o-about-process           3-column process grid (about only)
o-about-content           article stack (+ --narrow modifier)
m-about-block             text block (+ --hero, __meta)
o-hero-intro--about       hero on about page only
```

CSS bundle: `bundles/about.css` on `about.html` and `privacy.html`

## Journal (current)

```
o-journal-page            main wrapper (top offset)
m-page-hero               title + slot (filters on journal)
m-journal-filters         horizontal filter chip strip
o-journal-listing         card grid (+ --page modifier)
```

CSS bundle: `bundles/journal.css` on `src/pages/journal.html`

## Gallery (current)

```
o-gallery-page            main wrapper (top offset)
m-page-hero--gallery      title + m-view-switch
m-view-switch             table / slider toggle
o-gallery-listing         __grid (table view)
s-gallery-lightbox        fullscreen image viewer
```

CSS bundle: `bundles/gallery.css` on `src/pages/gallery.html`

## Newsletter (current)

```
o-newsletter-page           main wrapper (grey bg)
o-newsletter-spacer         top offset before block
o-newsletter-block          subscribe section (+ __inner, __title, __subscribe)
```

CSS bundle: `bundles/newsletter.css` on `src/pages/newsletter.html`

## Interview page shell (current)

```
o-interview-page            main wrapper (+ grey bg)
s-menu--article             fixed menu on interview pages
m-interview-section__prose  standalone prose paragraph (placeholders)
```

Legacy `article-page`, `interview-page`, `article-prose` removed.  
CSS: `bundles/interview.css` only (no `article.css` / `interviews/interview.css`).

## Hero intro (current)

```
o-hero-intro              animated headline + pills (homepage: scroll; about: timer)
  __copy, __layout, __under, __over, __pills (about)
  __word, __tie, __pill (+ --a/--b/--c), __pill-slot, __pill-inner
  __break, __break--mobile, __studios-line, __studios--desktop/--mobile
```

CSS: `organisms/hero-intro/o-hero-intro.css` via `home.css` / `about.css`.  
Modifier: `o-hero-intro--about` on About.

## 404 (current)

```
o-error-page              full-viewport centered layout
  __content, __code, __title, __text, __actions
```

CSS bundle: `bundles/error.css` on `src/404.html` (minimal shell: menu only).

## Site shell (current)

```
o-site-shell (body)       overlay + header.s-menu + main + sticky + s-footer
m-cookie-consent          analytics consent banner (JS-injected, styles in shell.css)
```

CSS bundle: `bundles/shell.css` (includes `m-cookie-consent`, `a-button` for accept CTA)  
Template: `templates/t-site.html`  
Check: `node scripts/check-site-shell.js --check`

Menu/footer markup uses `s-menu` / `s-footer` only (no legacy `topbar` / `footer` classes).

Scripts:

- `node scripts/render-interview-from-template.js --check` — validate UDF structure
- `node scripts/render-interview-from-template.js <slug>` — rebuild page from template + slots
- `node scripts/sync-interview-body-from-md.js` — sync Q&A body from markdown
- `node scripts/render-article-info-links.js` — inject link lists

## Infrastructure (current)

**Tokens:** semantic aliases (`--bg`, `--paper`, `--ink`, …) live in `tokens/site.css`, imported by `bundles/shell.css`. `index.css` = global reset only (no token imports).

**Runtime JS/CSS** (cross-page, not single-component):

| Path | Role |
|------|------|
| `udf/atoms/sticky-scroll/a-sticky-scroll.js` | Reading progress pill |
| `udf/runtime/micro-animations.css` + `.js` | Reveal animations, hero wave, widow control |
| `udf/molecules/card-reveal/m-card-reveal.js` | Journal/gallery card image fade-in |
| `udf/molecules/cookie-consent/analytics.js` | GA + Metrika (loaded on consent) |

**Templates:**

| Template | Use |
|----------|-----|
| `t-site.html` | Full shell pages |
| `t-site-minimal.html` | 404 / errors |
| `t-interview.html` | Interview articles |

**Checks:**

```bash
node scripts/check-site-shell.js --check
node scripts/render-interview-from-template.js --check
```

Legacy `topbar` / `logo` / `footer` classes removed from production markup.

## Retired components

Do not use or reintroduce:

- **`m-article-cover`** — old full-width cover with credits and uppercase title; removed from UDF
