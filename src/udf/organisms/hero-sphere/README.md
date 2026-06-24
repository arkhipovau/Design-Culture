# O_HeroSphere

Fullscreen iframe with the interactive sphere on the homepage.

## Markup

```html
<section class="o-hero-sphere" data-reading="…">
  <iframe
    class="o-hero-sphere__frame"
    src="./pages/sphere-embed.html?…"
    title="Интерактивная сфера deFindings"
    loading="eager"
  ></iframe>
</section>
```

## CSS

- `o-hero-sphere.css` (via `bundles/home.css`)

## Scripts

- `micro-animations.js` — listens for `sphere-ready` postMessage, adds `.is-loaded`
