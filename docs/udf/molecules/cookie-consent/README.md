# M_Cookie_consent

Fixed bottom banner for analytics cookie consent. Injected by `m-cookie-consent.js` on site pages (skipped in iframes).

## Markup (runtime)

```html
<div class="m-cookie-consent is-visible" role="dialog" aria-label="Согласие на cookie">
  <div class="m-cookie-consent__panel">
    <span class="m-cookie-consent__dot" aria-hidden="true"></span>
    <p class="m-cookie-consent__text">…</p>
    <button class="m-cookie-consent__accept a-button a-button--s a-button--black" type="button">Принять</button>
  </div>
</div>
```

## States

- default — hidden (`opacity: 0`)
- `is-visible` — shown
- `is-hidden` — removed after accept animation

## Bundle

Styles ship in `bundles/shell.css` (`a-button` + this molecule). Standalone pages (e.g. `sphere.html`) link CSS directly.

```html
<script defer src="{{ASSET_ROOT}}udf/molecules/cookie-consent/m-cookie-consent.js"></script>
```

On accept, loads `udf/molecules/cookie-consent/analytics.js` (GA + Yandex Metrika).
