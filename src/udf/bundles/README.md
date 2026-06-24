# Bundles

## `shell.css`

Shared chrome for site pages (home, journal, about):

- tokens: colors, typography, site (`tokens/site.css`)
- `q-findings`, `a-sticky-scroll`
- `s-menu`, `s-footer`
- `m-cookie-consent`, `a-button` (cookie banner)

```html
<link rel="stylesheet" href="{{ASSET_ROOT}}stylesheets/index.css" />
<link rel="stylesheet" href="{{ASSET_ROOT}}udf/bundles/shell.css" />
```

Template: `templates/t-site.html`  
Check: `node scripts/check-site-shell.js --check`

## `home.css`

Homepage sections (sphere, hero intro, journal preview, issue, newsletter, split-links).

```html
<link rel="stylesheet" href="{{ASSET_ROOT}}udf/bundles/home.css" />
```

## `about.css`

About page and Privacy (shared content stack + process grid).

```html
<link rel="stylesheet" href="{{ASSET_ROOT}}udf/bundles/about.css" />
```

## `journal.css`

Journal listing page (hero, filters, card grid, split-links).

```html
<link rel="stylesheet" href="{{ASSET_ROOT}}udf/bundles/journal.css" />
```

## `gallery.css`

Gallery page (hero, view switch, card grid, lightbox, split-links).

```html
<link rel="stylesheet" href="{{ASSET_ROOT}}udf/bundles/gallery.css" />
```

## `newsletter.css`

Newsletter page (spacer, subscribe block, mail form).

```html
<link rel="stylesheet" href="{{ASSET_ROOT}}udf/bundles/newsletter.css" />
```

## `error.css`

404 page (centered not-found layout, buttons). Minimal shell — no sticky/footer.

```html
<link rel="stylesheet" href="{{ASSET_ROOT}}udf/bundles/error.css" />
```

## `interview.css`

Interview UDF styles. Imports page shell (`o-interview-page`, `s-menu--article`) and article organisms/molecules. Former `article.css` / `interviews/interview.css` merged here.

```html
<link rel="stylesheet" href="../../stylesheets/index.css" />
<link rel="stylesheet" href="../../udf/bundles/shell.css" />
<link rel="stylesheet" href="../../udf/bundles/interview.css" />
<link rel="stylesheet" href="../../udf/runtime/micro-animations.css" />
<script defer src="../../udf/molecules/cookie-consent/m-cookie-consent.js"></script>
```
