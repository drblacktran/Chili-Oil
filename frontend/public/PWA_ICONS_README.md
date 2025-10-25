# PWA Icons

## Current Status
Using placeholder SVG icon. For production, you need actual PNG files.

## Generate Real Icons

### Option 1: Online Tool (Easiest)
1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload your logo/icon
3. Download the generated icons
4. Replace files in `/public/`

### Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick
brew install imagemagick  # macOS
# or
apt-get install imagemagick  # Linux

# Generate from SVG
convert pwa-icon.svg -resize 192x192 pwa-192x192.png
convert pwa-icon.svg -resize 512x512 pwa-512x512.png
convert pwa-icon.svg -resize 512x512 pwa-maskable-512x512.png
```

### Option 3: Design Tool
1. Open pwa-icon.svg in Figma/Sketch/Illustrator
2. Export as PNG at required sizes:
   - 192x192px (standard)
   - 512x512px (high-res)
   - 512x512px maskable (with safe zone)

## Required Files
- `pwa-192x192.png` - Standard icon
- `pwa-512x512.png` - High-resolution icon
- `pwa-maskable-512x512.png` - Maskable icon (for adaptive icons)

## Maskable Icon Guidelines
- Add 40px padding/safe zone around your logo
- Icon should fit in a circle (will be masked on some devices)
- Background should extend to edges

## Testing
After generating real icons:
1. Build the app: `npm run build`
2. Serve production build: `npm run preview`
3. Test on Chrome DevTools > Application > Manifest
4. Test installation on mobile device

## Screenshots (Optional but Recommended)
For better app store listings, add:
- `screenshot-wide.png` (1280x720) - Desktop view
- `screenshot-mobile.png` (750x1334) - Mobile view
