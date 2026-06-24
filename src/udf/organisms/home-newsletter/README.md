# O_HomeNewsletter

Newsletter signup block on the homepage (distinct from `pages/newsletter.html`).

## Markup

```html
<section id="newsletter" class="a-section o-home-newsletter" data-reading="…">
  <h2>…</h2>
  <div class="o-home-newsletter__subscribe">
    <p class="o-home-newsletter__label">Подписаться на рассылку</p>
    <form class="m-mail-form" …>…</form>
  </div>
</section>
```

## Dependencies

- `m-mail-form`, `a-mail-input`

## CSS

- `o-home-newsletter.css` (via `bundles/home.css`)
