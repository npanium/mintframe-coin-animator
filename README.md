# ⬡ MINTFRAME — 3D Coin Animator

A single-file, browser-based 3D coin renderer and marketing tool for blockchain projects. No install, no backend, no dependencies beyond a browser. Open the HTML file and go.

---

## Features

### 3D Coin

- Physically-based rendering (PBR) with metalness, roughness, and tone mapping
- Lathe-geometry coin with configurable thickness, rim width, and rim step
- Drag-to-rotate or auto-spin modes (Y, X, Z, tumble)
- SVG logo import — paste any `<svg>` or path `d="…"` string to extrude a 3D logo onto the coin face
- Four render styles: Photorealistic, Flat/2D, Cel Shaded, Clay

### Material Presets

Gold, Silver, Copper, Dark, Neon — or fully custom via the color and slider controls.

### Post FX

- **Glow** — screen-blended bloom pass
- **Outline** — alpha-expansion edge detection with custom color and opacity (works on any background color)
- **Grain** — per-pixel film grain
- **Vignette** — radial darkening

### Color Grade

Live hue rotation, saturation, brightness, and contrast sliders applied to the composite output. Bakes into PNG exports.

### Lighting

Key, ambient, and rim lights with adjustable intensity and hue. Exposure control via ACES filmic tone mapping.

### Background

Solid color or uploaded image background. Green screen (`#00ff00`) works for chroma keying in video editors.

### Marketing Overlay

Text overlay system for social media posts:

- Token name, tagline, chain badge
- Custom font (Courier New, Georgia, Arial, Impact, Trebuchet MS, Palatino, Lucida Console)
- Text color, accent color, badge background color
- Gradient bar opacity
- Aspect ratio presets: 1:1 (Instagram), 9:16 (Stories/Reels), 16:9 (Twitter/X banner)

### Price Chart

Live price chart fetched from the CoinGecko public API — no API key required:

- Supports any CoinGecko coin ID (`bitcoin`, `ethereum`, `algorand`, etc.)
- Timeframes: 1H, 1D, 7D, 30D
- Two layout modes: **Background** (full-canvas sparkline) or **Side Panel** (chart alongside text)
- Green/red coloring based on price direction
- Optional price + % change label
- Bakes into PNG export

### Export

- **WebM video** — records the live canvas at 60fps, configurable duration (1–20s)
- **PNG snapshot** — current frame, with optional transparent background
- **PNG sequence** — full 360° rotation as numbered frames, transparent background supported (pipe into ffmpeg for GIF or MP4)

---

## Usage

1. Open `coin-rotator_11.html` in any modern browser
2. Configure coin material, lighting, and logo via the right panel
3. Enable **Marketing Overlay** and set token name, tagline, chain badge
4. Optionally enable **Price Chart** and fetch live data
5. Export via **Save PNG**, **PNG Seq**, or **Record WebM**

**FFmpeg tips:**
```bash
# WebM to MP4
ffmpeg -i coin.webm -c:v libx264 coin.mp4

# PNG sequence to GIF
ffmpeg -r 30 -i coin_%04d.png -vf "fps=30,scale=512:-1" coin.gif

# PNG sequence to MP4 with transparency
ffmpeg -r 30 -i coin_%04d.png -c:v prores_ks -pix_fmt yuva444p10le coin.mov
```

---

## Technical Notes

- Single HTML file, ~1600 lines, no build step
- Three.js r128 loaded from cdnjs
- CoinGecko public API used client-side with no authentication
- PNG sequence downloads frames individually — browser may prompt for permission to download multiple files

---

## License

CC0 1.0 Universal — public domain. No rights reserved. Use for any purpose without attribution.
