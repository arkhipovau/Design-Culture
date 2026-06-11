# M_NextArticle

The "Читать дальше" block at the end of every article/interview. Combines the
`a-arrow-button-xl` atom with a lead-in line and a two-line heading
(author + subtitle).

## Markup

```html
<section class="m-next-article section">
  <a class="m-next-article__circle a-arrow-button-xl"
     href="./next-page.html"
     aria-label="Следующая статья"></a>
  <p class="m-next-article__lead">Читать дальше</p>
  <h3 class="m-next-article__heading">
    <span class="m-next-article__author">Имя героя</span>
    <span class="m-next-article__title">Подзаголовок статьи</span>
  </h3>
</section>
```

## Dependencies

- `a-arrow-button-xl` (200×200 orange arrow circle)

## Notes

- Author and title are forced onto separate lines via `display: block`
  on the spans. The CSS does not add a separator — visual rhythm comes
  from `margin-bottom: 4px` on the author span.
- Width of the text column caps at 664 px so long titles wrap nicely
  instead of spanning the full body rail.
