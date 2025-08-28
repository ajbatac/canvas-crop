# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
