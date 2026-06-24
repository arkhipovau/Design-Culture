# O_ErrorPage

Centered 404 / not-found layout. Minimal shell: menu only, no sticky or footer.

## Markup

```html
<body class="o-site-shell">
  …
  <main class="o-error-page">
    <div class="o-error-page__content">
      <p class="o-error-page__code" aria-hidden="true">404</p>
      <h1 class="o-error-page__title">Страница не найдена</h1>
      <p class="o-error-page__text">…</p>
      <div class="o-error-page__actions">
        <a class="a-button a-button--m a-button--black" href="…">На главную</a>
        <a class="a-button a-button--m a-button--white" href="…">Журнал</a>
      </div>
    </div>
  </main>
</body>
```

## CSS

`bundles/error.css` on `src/404.html`
