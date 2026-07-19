# deFindings — мануал проекта

**Статус: WIP (Work In Progress)**

Сайт **defindings.com** — медиа о дизайн-культуре (HSE Art&Design School).  
Первая публичная версия готовится; сейчас на проде действует **заглушка с паролем**.  
Внутренний контент, вёрстка и производительность дорабатываются.

> Этот файл — единая точка правды для команды: как устроен проект, как им пользоваться и что ещё не готово.  
> Детали UI-системы: [`src/udf/README.md`](src/udf/README.md).

---

## 1. Быстрый старт

| Что | Где / как |
|-----|-----------|
| **Прод** | https://defindings.com |
| **Репозиторий** | `arkhipovau/Design-Culture`, ветка **`gh-pages`** |
| **Источник правды** | `src/` |
| **Деплой GitHub Pages** | `docs/` (генерируется, не править руками) |
| **Пароль заглушки** | `1977` (см. §5) |
| **Сборка перед пушем** | `npm run build` → commit → push `gh-pages` |

```bash
npm install
npm run build          # src → docs + clean URLs
npm run watch          # следить за src/ и пересобирать docs/
```

Локальный превью (webpack):

```bash
npm run build          # сначала собрать docs/
npm run dev:webpack    # http://localhost:8080 — отдаёт docs/, не src/
```

Webpack следит за `src/` и перезагружает страницу, но **сначала нужен build**, иначе увидишь старый `docs/`.

---

## 2. WIP — что сейчас «в процессе»

### Сайт как продукт

- [ ] **Публичный запуск** — заглушка включена (`site-gate`, пароль `1977`)
- [ ] **Контент интервью** — у многих спикеров фото ещё не подключены (см. [`assets/interviews/README.md`](assets/interviews/README.md))
- [ ] **Печатный выпуск** — ссылка на Calameo на главной (внешний сервис, не в репо)
- [ ] **Производительность изображений** — Phase 0 частично сделан; Phase 1 (`srcset` / `<picture>`) — в планах
- [ ] **Сфера hero** — работает с `maxTex=512` и очередью загрузки; zoom на главной пока выключен (тест: `/sphere-test/`)
- [ ] **Поиск** — размеры типографики могут быть увеличены (обсуждалось)
- [ ] **Аналитика** — GA / Яндекс.Метрика только после согласия cookie banner

### Технический долг / известные ограничения

- GitHub Pages кэширует файлы **~10 минут** (`max-age=600`) — после деплоя иногда нужен hard refresh (`Cmd+Shift+R`)
- Не все картинки имеют `?v=` cache-bust — браузер может держать старые версии до принудительного обновления
- `sync-docs` + `clean-urls.js` **критичны**: нельзя ломать абсолютные пути `/images/`, `//` в JS-комментариях и regex
- Статистика **GitHub → Traffic → Clones** — это скачивания репозитория, **не** посещаемость defindings.com

---

## 3. Как устроен деплой

```
src/  ──npm run build──►  docs/  ──push gh-pages──►  defindings.com
```

1. Все правки — в **`src/`**
2. `node scripts/sync-docs.js` копирует `src/` → `docs/`
3. `scripts/clean-urls.js` переписывает URL (см. §6)
4. В `docs/` пишутся `.nojekyll` и `CNAME` (`defindings.com`)
5. Push в **`gh-pages`** → GitHub Pages обновляет сайт за 1–2 минуты

**⚠️ CI/CD:** в `.github/workflows/build.yml` есть workflow на ветку `main`, который вызывает несуществующий `sync-docs.mjs`. **Фактический деплой сейчас — ручной push в `gh-pages`** после `npm run build`. Workflow можно починить или отключить.

**Не редактировать `docs/` напрямую** — изменения затрутся при следующем `sync-docs`.

После правок CSS/бандлов, которые `@import` вложенные файлы:

```bash
node scripts/bump-cache.js        # обновить ?v= во всех HTML
npm run build
```

---

## 4. Структура репозитория

```
src/
  index.html              # главная
  404.html
  pages/                  # разделы и интервью (исходники HTML)
  images/                 # все медиа сайта + manifest.json для сферы
  stylesheets/            # глобальный reset (index.css)
  udf/                    # дизайн-система (см. src/udf/README.md)
    tokens/               # цвета, типографика, сетка
    quarks/               # иконки, брендинг, findings overlay
    atoms/ molecules/ organisms/ superorganisms/
    bundles/              # CSS-бандлы по типу страницы
    templates/            # t-site, t-interview, t-site-minimal
    runtime/              # site-gate, micro-animations, preview-lock
  pages/sphere-runtime-v2.js   # WebGL-сфера (копируется в docs/sphere-embed/)

content/
  interviews/*.md         # тексты интервью (источник для sync-скриптов)
  interviews-meta.json

scripts/                  # сборка, миграции, медиа, проверки
docs/                     # ← деплой (генерируется)

assets/interviews/        # исходники фото для пайплайна (не на сайте напрямую)
```

---

## 5. Заглушка (site gate) — как пользоваться

**Файлы:** `src/udf/runtime/site-gate.js`, `site-gate.css`

| Параметр | Значение |
|----------|----------|
| Включена | `enabled: true` |
| Пароль | `1977` |
| Хранение разблокировки | `sessionStorage` (`defindings-site-unlock-v2`) — только в этой вкладке/сессии браузера |
| Без пароля | главная: сфера + панель «Сайт строится»; остальные URL → редирект на `/` |
| Обход | `/sphere-embed/`, `/sphere-test/` (без gate) |

**Для команды после входа:** полный сайт — меню, журнал, галерея, интервью, поиск.

**Выключить заглушку перед публичным запуском:**

```javascript
// src/udf/runtime/site-gate.js
enabled: false,
```

Затем `npm run build` → commit → push.

**robots:** пока gate активен, на страницах ставится `noindex, nofollow`.

---

## 6. URL-структура (clean URLs)

Публичные адреса **без `.html`**:

| Раздел | URL |
|--------|-----|
| Главная | `/` |
| Журнал | `/journal/` |
| Галерея | `/gallery/` |
| О проекте | `/about/` |
| Рассылка | `/newsletter/` |
| Privacy | `/privacy/` |
| Интервью | `/interviews/{slug}/` |
| Сфера (embed) | `/sphere-embed/` |
| Лаборатория сферы | `/sphere-test/` |

Старые пути `pages/*.html` редиректят на новые.

**В HTML всегда абсолютные пути:** `/udf/...`, `/images/...`, `/stylesheets/...`

---

## 7. Как пользоваться сайтом (для редакции)

### Навигация

- **Меню** (бургер) — разделы: главная, журнал, галерея, рассылка, о проекте
- **Поиск** (лупа) — по страницам и интервью; горячие клавиши: `/`, `Cmd+K`
- **Sticky pill** внизу — «Вы читаете …» при скролле длинных страниц

### Разделы

- **Главная** — hero-сфера, анимированный заголовок, превью журнала, выпуск, split-links
- **Журнал** — фильтры (год, тип, город), карточки интервью
- **Галерея** — сетка / слайдер, lightbox с превью
- **Интервью** — hero с портретом, Q&A, фото-слоты, «читать дальше»
- **About / Privacy** — о проекте и политика

### Preview-ссылка для героя (без обхода всего сайта)

```bash
node scripts/preview-link.js sergey-breus
# → https://defindings.com/interviews/sergey-breus/?preview=1
```

Режим `?preview=1`: баннер, `noindex`, блокировка переходов на другие страницы (`preview-lock.js`).

---

## 8. Редакционный workflow

### Новое / правка интервью

1. Текст — `content/interviews/{slug}.md` (опционально sync в HTML)
2. HTML — `src/pages/interviews/{slug}.html` или шаблон:

```bash
node scripts/render-interview-from-template.js --check    # проверка всех
node scripts/render-interview-from-template.js masha-chern  # пересборка одного
node scripts/sync-interview-body-from-md.js                 # body из markdown
```

3. Фото — `src/images/interviews/{slug}/`
4. Портрет журнала — `src/images/{Имя Фамилия}.webp` (или `.jpg`)

### Медиа

```bash
# WebP, q100 / lossless — без потери качества
node scripts/convert-interview-media.js --dry-run
node scripts/convert-interview-media.js --slug maxim-aksenov --rewrite

# Удалить orphan JPG/PNG, если есть WebP-дубликат и нет ссылок в src/
node scripts/prune-orphan-rasters.js --dry-run
node scripts/prune-orphan-rasters.js --delete

# Ужать слишком большие WebP (только resize, q100)
node scripts/resize-overscaled-images.js --dry-run
node scripts/resize-overscaled-images.js

# MP4 (ffmpeg)
node scripts/reencode-interview-video.js --dry-run --slug dariia-chertanova
```

**Табoo:** не снижать visual quality (q &lt; 95). Можно уменьшать **размер в пикселях** под слот отображения.

### Поиск — обновить индекс

```bash
node scripts/sync-search-index.js
```

### Проверки перед релизом

```bash
node scripts/check-site-shell.js --check
node scripts/render-interview-from-template.js --check
npm run build
```

---

## 9. Сфера (hero)

| | |
|--|--|
| Embed на главной | `<iframe src="/sphere-embed/?v=…&sphereScale=0.8&maxTex=512">` |
| Runtime | `src/pages/sphere-runtime-v2.js` → `docs/sphere-embed/` |
| Текстуры | `src/images/manifest.json` (67 файлов) |
| Three.js | CDN jsDelivr |

**Лаборатория:** https://defindings.com/sphere-test/ — пресеты Production / Fast 512 / Fast + zoom / Defer.

**Параметры URL:** `embed=1`, `sphereScale`, `maxTex`, `interactive=1`, `stats=1`, `manifest=…`

Загрузка текстур: очередь (6 параллельно) + retry — чтобы GitHub Pages HTTP/2 не рвал соединения.

---

## 10. UDF — дизайн-система (кратко)

Atomic Design с префиксами:

| Слой | Префикс | Пример |
|------|---------|--------|
| Tokens | — | `--color-black`, `--grid-content-width` |
| Quarks | `q-` | иконки, favicon, findings overlay |
| Atoms | `a-` | `a-button`, `a-tag`, sticky-scroll |
| Molecules | `m-` | `m-journal-card`, `m-qa-row` |
| Organisms | `o-` | `o-interview-hero`, `o-journal-listing` |
| Superorganisms | `s-` | `s-menu`, `s-footer`, lightbox |
| Bundles | — | `shell.css`, `home.css`, `interview.css` |

**Shell на каждой странице:**

```html
<body class="o-site-shell">
  <div class="q-findings-overlay">
  <header class="s-menu"> … иконки поиска и меню в HTML …
  <main> …
  <div class="a-sticky-scroll-wrap"> …
  <footer class="s-footer">
```

Меню инициализирует `menu-overlay.js` (оверлей, поиск).

---

## 11. Cookie, рассылка, аналитика

- **Cookie consent** — `m-cookie-consent.js`; после «Принять» подгружается `analytics.js`
- **MailerLite** — форма на главной / newsletter; account `2370552`
- **Favicon** — light/dark по `prefers-color-scheme` в `udf/quarks/branding/`

---

## 12. Roadmap (согласованный план)

### Phase 0 — быстрые победы ✅ частично

- [x] Orphan JPG/PNG cleanup (~270 MB)
- [x] Resize about / maxim overscaled assets
- [x] Journal `fetchpriority` — только 2 верхние карточки
- [x] Gallery lightbox thumbs — lazy load
- [x] Site gate + clean URLs + fix sync-docs JS corruption
- [x] Sphere: regex fix, queue loading, `maxTex=512` on homepage
- [ ] MP4 re-encode (dariia) — скрипт есть, нужен визуальный QA

### Phase 1 — responsive images (planned)

- `scripts/generate-responsive-images.js`
- `<picture>` + `srcset` для journal cards, interview body, gallery
- Quality: q100 WebP, resize to 2× display width

### Phase 2 — AVIF, lazy video (planned)

### Sphere production (optional)

- Promote `interactive=1` + defer iframe after QA on `/sphere-test/`

---

## 13. Чеклист: типичный пуш на прод

```bash
# 1. Правки в src/
# 2. При необходимости — медиа-скрипты
npm run build
node scripts/check-site-shell.js --check

# 3. Проверить локально docs/ или после деплоя:
#    - главная: сфера, меню, пароль
#    - /journal/, /gallery/, одно интервью

git add -A
git commit -m "…"
git push origin gh-pages

# 4. Через 1–2 мин: hard refresh на defindings.com
# 5. Если CSS «не обновился»: node scripts/bump-cache.js && build && push
```

---

## 15. Модель контента

### Два типа материалов в `/interviews/`

| Тип | Slug-примеры | Формат |
|-----|--------------|--------|
| **Живые интервью** | `masha-chern`, `aleksey-pyankov`, … | Q&A (`m-qa-row`), портрет, фото-слоты |
| **История (эссе)** | `bauhaus`, `dieter-rams`, `ai-era`, … (9 шт.) | Секции h2, sticky TOC, pull-quotes |

История генерируется скриптом:

```bash
node scripts/generate-history-materials.js
```

Обновляет HTML, `content/interviews-meta.json`, карточки в журнале (идемпотентно).

### `content/interviews-meta.json` — реестр

Единый источник для:

- порядка карточек в журнале (`order[]`)
- метаданных героев (author, meta, hero, about, links)
- синхронизации поиска (`sync-search-index.js`)

**22 живых интервью + 9 history = 31 материал** в `src/pages/interviews/`.

### Markdown → HTML

```bash
node scripts/sync-interview-body-from-md.js   # Q&A из content/interviews/*.md
node scripts/render-article-info-links.js     # блок ссылок в footer интервью
node scripts/inject-article-share.js          # кнопки «поделиться»
```

### Подключение проектных фото

1. Исходники кладут в `assets/interviews/{slug}/`
2. На сайт — `src/images/interviews/{slug}/`
3. В HTML — `m-photo-slot` через:

```bash
node scripts/wire-project-images.js          # общий пайплайн + gallery-data
node scripts/wire-stefan-lashko-images.js    # точечные (legacy)
node scripts/wire-togetherwithyou-images.js
```

Статус по спикерам: [`assets/interviews/README.md`](assets/interviews/README.md).

---

## 16. Галерея

- **Данные:** `src/pages/gallery-data.js` (~248 записей) → после build: `docs/gallery/gallery-data.js`
- **UI:** `src/pages/gallery.js` — сетка, lightbox, lazy thumbs
- **Обновление данных:** в основном через `wire-project-images.js` (при wiring фото интервью)

Фильтры журнала — отдельно: `src/pages/journal-filters.js` (client-side по `data-tags` на карточках).

---

## 17. Справочник scripts/ (основные)

| Скрипт | Назначение |
|--------|------------|
| `sync-docs.js` | **Главная сборка** src → docs + clean URLs |
| `clean-urls.js` | Переписывание путей (только в docs/) |
| `bump-cache.js` | Обновить `?v=` во всех HTML |
| `check-site-shell.js --check` | Shell на всех страницах |
| `render-interview-from-template.js` | Сборка/проверка интервью из `t-interview.html` |
| `sync-interview-body-from-md.js` | Текст Q&A из markdown |
| `sync-search-index.js` | Поиск в меню из meta.json |
| `generate-history-materials.js` | 9 history-эссе |
| `convert-interview-media.js` | PNG/JPEG → WebP (q100) |
| `prune-orphan-rasters.js` | Удаление дубликатов JPG/PNG |
| `resize-overscaled-images.js` | Resize about/maxim WebP |
| `reencode-interview-video.js` | MP4 через ffmpeg |
| `wire-project-images.js` | Фото в интервью + gallery-data |
| `preview-link.js` | URL для гостевого preview |
| `inject-site-gate.js` | Вставить site-gate в новые HTML |
| `inject-search-matching.js` | search-matching перед menu-overlay |
| `test-search-matching.js` | Тест морфологии поиска |
| `repair-interview-html.js` | Аварийный repair HTML интервью |
| `normalize-dashes.js` | En-dash вместо em-dash |
| `relocate-interview-quotes.js` | Pull-quotes inline |
| `mark-instagram-mentions.js` | Разметка @instagram |
| `init-interview-asset-folders.js` | Создать папки assets |

**`scripts/archive/`** — одноразовые миграции, не для повседневной работы.

---

## 18. clean-urls.js — правила (не ломать)

При `sync-docs` для **HTML** переписываются относительные пути → абсолютные `/udf/`, `/images/`.

Для **JS**:
- **не** схлопывать `//` (ломает комментарии и regex)
- **не** превращать `/images/` в `//images/` (ломает URL на проде)

Если после деплоя «сфера белая» или `SyntaxError` в консоли — проверь, что `clean-urls.js` не испортил JS в `docs/`.

---

## 19. Troubleshooting

| Симптом | Что проверить |
|---------|----------------|
| Старый CSS | `node scripts/bump-cache.js` → build → push; hard refresh |
| Старые картинки | Hard refresh; для about есть `?v=202606251` |
| Сфера пустая / белые тайлы | Консоль iframe `/sphere-embed/`; `ERR_HTTP2` → queue уже в runtime; hard refresh |
| `https://images/...` в Network | Сломанный `clean-urls` — пересобрать docs |
| Меню без иконок | Иконки в HTML + `menu-overlay.js` без SyntaxError |
| Gate не пускает после пароля | `sessionStorage`; закрыть все вкладки defindings.com |
| Поиск не находит интервью | `node scripts/sync-search-index.js` |
| Webpack показывает старое | `npm run build` перед `dev:webpack` |

---

## 20. Связанные файлы документации

| Файл | Содержание |
|------|------------|
| [`MANUAL.md`](MANUAL.md) | этот мануал |
| [`src/udf/README.md`](src/udf/README.md) | UDF, страницы, shell, checks |
| [`assets/interviews/README.md`](assets/interviews/README.md) | статус фото по спикерам |
| [`scripts/archive/README.md`](scripts/archive/README.md) | архив миграций |

---

## 21. Контакты и контекст

- **Проект:** deFindings — медиа о дизайн-культуре, диплом HSE Art&Design School
- **Домен:** defindings.com (GitHub Pages + CNAME)
- **Язык интерфейса:** русский

---

*Последнее обновление мануала: июль 2026. Не исчерпывающий список — при новых скриптах, gate или WIP дополняй §2, §17 и §19.*
