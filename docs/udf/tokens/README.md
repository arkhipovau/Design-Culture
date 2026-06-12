# Design Tokens

Source palette and typography scale from Figma (project-approved tokens).

## Base
- `--color-black` `#212121`
- `--color-light-grey` `#FAFAFA`
- `--color-coloring-grey` `#E9E8E9`

## Accent
- `--color-coloring-green` `#008012`
- `--color-coloring-violet` `#6956FD`
- `--color-coloring-red` `#714043`
- `--color-coloring-light-green` `#BFEC02`
- `--color-coloring-orange` `#FA481E`
- `--color-coloring-dark-grey` `#2B2B2B`
- `--color-coloring-light-blue` `#CBE2F3`

## UI
- `--color-elements` `#F4F4F4` + `--opacity-elements: 0.64`
- `--color-animated-text` `#E7E7E7`
- `--color-outside-elements` `#EEEEEE`
- `--color-dark-grey` `#818181`
- `--color-secondary-white` `#FFFFFF` + `--opacity-secondary-white: 0.5`
- `--color-white` `#FFFFFF`
- `--color-medium-grey` `#AFAFAF`

## Utility neutrals (current layout support)
- `--color-neutral-caption` `#565656`
- `--color-neutral-scroll-track` `#D9D9D9`
- `--color-neutral-surface` `#EFEFEF`
- `--color-neutral-gradient-a` `#ECEBEC`
- `--color-neutral-gradient-b` `#D8D8D8`

Token files:
- `udf/tokens/colors.css`
- `udf/tokens/typography.css`
- `udf/tokens/grid.css`

## Grid

Layout grid (Figma-aligned):
- Desktop: `12` columns, `56px` margins, `4px` gutter
- Tablet: `12` columns, `28px` margins, `4px` gutter
- Mobile: `4` columns, `10px` margins, `4px` gutter

Viewport policy:
- `1440..1919`: desktop base rail uses locked content width (`1330px` max)
- `1920+`: wide desktop rail switches to stretch width (`100% – 2 * margin`)

Core tokens:
- `--grid-columns`
- `--grid-gutter`
- `--grid-margin`
- `--grid-content-width-fluid`
- `--grid-content-width-locked`
- `--grid-content-width-wide`
- `--grid-content-width`

## Typography

Active semantic tokens:
- `--type-h1` / `--type-h1-lh`
- `--type-h2` / `--type-h2-lh`
- `--type-h3` / `--type-h3-lh`
- `--type-body-xl` / `--type-body-xl-lh`
- `--type-button-xl` / `--type-button-xl-lh`
- `--type-body-s` / `--type-body-s-lh`
- `--type-button-s` / `--type-button-s-lh`
- `--type-body-xs` / `--type-body-xs-lh`

Scale by breakpoint (size/line-height):
- Desktop: H1 `80/100`, H2 `36/100`, H3 `30/120`, Body XL `18/140`, Button XL `16/130`, Body S `14/130`, Button S `13/120`, Body XS `12/120`
- Tablet: H1 `80/100`, H2 `32/100`, H3 `28/120`, Body XL `16/140`, Button XL `16/130`, Body S `14/130`, Button S `13/120`, Body XS `12/120`
- Mobile: H1 `36/100`, H2 `32/100`, H3 `22/120`, Body XL `16/140`, Button XL `16/130`, Body S `14/130`, Button S `13/120`, Body XS `12/120`

Audit/debug tokens are exposed for all breakpoints, including:
- `--type-h1-desktop-tablet: 80px`
