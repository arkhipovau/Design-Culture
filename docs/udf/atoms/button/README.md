# A_Button_M / A_Button_S

Shared button atom with two sizes and two color themes.

## Base class
- `.a-button`

## Size modifiers
- `.a-button--m` (`190x40`, text 16px)
- `.a-button--s` (`132x40`, text 13px)

## Color modifiers
- `.a-button--white`
- `.a-button--black`

## States
- Default: base styles
- Hover: `:hover` or `.is-hover`
- Pressed: `:active` or `.is-pressed`
- Unable: `disabled`, `[aria-disabled="true"]`, `.is-disabled`, or `.is-unable`

## Figma-specific note
- `A_Button_M` with `Color=Black` uses light pressed style (`#EEEEEE` background, dark text).
- `A_Button_S` with `Color=Black` keeps dark pressed style (`#212121`, white text).
