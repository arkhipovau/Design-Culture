# O_InterviewHero

Current interview page hero: light-grey block, centered author + editorial headline + meta line, portrait below.

This replaces the older full-bleed cover (`m-article-cover`) — that layout is retired and must not be used.

## Markup

```html
<section class="o-interview-hero a-section" id="hero">
  <div class="o-interview-hero__content">
    <p class="o-interview-hero__author">Имя героя</p>
    <h1 class="o-interview-hero__title">Редакционный заголовок интервью</h1>
    <p class="o-interview-hero__meta">Страна • Город • Тип</p>
  </div>
  <figure class="m-interview-portrait">
    <img src="..." alt="Имя героя" width="200" height="267" loading="lazy" decoding="async" />
  </figure>
</section>
```

## Dependencies

- `m-interview-portrait`
- `udf/tokens/typography.css`, `udf/tokens/grid.css`

## CSS

- `o-interview-hero.css`
- `../molecules/interview-portrait/m-interview-portrait.css`
