# O_AboutContent

Article stack for long-form text on About and Privacy.

## Markup

About (narrow, centered):

```html
<article class="o-about-content o-about-content--narrow a-section">
  <section class="m-about-block">…</section>
</article>
```

Privacy (full width stack):

```html
<article class="o-about-content a-section">
  <header class="m-about-block m-about-block--hero">…</header>
  <section class="m-about-block">…</section>
</article>
```

## CSS

- `o-about-content.css` (via `bundles/about.css`)

## Dependencies

- `m-about-block`
