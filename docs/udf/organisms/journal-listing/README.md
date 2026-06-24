# O_JournalListing

Grid of interview cards on the homepage and the journal page.

Does **not** include the journal page hero with filters — that is `m-page-hero` + `m-journal-filters` in `bundles/journal.css`.

## Markup

Homepage (`src/index.html`):

```html
<section id="journal" class="o-journal-listing a-section" data-reading="Журнал deFindings">
  <div class="o-journal-listing__grid">
    <article class="m-journal-card" data-href="...">…</article>
  </div>
</section>
```

Journal page (`src/pages/journal.html`):

```html
<section class="o-journal-listing o-journal-listing--page a-section" id="journal-list">
  <div class="o-journal-listing__grid">
    <article class="m-journal-card" data-tags="..." data-href="...">…</article>
  </div>
</section>
```

## Dependencies

- `m-journal-card`
- `a-image-journal-link`, `q-image-journal`
- `udf/tokens/grid.css` (via `index.css`)

## CSS

- `o-journal-listing.css`

## Scripts

- `m-journal-card.js` — card click navigation
- `journal-filters.js` — filter chips on journal page only (targets `.m-journal-card[data-tags]`)
