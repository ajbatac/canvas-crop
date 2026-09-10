/**
 * @fileoverview Utility functions and types for image cropping, canvas transformations,
 * aspect ratio adjustments, and file export operations.
 */

export type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export type CropShape = 'rect' | 'round';

export type ExportFormat = 'png' | 'jpeg' | 'webp';

/**
 * Represents a point in 2D space.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents dimensions in 2D space.
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Represents rectangular crop bounds defined in source image pixel coordinates.
 */
export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Geometric transformation state for an image.
 */
export interface ImageTransform {
  /** Rotation in degrees (0, 90, 180, or 270) */
  rotate: number;
  /** Whether the image is flipped horizontally */
  flipH: boolean;
  /** Whether the image is flipped vertically */
  flipV: boolean;
}

/**
 * Predefined or custom aspect ratio option.
 */
export interface AspectRatioPreset {
  id: string;
  label: string;
  /** Numeric ratio (width/height), null for freeform, or -1 for original ratio */
  value: number | null;
  description?: string;
}

/**
 * Predefined aspect ratio presets available in the editor.
 */
export const ASPECT_RATIOS: readonly AspectRatioPreset[] = [
  { id: 'free', label: 'Free', value: null, description: 'Custom selection' },
  { id: '1:1', label: '1:1', value: 1, description: 'Square / Avatar' },
  { id: '16:9', label: '16:9', value: 16 / 9, description: 'Widescreen / Video' },
  { id: '4:3', label: '4:3', value: 4 / 3, description: 'Standard Photo' },
  { id: '9:16', label: '9:16', value: 9 / 16, description: 'Story / Reel / Mobile' },
  { id: '3:2', label: '3:2', value: 3 / 2, description: '35mm Film' },
  { id: '2:3', label: '2:3', value: 2 / 3, description: 'Portrait Photo' },
  { id: 'original', label: 'Original', value: -1, description: 'Lock original image ratio' },
] as const;

/**
 * Minimum allowable width or height for a crop selection in pixels.
 */
export const MIN_CROP_DIMENSION = 20;

/**
 * Resolves an aspect ratio value, replacing the dynamic sentinel value (-1) with the
 * image's native ratio.
 *
 * @param aspect - Aspect ratio number, null for freeform, or -1 for original ratio
 * @param imageWidth - Width of the reference image
 * @param imageHeight - Height of the reference image
 * @returns Resolved aspect ratio or null if freeform
 */
export function resolveAspectRatio(
  aspect: number | null,
  imageWidth: number,
  imageHeight: number
): number | null {
  if (aspect === null) return null;
  if (aspect === -1) {
    return imageHeight > 0 ? imageWidth / imageHeight : 1;
  }
  return aspect > 0 ? aspect : null;
}

/**
 * Maps an export format enum value to its corresponding MIME type.
 *
 * @param format - Desired export format
 * @returns Corresponding image MIME type string
 */
export function formatToMimeType(format: ExportFormat): string {
  switch (format) {
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'png':
    default:
      return 'image/png';
  }
}

/**
 * Calculates effective image dimensions after applying 90 or 270 degree rotations.
 *
 * @param naturalWidth - Intrinsic image width in pixels
 * @param naturalHeight - Intrinsic image height in pixels
 * @param rotate - Rotation angle in degrees
 * @returns Adjusted dimensions
 */
export function getTransformedDimensions(
  naturalWidth: number,
  naturalHeight: number,
  rotate: number
): Dimensions {
  const isOrthogonal = Math.abs(rotate % 180) === 90;
  return {
    width: isOrthogonal ? naturalHeight : naturalWidth,
    height: isOrthogonal ? naturalWidth : naturalHeight,
  };
}

/**
 * Initializes a centered crop covering ~85% of the image, adhering to the given aspect ratio.
 *
 * @param imageWidth - Reference image width
 * @param imageHeight - Reference image height
 * @param aspect - Aspect ratio number, null for freeform, or -1 for original ratio
 * @returns Initialized pixel crop
 */
export function getInitialCrop(
  imageWidth: number,
  imageHeight: number,
  aspect: number | null
): PixelCrop {
  const targetAspect = resolveAspectRatio(aspect, imageWidth, imageHeight);

  let width: number;
  let height: number;

  if (targetAspect !== null && targetAspect > 0) {
    const imgAspect = imageWidth / imageHeight;
    if (imgAspect > targetAspect) {
      height = imageHeight * 0.85;
      width = height * targetAspect;
    } else {
      width = imageWidth * 0.85;
      height = width / targetAspect;
    }
  } else {
    width = imageWidth * 0.85;
    height = imageHeight * 0.85;
  }

  width = Math.min(imageWidth, Math.max(MIN_CROP_DIMENSION, Math.round(width)));
  height = Math.min(imageHeight, Math.max(MIN_CROP_DIMENSION, Math.round(height)));

  const x = Math.max(0, Math.round((imageWidth - width) / 2));
  const y = Math.max(0, Math.round((imageHeight - height) / 2));

  return { x, y, width, height };
}

/**
 * Clamps a crop box strictly within the image boundaries and enforces minimum dimensions.
 *
 * @param crop - Candidate crop rectangle
 * @param imageWidth - Boundary width
 * @param imageHeight - Boundary height
 * @returns Clamped crop rectangle
 */
export function clampCrop(
  crop: PixelCrop,
  imageWidth: number,
  imageHeight: number
): PixelCrop {
  const width = Math.min(imageWidth, Math.max(MIN_CROP_DIMENSION, Math.round(crop.width)));
  const height = Math.min(imageHeight, Math.max(MIN_CROP_DIMENSION, Math.round(crop.height)));
  const x = Math.max(0, Math.min(Math.round(crop.x), Math.max(0, imageWidth - width)));
  const y = Math.max(0, Math.min(Math.round(crop.y), Math.max(0, imageHeight - height)));

  return { x, y, width, height };
}

/**
 * Adjusts an existing crop rectangle to fit a new aspect ratio, maintaining its center.
 *
 * @param currentCrop - Current crop rectangle
 * @param aspect - Target aspect ratio, null for freeform, or -1 for original
 * @param imageWidth - Total image width
 * @param imageHeight - Total image height
 * @returns Adjusted crop rectangle
 */
export function applyAspectToCrop(
  currentCrop: PixelCrop,
  aspect: number | null,
  imageWidth: number,
  imageHeight: number
): PixelCrop {
  const targetAspect = resolveAspectRatio(aspect, imageWidth, imageHeight);
  if (targetAspect === null) {
    return clampCrop(currentCrop, imageWidth, imageHeight);
  }

  const centerX = currentCrop.x + currentCrop.width / 2;
  const centerY = currentCrop.y + currentCrop.height / 2;

  let newWidth = currentCrop.width;
  let newHeight = newWidth / targetAspect;

  if (newHeight > imageHeight) {
    newHeight = imageHeight;
    newWidth = newHeight * targetAspect;
  }
  if (newWidth > imageWidth) {
    newWidth = imageWidth;
    newHeight = newWidth / targetAspect;
  }

  let newX = centerX - newWidth / 2;
  let newY = centerY - newHeight / 2;

  if (newX < 0) newX = 0;
  if (newY < 0) newY = 0;
  if (newX + newWidth > imageWidth) newX = Math.max(0, imageWidth - newWidth);
  if (newY + newHeight > imageHeight) newY = Math.max(0, imageHeight - newHeight);

  return clampCrop(
    { x: newX, y: newY, width: newWidth, height: newHeight },
    imageWidth,
    imageHeight
  );
}

/**
 * Resizes a crop box given a drag delta on one of the 8 handles, respecting aspect ratio & bounds.
 *
 * @param handle - The active handle identifier ('nw', 'n', 'ne', etc.)
 * @param startCrop - Crop state at the start of the drag
 * @param deltaX - Horizontal drag distance in image pixels
 * @param deltaY - Vertical drag distance in image pixels
 * @param imageWidth - Width of the image
 * @param imageHeight - Height of the image
 * @param aspect - Active aspect ratio, null for freeform, or -1 for original
 * @returns New resized and clamped crop rectangle
 */
export function resizeCropWithHandle(
  handle: HandleType,
  startCrop: PixelCrop,
  deltaX: number,
  deltaY: number,
  imageWidth: number,
  imageHeight: number,
  aspect: number | null
): PixelCrop {
  const targetAspect = resolveAspectRatio(aspect, imageWidth, imageHeight);

  let left = startCrop.x;
  let top = startCrop.y;
  let right = startCrop.x + startCrop.width;
  let bottom = startCrop.y + startCrop.height;

  // Unconstrained resize first
  if (handle.includes('w')) left = Math.min(right - MIN_CROP_DIMENSION, Math.max(0, left + deltaX));
  if (handle.includes('e')) right = Math.max(left + MIN_CROP_DIMENSION, Math.min(imageWidth, right + deltaX));
  if (handle.includes('n')) top = Math.min(bottom - MIN_CROP_DIMENSION, Math.max(0, top + deltaY));
  if (handle.includes('s')) bottom = Math.max(top + MIN_CROP_DIMENSION, Math.min(imageHeight, bottom + deltaY));

  let width = right - left;
  let height = bottom - top;

  if (targetAspect !== null && targetAspect > 0) {
    if (handle === 'e' || handle === 'w') {
      height = width / targetAspect;
      const centerY = (top + bottom) / 2;
      top = centerY - height / 2;
      bottom = centerY + height / 2;

      if (top < 0) {
        top = 0;
        bottom = height;
        if (bottom > imageHeight) {
          bottom = imageHeight;
          height = bottom - top;
          width = height * targetAspect;
          if (handle === 'w') left = right - width;
          else right = left + width;
        }
      } else if (bottom > imageHeight) {
        bottom = imageHeight;
        top = bottom - height;
        if (top < 0) {
          top = 0;
          height = bottom - top;
          width = height * targetAspect;
          if (handle === 'w') left = right - width;
          else right = left + width;
        }
      }
    } else if (handle === 'n' || handle === 's') {
      width = height * targetAspect;
      const centerX = (left + right) / 2;
      left = centerX - width / 2;
      right = centerX + width / 2;

      if (left < 0) {
        left = 0;
        right = width;
        if (right > imageWidth) {
          right = imageWidth;
          width = right - left;
          height = width / targetAspect;
          if (handle === 'n') top = bottom - height;
          else bottom = top + height;
        }
      } else if (right > imageWidth) {
        right = imageWidth;
        left = right - width;
        if (left < 0) {
          left = 0;
          width = right - left;
          height = width / targetAspect;
          if (handle === 'n') top = bottom - height;
          else bottom = top + height;
        }
      }
    } else {
      // Corner handles
      const adjustCorner = (
        isEast: boolean,
        isSouth: boolean,
        startBoundCheck: boolean,
        wBoundExceeded: boolean
      ) => {
        const hFromW = width / targetAspect;
        const wFromH = height * targetAspect;

        if (startBoundCheck) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            height = hFromW;
          } else {
            width = wFromH;
          }
        } else if (wBoundExceeded) {
          width = isEast ? imageWidth - left : right;
          height = width / targetAspect;
        } else {
          height = isSouth ? imageHeight - top : bottom;
          width = height * targetAspect;
        }

        if (isEast) right = left + width;
        else left = right - width;

        if (isSouth) bottom = top + height;
        else top = bottom - height;
      };

      if (handle === 'se') {
        adjustCorner(
          true,
          true,
          startCrop.x + height * targetAspect <= imageWidth && startCrop.y + width / targetAspect <= imageHeight,
          startCrop.x + height * targetAspect > imageWidth
        );
      } else if (handle === 'sw') {
        adjustCorner(
          false,
          true,
          right - height * targetAspect >= 0 && top + width / targetAspect <= imageHeight,
          right - height * targetAspect < 0
        );
      } else if (handle === 'ne') {
        adjustCorner(
          true,
          false,
          left + height * targetAspect <= imageWidth && bottom - width / targetAspect >= 0,
          left + height * targetAspect > imageWidth
        );
      } else if (handle === 'nw') {
        adjustCorner(
          false,
          false,
          right - height * targetAspect >= 0 && bottom - width / targetAspect >= 0,
          right - height * targetAspect < 0
        );
      }
    }
  }

  return clampCrop(
    {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    },
    imageWidth,
    imageHeight
  );
}

/**
 * Creates an offscreen canvas of the entire image transformed (rotated & flipped)
 * at full original resolution.
 *
 * @param img - Source HTMLImageElement
 * @param transform - Rotation and flip transform state
 * @returns An HTMLCanvasElement containing the transformed full image
 */
export function getTransformedImageCanvas(
  img: HTMLImageElement,
  transform: ImageTransform
): HTMLCanvasElement {
  const { rotate, flipH, flipV } = transform;
  const { width, height } = getTransformedDimensions(
    img.naturalWidth,
    img.naturalHeight,
    rotate
  );

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

  ctx.drawImage(
    img,
    -img.naturalWidth / 2,
    -img.naturalHeight / 2,
    img.naturalWidth,
    img.naturalHeight
  );
  ctx.restore();

  return canvas;
}

/**
 * Generates the cropped output canvas at high native resolution.
 *
 * @param img - Source HTMLImageElement
 * @param crop - Selected crop region in image pixels
 * @param transform - Rotation and flip transform state
 * @param shape - Crop shape mask ('rect' or 'round')
 * @returns Canvas element containing the final cropped pixels
 */
export function createCroppedCanvas(
  img: HTMLImageElement,
  crop: PixelCrop,
  transform: ImageTransform,
  shape: CropShape = 'rect'
): HTMLCanvasElement {
  const transformedImageCanvas = getTransformedImageCanvas(img, transform);

  const outWidth = Math.max(1, Math.round(crop.width));
  const outHeight = Math.max(1, Math.round(crop.height));

  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  if (shape === 'round') {
    ctx.beginPath();
    ctx.ellipse(
      outWidth / 2,
      outHeight / 2,
      outWidth / 2,
      outHeight / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.clip();
  }

  ctx.drawImage(
    transformedImageCanvas,
    Math.round(crop.x),
    Math.round(crop.y),
    outWidth,
    outHeight,
    0,
    0,
    outWidth,
    outHeight
  );

  return canvas;
}

/**
 * Converts a canvas to a data URL based on requested format and quality.
 *
 * @param canvas - Rendered canvas
 * @param format - Export image format ('png', 'jpeg', or 'webp')
 * @param quality - Compression quality between 0 and 1 (applies to jpeg/webp)
 * @returns Data URL string
 */
export function getCanvasDataUrl(
  canvas: HTMLCanvasElement,
  format: ExportFormat = 'png',
  quality = 0.92
): string {
  const mimeType = formatToMimeType(format);
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Converts a canvas to an image Blob.
 *
 * @param canvas - Rendered canvas
 * @param format - Export image format
 * @param quality - Compression quality between 0 and 1
 * @returns Promise resolving with the created Blob
 */
export function getCanvasBlob(
  canvas: HTMLCanvasElement,
  format: ExportFormat = 'png',
  quality = 0.92
): Promise<Blob> {
  const mimeType = formatToMimeType(format);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`Failed to convert canvas to Blob for format ${format}`));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Copies a canvas's content directly to the system clipboard as a PNG.
 *
 * @param canvas - Source canvas
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<void> {
  const blob = await getCanvasBlob(canvas, 'png');
  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ]);
}

/**
 * Triggers a file download in the browser.
 *
 * @param dataUrlOrBlobUrl - URL to download
 * @param filename - Target filename for download
 */
export function downloadFile(dataUrlOrBlobUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrlOrBlobUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates a clean, descriptive export filename including crop dimensions.
 *
 * @param originalFilename - Name of the uploaded file
 * @param width - Cropped image width
 * @param height - Cropped image height
 * @param format - Output format
 * @returns Sanitized output filename
 */
export function formatExportFilename(
  originalFilename: string,
  width: number,
  height: number,
  format: ExportFormat
): string {
  const baseName = originalFilename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .slice(0, 30);
  const ext = format === 'jpeg' ? 'jpg' : format;
  return `${baseName}-cropped-${Math.round(width)}x${Math.round(height)}.${ext}`;
}

/**
 * Formats a byte size into a human-readable string (e.g. "1.2 MB").
 *
 * @param bytes - Size in bytes
 * @returns Formatted string
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'] as const;
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  const sizeUnit = sizes[i] ?? 'B';
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizeUnit}`;
}
