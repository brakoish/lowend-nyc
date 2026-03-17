# LOWEND NYC Color Palette

## Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Deep Black | `#0A0A0A` | rgb(10, 10, 10) | Primary background, logo fill |
| Pure White | `#FFFFFF` | rgb(255, 255, 255) | Text on dark, inverse logo |
| Accent Red | `#FF2B2B` | rgb(255, 43, 43) | Favicon accent, CTAs, highlights |

## Secondary/Extended

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Soft Black | `#141414` | rgb(20, 20, 20) | Card backgrounds, sections |
| Dark Gray | `#1A1A1A` | rgb(26, 26, 26) | Borders, dividers |
| Medium Gray | `#666666` | rgb(102, 102, 102) | Secondary text, muted |
| Light Gray | `#A3A3A3` | rgb(163, 163, 163) | Tertiary text |

## Usage Guidelines

- **Backgrounds**: Deep Black (#0A0A0A) for primary, Soft Black (#141414) for cards
- **Text**: Pure White for primary, Light Gray for secondary
- **Accents**: Accent Red sparingly — favicon, hover states, important CTAs
- **Borders**: Dark Gray at 1px for subtle separation

## CSS Variables

```css
:root {
  --color-bg-primary: #0A0A0A;
  --color-bg-secondary: #141414;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A3A3A3;
  --color-text-muted: #666666;
  --color-border: #1A1A1A;
  --color-accent: #FF2B2B;
}
```

## Export Files

- `lowend-colors.ase` — Adobe Swatches
- `lowend-colors.sketchpalette` — Sketch
- `lowend-colors.figma` — Figma (JSON)
