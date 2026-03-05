# A_Filter

Icon-only circular filter atom (40x40) used as the first control in the journal filters row.

## Base class
- `.a-filter`

## Element
- `.a-filter__icon` (16x16; `q-icon-filter-16-black.svg`)

## States
- Default: light grey background (`#EEEEEE`)
- Enable: visually default but locked (`opacity: 0.4`, no hover/click) via `.is-enabled` or `[aria-enabled="true"]`
- Hover: medium grey background (`#C8C8C8`) via `:hover` or `.is-hover`
- Pressed: black background (`#212121`) + white icon via `:active` or `.is-pressed`
- Unable: opacity `0.4` via `disabled`, `[aria-disabled="true"]`, `.is-disabled`, or `.is-unable`
