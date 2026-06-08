# M_ArticleInfo

The grey meta panel that sits at the end of every interview, just before the
"Читать дальше" block. Two-column layout – links on the left,
a short bio of the hero on the right.

## Link labels

Use the resource name as the link text:

- `LinkedIn`, `Behance`, `Instagram`, `YouTube`, `Dprofile`, `are.na`
- Personal or project sites: domain without protocol (`munk.design`, `design-lib.ru`)
- Public Telegram channels (not personal accounts): channel name (`Normal Mode`, `Senior Designer Pragmatica`)

Do not add email or personal Telegram accounts.

Run `node scripts/render-article-info-links.js` after editing `scripts/interview-links-data.js`.

## Markup

```html
<section class="m-article-info section">
  <div class="m-article-info__col">
    <h3 class="m-article-info__heading">Линки</h3>
    <ul class="m-article-info__list">
      <li class="m-article-info__item">
        <a href="https://example.com">example.com</a>
      </li>
    </ul>
  </div>
  <div class="m-article-info__col">
    <h3 class="m-article-info__heading">О практике</h3>
    <p class="m-article-info__bio">Короткое био героя.</p>
  </div>
</section>
```

## Responsive

- Desktop (>1200): two columns, 386 px + 1fr, 56 px padding.
- Tablet/mobile (≤1200): single column, 24 px padding.
