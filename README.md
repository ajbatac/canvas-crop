# Canvas Crop

**A free, private, professional-grade image cropping tool — entirely in your browser.**

Crop, rotate, flip, and export images at full native resolution with no uploads, no accounts, and no tracking. What happens in your browser, stays in your browser.

[![Open Source](https://img.shields.io/badge/Open%20Source-MIT-violet?style=flat-square)](https://github.com/ajbatac/canvas-crop/blob/main/LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## Overview

Canvas Crop is an open-source, client-side web application engineered for quick, privacy-conscious image editing. Unlike traditional online tools that upload your private photos to remote cloud servers, Canvas Crop executes all image decoding, manipulation, cropping, and encoding locally on your device via the HTML5 Canvas API.

---

## Features

### 🎯 Precision Interactive Cropping
- **Intuitive resize handles** — 8 touch-friendly handles with generous tap targets for effortless adjustment on desktop and mobile.
- **Rule-of-thirds composition grid** — 3×3 guidelines for framing balanced photos and portraits.
- **Live scrim overlay** — Uncropped margins are softly dimmed so you can focus on your exact output.
- **Drag and draw** — Move the crop selection anywhere across your canvas or click-and-drag to start a fresh crop.

### ⬛ Aspect Ratio Presets
- **Freeform** — Unconstrained custom dimensions.
- **1:1** — Square (profile pictures, avatars, social media).
- **16:9** — Widescreen (video, thumbnails, presentations).
- **4:3** — Standard photography.
- **9:16** — Vertical video, Stories, and Reels.
- **3:2 & 2:3** — Classic 35mm photography (landscape and portrait).
- **Original** — Retain your photo's natural proportions.
- **⭕ Circle / Avatar** — Circular avatar cutout with transparent background support.

### 🔄 Non-Destructive Transformations
- Rotate **±90°** clockwise or counter-clockwise.
- Flip **horizontally** or **vertically**.
- Instant reset to return to the original photo at any time.

### 📐 Viewport Controls
- Smooth **Zoom** slider (50% to 250%) and one-click **Fit to View**.
- Live dimension indicator showing exact pixel output in real time.
- Original image resolution and file size display.

### 💾 Flexible Export & Preview
- **Interactive Preview Dialog** — Inspect your cropped photo prior to saving.
- **Multiple Formats** — Export to **PNG** (lossless/transparency), **JPEG** (with adjustable compression quality), or **WebP** (modern high-compression).
- **Copy to Clipboard** — One-click instant copy to paste directly into Figma, Slack, docs, or chat apps.
- **100% Native Resolution** — Crops directly from source pixels, never upscaled or downscaled.

### 🔒 100% Private & Offline-Ready
- Zero server processing. Your images never leave your computer or phone.
- No sign-ups, no accounts, no subscriptions, and no analytics on your files.
- Fully operational offline once loaded.

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v20 or later
- [npm](https://www.npmjs.com/)

### Running Locally

```bash
# Clone the repository
git clone https://github.com/ajbatac/canvas-crop.git
cd canvas-crop

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:9002` in your browser.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Turbopack)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) (Light / Dark mode support)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Processing**: Native HTML5 Canvas API

---

## License & Attribution

Distributed under the MIT License. See [LICENSE](https://github.com/ajbatac/canvas-crop/blob/main/LICENSE) for details.

Created with ❤️ by [AJ Batac (@ajbatac)](https://ajbatac.github.io/?=CanvasCrop) — [v2.0.0](/changelog) ([changelog](/changelog))
