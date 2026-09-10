# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-09-09

### Added
- **Crop Preview & Format Export Modal (`src/components/crop/crop-preview-dialog.tsx`)**:
  - Implemented `CropPreviewDialog` component using `@radix-ui/react-dialog` primitives (`src/components/ui/dialog.tsx`).
  - Allows previewing final cropped imagery prior to export with live blob generation and byte-size indicators:
    ```typescript
    const blob = await exportCanvasToBlob(canvas, selectedFormat, quality);
    const sizeInKb = (blob.size / 1024).toFixed(1);
    ```
  - Format switching across PNG, JPEG, and WebP with adaptive quality slider (`quality: number` from `0.1` to `1.0`).
  - Direct clipboard copy via `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])` with toast confirmations (`src/hooks/use-toast.ts`).
- **Mathematical Transformation Engine (`src/lib/crop-utils.ts`)**:
  - Extracted geometric crop math, non-destructive rotation (`±90°`), horizontal/vertical flip logic, and aspect ratio resolution into standalone pure functions:
    ```typescript
    export function resolveAspectRatio(ratio: AspectRatioPreset, imageWidth: number, imageHeight: number): number | null {
      switch (ratio) {
        case '1:1': return 1;
        case '16:9': return 16 / 9;
        case '4:3': return 4 / 3;
        case '9:16': return 9 / 16;
        case '3:2': return 3 / 2;
        case '2:3': return 2 / 3;
        case 'original': return imageWidth / imageHeight;
        case 'circle': return 1;
        case 'free': default: return null;
      }
    }
    ```
  - High-resolution off-screen canvas extraction via `getCroppedCanvas()` preserving native source pixel density.
- **Centralized Constants (`src/lib/constants.ts`)**:
  - Defined single sources of truth for `REPO_URL`, `AUTHOR_URL`, `CANONICAL_URL`, `APP_VERSION` (`'2.0.0'`), and `APP_NAME`.
- **Feed & Discovery Endpoints**:
  - Dynamic RSS route handler at `src/app/changelog/rss/route.ts` returning validated RSS 2.0 XML with full bulleted descriptions.
  - Public static discovery files: `public/sitemap.xml`, `public/robots.txt`, `public/rss.xml`, and `public/llms.txt`.

### Changed
- **Next.js Engine Upgrade**:
  - Upgraded Next.js to version `15.5.25` in `package.json` and `package-lock.json` for enhanced Turbopack compilation performance and security updates.
- **Strict TypeScript Governance (`tsconfig.json`)**:
  - Enforced `noUncheckedIndexedAccess: true` and `noImplicitOverride: true` under `strict: true`.
  - Added explicit typing across all component callbacks and DOM event handlers.
- **Image Editor Refactor (`src/components/image-editor.tsx`)**:
  - Separated concerns between presentation controls, canvas rendering loops, and pointer event normalization.
  - Implemented circular avatar mask preview overlay and composition grid (rule-of-thirds).
- **Footer Attribution (`src/components/footer-copyright.tsx`)**:
  - Made both `v2.0.0` and `changelog` clickable links pointing to `/changelog`.
  - Typed legal routes using readonly tuple `legalLinks`.

### Fixed
- Fixed coordinate calculation edge cases when dragging resize handles under non-default zoom levels.
- Fixed aspect ratio drift on canvas resize by locking coordinate scaling in `src/lib/crop-utils.ts`.

## [1.2.0] - 2025-08-30

### Changed
- Improved the UI of the resize handles to have rounded corners and a more prominent hover effect.
- The image border is now thin and grey by default, becoming thicker and primary-colored on handle hover for a cleaner look.

### Fixed
- Corrected a bug where dragging the top resize handles caused the image to resize in the wrong direction.

## [1.1.0] - 2025-08-28

### Added
- Implemented a dark/light mode theme toggle using `next-themes`.
- Added a `ThemeProvider` and a `ThemeToggle` button component.
- Placed the theme toggle in the header of all pages for easy access.
- Added an "Open Source" link to the main page footer.

### Changed
- Updated the introductory text on the homepage for clarity and conciseness.
- Updated documentation (`README.md`, `CHANGELOG.md`) to reflect the latest changes.
- Incremented the project version to `1.1.0`.

## [1.0.3] - 2025-08-28

### Changed
- Refactored image editor event handling to support both mouse and touch events, fixing mobile Safari compatibility.
- Corrected image resizing logic to strictly maintain aspect ratio and prevent distortion.
- Fixed a bug preventing the image from appearing on desktop after mobile fixes were implemented.
- Corrected the cropping logic to ensure the output image is properly cropped to the canvas boundaries.

### Fixed
- Resolved a console error caused by an incorrect prop name (`onValueValueChange`) in the `Slider` component.

## [1.0.2] - 2025-08-28

### Added
- Comprehensive legal pages: `Terms of Service`, `Privacy Policy`, `DMCA Policy`, `Cookie Policy`, `Disclaimer`, and `UGC Disclaimer`.
- New `legal-page.tsx` component to provide a consistent layout for all legal documents.
- Added `@tailwindcss/typography` plugin for improved content formatting on legal pages.
- Added favicon, apple-touch-icon, and web manifest links to the main layout.

### Changed
- Updated the footer to include a dedicated section with links to all legal pages.
- Updated project documentation (`README.md`, `CHANGELOG.md`) to reflect the latest changes and dependencies.
- Incremented the version number in the footer and documentation to `v1.0.2`.

## [1.0.1] - 2025-08-28

### Added
- Created a new changelog page at `/changelog` to dynamically display project updates.
- Updated all links to point to the new `/changelog` route.

### Changed
- Updated documentation (`README.md`, `CHANGELOG.md`) to reflect recent changes.
- Incremented the version number in the footer to `v1.0.1`.

### Removed
- Deleted the static `public/changelog.html` file in favor of the new dynamic page.

## [1.0.0] - 2024-08-01

### Added
- Initial release of Canvas Crop.
- Core functionality: image upload, resize, pan, and zoom.
- Ability to download the cropped image as a PNG.
- Ability to copy the cropped image to the clipboard.
- User interface built with Next.js, ShadCN, and Tailwind CSS.
- Docker support for both development and production environments.
- Comprehensive `README.md` for setup and deployment.

### Changed
- Simplified image resizing logic for better performance and maintainability.
- Refined cursor behavior to indicate resize and pan actions more clearly.

### Removed
- Removed unused UI components and hooks to streamline the project.
- Stripped out initial AI and upscaling-related features to focus on a simple, fast resizer.
