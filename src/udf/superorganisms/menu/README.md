# S_Menu

Site header pill + fullscreen menu drawer and search overlay.

## Header (`header.s-menu`)

| Element | Class |
|---------|-------|
| Logo link | `s-menu__logo`, `s-menu__logo-mark` |
| Search button | `s-menu__search` |
| Menu button | `s-menu__toggle` |
| Button icon | `s-menu__icon` |

Buttons are present in page markup from first paint; `menu-overlay.js` wires icons and events.

## Overlays (injected by `menu-overlay.js`)

| Layer | Class |
|-------|-------|
| Menu backdrop | `s-menu__layer` |
| Menu drawer | `s-menu__drawer` |
| Menu panel | `s-menu__panel`, `s-menu__main`, `s-menu__card`, `s-menu__links` |
| Search backdrop | `s-menu__search-layer` |
| Search panel | `s-menu__search-panel`, `s-menu__search-form`, `s-menu__search-results`, … |

Open state: `is-open` on layer elements; `menu-open` / `search-open` on `body`.

## Scripts

- `menu-overlay.js` — inject overlays, search index, keyboard shortcuts (`/`, `⌘K`, `Escape`)
- `s-menu.js` — adds `s-menu` class to overlay roots for shared token hooks

Interview titles in search sync from `content/interviews-meta.json`:

```bash
node scripts/sync-search-index.js
```

Search matching (`search-matching.js`) supports Russian word stems, aliases (e.g. `питер` → `петербург`) and prefix overlap. Tests:

```bash
node scripts/test-search-matching.js
```

## Modifiers (page bundles)

- `s-menu--article` — interview pages (`bundles/interview.css`)
- `s-menu--newsletter` — newsletter page (`bundles/newsletter.css`)
