# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
