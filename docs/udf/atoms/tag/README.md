# A_Tag

Atom for rounded tag chips used in article filtering.

## Base class
- `.a-tag`

## States
- Default: light grey background (`#EEEEEE`), dark grey text (`#818181`)
- Hover: medium grey background (`#C8C8C8`), black text (`#212121`)
- Active: light green background (`#BFEC02`), black text (`#212121`)
- Enable: visually default but locked (`opacity: 0.4`, no hover/click) via `.is-enabled` or `[aria-enabled="true"]`
- Unable: opacity `0.4` via `disabled`, `[aria-disabled="true"]`, or `.is-disabled`
