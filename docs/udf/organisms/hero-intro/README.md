# O_HeroIntro

Animated headline block with inline image pills. Two runtime modes:

| Page | Modifier | Animation | Layers |
|------|----------|-----------|--------|
| Homepage | — | scroll wave (`micro-animations.js`) | `__under` + `__over` |
| About | `o-hero-intro--about` | timer ~5.6s | `__under` + `__pills` + `__over` |

## Markup (homepage)

```html
<section class="o-hero-intro a-section" data-reading="…">
  <div class="o-hero-intro__copy">
    <div class="o-hero-intro__layout">
      <div class="o-hero-intro__under" aria-hidden="true">…</div>
      <div class="o-hero-intro__over">…</div>
    </div>
  </div>
</section>
```

## Markup (about)

```html
<section class="o-hero-intro o-hero-intro--about a-section" data-reading="…">
  <div class="o-hero-intro__copy">
    <div class="o-hero-intro__layout">
      <div class="o-hero-intro__under" aria-hidden="true">…</div>
      <div class="o-hero-intro__pills" aria-hidden="true">…</div>
      <div class="o-hero-intro__over">…</div>
    </div>
  </div>
</section>
```

## Elements

| Class | Role |
|-------|------|
| `__copy` | Centered text container |
| `__layout` | Relative stack for layers |
| `__under` | Grey base text |
| `__over` | Animated reveal layer (`--p` per word/pill) |
| `__pills` | About only — visible pill images synced from `__over` |
| `__word` | Animated word token |
| `__tie` | No-break word group (mobile) |
| `__pill` / `__pill--a` `--b` `--c` | Inline image pill |
| `__pill-slot` | Spacer in `__under` layer |
| `__pill-inner` | Pill image frame |
| `__break` / `__break--mobile` | Responsive line breaks |
| `__studios-line` / `__studios--desktop` / `__studios--mobile` | Studios phrase layout |

## CSS

- `o-hero-intro.css` — via `bundles/home.css` (index) and `bundles/about.css` (about)

## JS

- `udf/runtime/micro-animations.js` — `setupHeroIntro()`, `--p` wave, About `__pills` sync

Do not change pill slot size (80px), inner offset, or About layer order without visual QA on both pages.
