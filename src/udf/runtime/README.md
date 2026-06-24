# Runtime

Cross-page site behavior loaded after `shell.css` on most pages.

| File | Role |
|------|------|
| `micro-animations.css` | Scroll reveal, menu fade-in, card hover transitions |
| `micro-animations.js` | Widow control, hero-intro wave, intersection reveal, sphere-ready |

```html
<link rel="stylesheet" href="{{ASSET_ROOT}}udf/runtime/micro-animations.css" />
<script defer src="{{ASSET_ROOT}}udf/runtime/micro-animations.js"></script>
```

Not used on `404.html` (minimal shell).
