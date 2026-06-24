# M_InterviewPortrait

Portrait under the interview hero title block. 200×267 px on desktop, 160×213 on mobile.

## Markup

```html
<figure class="m-interview-portrait">
  <img src="..." alt="Имя героя" width="200" height="267" loading="lazy" decoding="async" />
</figure>
```

Placeholder when photo is not ready:

```html
<figure class="m-interview-portrait m-interview-portrait--placeholder">
  <div class="m-interview-portrait__image" data-placeholder-label="Фото будет добавлено" aria-label="Имя героя"></div>
</figure>
```

## Used in

- `o-interview-hero` organism (all interview pages)
