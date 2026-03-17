# LOWEND NYC Design System

## File Structure

```
design/
├── brand/                  # Core brand assets
│   ├── logo/              # Logo variations (svg, png, favicon)
│   ├── wordmark/          # Wordmark options and finals
│   ├── colors/            # Color palettes, swatches
│   └── typography/        # Font files, type specimens
├── merch/                 # Merchandise design files
│   ├── apparel/
│   │   ├── tshirts/       # T-shirt designs (front/back)
│   │   ├── hats/          # Hat/cap designs
│   │   ├── crewnecks/     # Crewneck/hoodie designs
│   │   └── stickers/      # Sticker sheets, die-cut designs
│   └── digital/
│       ├── wallpapers/    # Desktop/mobile wallpapers
│       ├── banners/       # Social media banners
│       └── social/        # Instagram/Twitter assets
├── exports/               # Production-ready exports
│   ├── web/               # Optimized for web (72dpi, sRGB)
│   ├── print/             # Print-ready (300dpi, CMYK)
│   └── merch-vendor/      # Vendor-specific formats (DTG, screen)
├── mockups/               # Product mockups for presentations
└── archive/               # Old iterations, deprecated assets
```

## Naming Conventions

- **Files**: `lowend-[asset]-[variation]-[size].[ext]`
  - Example: `lowend-wordmark-white-512px.png`
  - Example: `lowend-logo-black-transparent.svg`
  
- **Merch**: `merch-[product]-[design]-[color].[ext]`
  - Example: `merch-tshirt-front-black.png`
  - Example: `merch-sticker-diecut-white.svg`

## Export Specs

| Use Case | Format | DPI | Color Mode | Notes |
|----------|--------|-----|------------|-------|
| Web | PNG/SVG | 72 | sRGB | Optimized, compressed |
| Print | PDF/AI | 300 | CMYK | Bleed + trim marks |
| DTG (merch) | PNG | 300 | sRGB | Transparent BG |
| Screen Print | AI/EPS | 300 | Spot colors | PMS swatches |

## Brand Colors

- **Primary Black**: `#000000`
- **Primary White**: `#FFFFFF`
- **Accent**: TBD

## Typography

- **Headlines**: System sans (current), exploring alternatives
- **Body**: System sans
- **Monospace**: For code/metadata

---

Last updated: 2026-03-16
