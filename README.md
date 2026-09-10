# Canvas Crop

**A free, private, professional-grade image cropping tool — entirely in your browser.**

Crop, rotate, flip, and export images at full native resolution with no uploads, no accounts, and no tracking. What happens in your browser, stays in your browser.

[![Open Source](https://img.shields.io/badge/Open%20Source-MIT-violet?style=flat-square)](https://github.com/ajbatac/canvas-crop/blob/main/LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## Features

### 🎯 Interactive Crop Box
- **8 precision handles** — 4 corner brackets and 4 edge pills, each with a generous touch/pointer hit area
- **Rule-of-thirds composition grid** — 3×3 hairline guide lines inside the live crop region
- **Dark scrim overlay** — uncropped areas are immediately dimmed so you see exactly what you'll get
- **Drag to reposition** — click anywhere inside the crop box to move it
- **Draw a new crop** — click-and-drag anywhere on the image to start a fresh selection

### ⬛ Aspect Ratio Presets
- **Free** — unconstrained freeform selection
- **1:1** — square / avatar
- **16:9** — widescreen / video
- **4:3** — standard photo / presentation
- **9:16** — vertical Stories / Reels
- **3:2** — classic 35mm film
- **2:3** — portrait photo
- **Original** — lock to the uploaded image's own ratio
- **⭕ Circle / Avatar** — circular cutout with transparent PNG export

### 🔄 Orientation Transforms
- Rotate **±90°** (clockwise / counter-clockwise)
- Flip **horizontally** or **vertically**
- All transforms are non-destructive — reset any time

### 📐 Viewport Controls
- **Zoom** (50–250%) and a **Fit to View** button
- Real-time crop dimension badge (`Crop: 1080 × 1080 px`)
- Original resolution and file size shown in the header

### 💾 High-Resolution Export
- **PNG** — lossless, transparency-safe
- **JPEG** — compressed with adjustable quality (via Preview dialog)
- **WebP** — modern format with excellent compression
- **Copy to Clipboard** — instant paste into Figma, Slack, Gmail, etc.
- Crops at **100% native image resolution** — never upsampled or downscaled

### 🔒 Privacy First
- Everything runs in the browser via the Canvas API
- No server, no cloud, no analytics on your images
- Works fully offline once the page loads

### ✨ Other Niceties
- Dark / Light mode
- Keyboard shortcuts: Arrow keys to nudge (Shift × 10px), `Cmd/Ctrl+C` to copy, `Cmd/Ctrl+S` to save
- Responsive layout — works on desktop and mobile
- **Preview modal** before saving: see exact output with format and quality options

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- [npm](https://www.npmjs.com/)

### Local Development

```bash
# Clone the repo
git clone https://github.com/ajbatac/canvas-crop.git
cd canvas-crop

# Install dependencies
npm install

# Start the dev server (runs on http://localhost:9002)
npm run dev
```

### Dockerised Development

```bash
# Build the dev image
docker build -t canvas-crop-dev -f Dockerfile.dev .

# Run with hot reload
docker run -p 9002:9002 -v .:/app canvas-crop-dev
```

---

## Deployment

Canvas Crop compiles to a static Next.js export and can be deployed anywhere.

### Production Build

```bash
npm run build   # Generates .next/ output
npm start       # Runs the production server
```

### Docker Production

```bash
docker build -t canvas-crop-prod -f Dockerfile.prod .
docker run -p 3000:3000 canvas-crop-prod
# Available at http://localhost:3000
```

Compatible with **Vercel**, **Netlify**, **Firebase App Hosting**, **Cloudflare Pages**, **Google Cloud Run**, and any Node-capable host.

---

## Project Structure

```
canvas-crop/
├── public/                      # Static assets (icons, manifest)
├── src/
│   ├── app/
│   │   ├── changelog/           # Changelog page
│   │   ├── legal/               # Terms, Privacy, DMCA, Cookie, etc.
│   │   ├── globals.css          # Design tokens & animations
│   │   ├── layout.tsx           # Root layout + SEO metadata
│   │   └── page.tsx             # Landing page & editor shell
│   ├── components/
│   │   ├── crop/
│   │   │   └── crop-preview-dialog.tsx  # Export preview modal
│   │   ├── ui/                  # Radix-based shadcn/ui primitives
│   │   ├── file-uploader.tsx    # Drag-and-drop upload zone
│   │   ├── image-editor.tsx     # Core crop studio (canvas-based)
│   │   ├── footerCopyright.tsx  # Footer with legal links
│   │   ├── theme-provider.tsx   # next-themes wrapper
│   │   └── theme-toggle.tsx     # Dark / Light switch
│   ├── hooks/
│   │   └── use-toast.ts         # Toast notification hook
│   └── lib/
│       ├── crop-utils.ts        # Geometry math, transforms & canvas export
│       └── utils.ts             # Tailwind class merge (cn)
├── Dockerfile.dev               # Dev container configuration
├── Dockerfile.prod              # Production container configuration
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind + typography plugin
└── tsconfig.json                # TypeScript configuration
```

---

## Tech Stack

| Library | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org/) | React framework (App Router + Turbopack) |
| [React 18](https://react.dev/) | Component model |
| [TypeScript 5](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible UI primitives (Radix) |
| [Lucide React](https://lucide.dev/) | Icon library |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/light mode |
| Canvas API | All image processing |

---

## Troubleshooting

**"Could not copy image to clipboard"**
This feature requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS or `localhost`). It will not work over plain HTTP in production.

**Output looks slightly different from the editor preview**
The canvas uses the browser's built-in bilinear interpolation for screen rendering. The final exported file is always rendered directly from the original image pixels — no quality is lost.

**JPEG/WebP with transparency**
Transparent areas are rendered with a white background when exporting to JPEG (which does not support transparency). Use PNG or WebP for images with transparent regions.

---

## Contributing

Issues and pull requests are welcome! Please open an issue first to discuss what you'd like to change.

---

Created with ❤️ by [AJ Batac (@ajbatac)](https://ajbatac.github.io/?=CanvasCrop) — [changelog](/changelog)
