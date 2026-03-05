# A_LikeButton

Atom for compact like button (`40x40`) using `Q_Icons` heart quarks.

## Markup
```html
<button class="a-like-button" type="button" aria-pressed="false" data-count="0" aria-label="Лайк">
  <span class="a-like-button__icon" aria-hidden="true"></span>
  <span class="a-like-button__count">0</span>
</button>
```

## States
- Default: dark grey heart outline + dark grey count
- Hover: black heart/count
- Like: orange heart + white count
- Unable: set `disabled`, `aria-disabled="true"`, or `.is-disabled` (opacity `0.4`)

## Behavior
Include `a-like-button.js` for toggle behavior and count update.
