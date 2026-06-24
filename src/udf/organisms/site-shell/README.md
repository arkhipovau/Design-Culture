# O_SiteShell

Shared page chrome: findings overlay, menu header, main content slot, sticky reading indicator, footer, common scripts.

Superorganisms (`s-menu`, `s-footer`) stay separate; `o-site-shell` is the **composition** documented in `templates/t-site.html`.

## Canonical DOM order (after `<main>`)

1. `a-sticky-scroll-wrap`
2. `s-footer`
3. Page-specific scripts
4. Shell scripts: `m-cookie-consent.js`, `menu-overlay.js`, `s-menu.js`, `s-footer.js`, `a-sticky-scroll.js`, `udf/runtime/micro-animations.js`

## Markup

```html
<body class="o-site-shell" data-reading-page="…">
  <div class="q-findings-overlay" aria-hidden="true"></div>
  <header class="s-menu">
    <a class="s-menu__logo" href="…">
      <img class="s-menu__logo-mark" src="…" alt="" aria-hidden="true" />
    </a>
  </header>
  <main>… page content …</main>
  <div class="a-sticky-scroll-wrap">…</div>
  <footer class="s-footer">
    <div class="s-footer__grid">…</div>
    <div class="s-footer__bottom">…</div>
  </footer>
  <!-- scripts -->
</body>
```

Optional menu modifiers (styles in page bundles): `s-menu--article` (`bundles/interview.css`), `s-menu--newsletter` (`bundles/newsletter.css`).

## Templates

- `templates/t-site.html` — full shell (sticky + footer + micro-animations)
- `templates/t-site-minimal.html` — menu only (`404.html`)
- `templates/t-interview.html` — interviews

Check: `node scripts/check-site-shell.js --check` (also flags legacy `topbar` / `logo` markup)

## Pages using shell

Full shell: `index.html`, `journal.html`, `about.html`, `gallery.html`, `newsletter.html`, `privacy.html`, `src/pages/interviews/*.html` (via `bundles/interview.css` → `shell.css`).

Minimal shell (menu only, no sticky/footer): `404.html` + `bundles/error.css`.

Interview pages use `t-interview.html` — same chrome DOM, `s-menu--article` on header.
