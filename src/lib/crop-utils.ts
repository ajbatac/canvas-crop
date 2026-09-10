export type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export type CropShape = 'rect' | 'round';

export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageTransform {
  rotate: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

export interface AspectRatioPreset {
  id: string;
  label: string;
  value: number | null; // null for freeform
  description?: string;
}

export const ASPECT_RATIOS: AspectRatioPreset[] = [
  { id: 'free', label: 'Free', value: null, description: 'Custom selection' },
  { id: '1:1', label: '1:1', value: 1, description: 'Square / Avatar' },
  { id: '16:9', label: '16:9', value: 16 / 9, description: 'Widescreen / Video' },
  { id: '4:3', label: '4:3', value: 4 / 3, description: 'Standard Photo' },
  { id: '9:16', label: '9:16', value: 9 / 16, description: 'Story / Reel / Mobile' },
  { id: '3:2', label: '3:2', value: 3 / 2, description: '35mm Film' },
  { id: '2:3', label: '2:3', value: 2 / 3, description: 'Portrait Photo' },
  { id: 'original', label: 'Original', value: -1, description: 'Lock original image ratio' },
];

const MIN_CROP_DIMENSION = 20;

/**
 * Returns effective image dimensions after taking 90/270-degree rotation into account.
 */
export function getTransformedDimensions(
  naturalWidth: number,
  naturalHeight: number,
  rotate: number
): { width: number; height: number } {
  const isOrthogonal = Math.abs(rotate % 180) === 90;
  return {
    width: isOrthogonal ? naturalHeight : naturalWidth,
    height: isOrthogonal ? naturalWidth : naturalHeight,
  };
}

/**
 * Initializes a centered crop covering ~80% of the image, adhering to the given aspect ratio.
 */
export function getInitialCrop(
  imageWidth: number,
  imageHeight: number,
  aspect: number | null
): PixelCrop {
  let targetAspect = aspect;
  if (targetAspect === -1) {
    targetAspect = imageWidth / imageHeight;
  }

  let width: number;
  let height: number;

  if (targetAspect) {
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

  // Ensure integers and clamped
  width = Math.min(imageWidth, Math.max(MIN_CROP_DIMENSION, Math.round(width)));
  height = Math.min(imageHeight, Math.max(MIN_CROP_DIMENSION, Math.round(height)));

  const x = Math.max(0, Math.round((imageWidth - width) / 2));
  const y = Math.max(0, Math.round((imageHeight - height) / 2));

  return { x, y, width, height };
}

/**
 * Keeps a crop box strictly within image bounds.
 */
export function clampCrop(
  crop: PixelCrop,
  imageWidth: number,
  imageHeight: number
): PixelCrop {
  const width = Math.min(imageWidth, Math.max(MIN_CROP_DIMENSION, Math.round(crop.width)));
  const height = Math.min(imageHeight, Math.max(MIN_CROP_DIMENSION, Math.round(crop.height)));
  const x = Math.max(0, Math.min(Math.round(crop.x), imageWidth - width));
  const y = Math.max(0, Math.min(Math.round(crop.y), imageHeight - height));

  return { x, y, width, height };
}

/**
 * Adjusts an existing crop to fit a new aspect ratio, keeping it centered where possible.
 */
export function applyAspectToCrop(
  currentCrop: PixelCrop,
  aspect: number | null,
  imageWidth: number,
  imageHeight: number
): PixelCrop {
  if (aspect === null) {
    return clampCrop(currentCrop, imageWidth, imageHeight);
  }

  let targetAspect = aspect;
  if (targetAspect === -1) {
    targetAspect = imageWidth / imageHeight;
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
  if (newX + newWidth > imageWidth) newX = imageWidth - newWidth;
  if (newY + newHeight > imageHeight) newY = imageHeight - newHeight;

  return clampCrop(
    { x: newX, y: newY, width: newWidth, height: newHeight },
    imageWidth,
    imageHeight
  );
}

/**
 * Resizes a crop box given a drag on one of the 8 handles, respecting aspect ratio & boundaries.
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
  let targetAspect = aspect;
  if (targetAspect === -1) {
    targetAspect = imageWidth / imageHeight;
  }

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

  if (targetAspect) {
    // If dragging an edge handle with locked aspect ratio, adjust the perpendicular dimension symmetrically
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
      // Corner handles: anchor the opposite corner
      if (handle === 'se') {
        const hFromW = width / targetAspect;
        const wFromH = height * targetAspect;
        if (startCrop.x + wFromH <= imageWidth && startCrop.y + hFromW <= imageHeight) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            height = hFromW;
          } else {
            width = wFromH;
          }
        } else if (startCrop.x + wFromH > imageWidth) {
          width = imageWidth - left;
          height = width / targetAspect;
        } else {
          height = imageHeight - top;
          width = height * targetAspect;
        }
        right = left + width;
        bottom = top + height;
      } else if (handle === 'sw') {
        const hFromW = width / targetAspect;
        const wFromH = height * targetAspect;
        if (right - wFromH >= 0 && top + hFromW <= imageHeight) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            height = hFromW;
          } else {
            width = wFromH;
          }
        } else if (right - wFromH < 0) {
          width = right;
          height = width / targetAspect;
        } else {
          height = imageHeight - top;
          width = height * targetAspect;
        }
        left = right - width;
        bottom = top + height;
      } else if (handle === 'ne') {
        const hFromW = width / targetAspect;
        const wFromH = height * targetAspect;
        if (left + wFromH <= imageWidth && bottom - hFromW >= 0) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            height = hFromW;
          } else {
            width = wFromH;
          }
        } else if (left + wFromH > imageWidth) {
          width = imageWidth - left;
          height = width / targetAspect;
        } else {
          height = bottom;
          width = height * targetAspect;
        }
        right = left + width;
        top = bottom - height;
      } else if (handle === 'nw') {
        const hFromW = width / targetAspect;
        const wFromH = height * targetAspect;
        if (right - wFromH >= 0 && bottom - hFromW >= 0) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            height = hFromW;
          } else {
            width = wFromH;
          }
        } else if (right - wFromH < 0) {
          width = right;
          height = width / targetAspect;
        } else {
          height = bottom;
          width = height * targetAspect;
        }
        left = right - width;
        top = bottom - height;
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
 * Creates an offscreen canvas of the entire image rotated and flipped at full original resolution.
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
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.save();
  // Move origin to center of rotated canvas
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

  // Draw natural image centered
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
 * Generates the high-res cropped output canvas.
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
 */
export function getCanvasDataUrl(
  canvas: HTMLCanvasElement,
  format: ExportFormat = 'png',
  quality = 0.92
): string {
  const mimeType =
    format === 'jpeg'
      ? 'image/jpeg'
      : format === 'webp'
      ? 'image/webp'
      : 'image/png';
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Converts a canvas to a Blob.
 */
export function getCanvasBlob(
  canvas: HTMLCanvasElement,
  format: ExportFormat = 'png',
  quality = 0.92
): Promise<Blob> {
  const mimeType =
    format === 'jpeg'
      ? 'image/jpeg'
      : format === 'webp'
      ? 'image/webp'
      : 'image/png';

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      mimeType,
      quality
    );
  });
}

/**
 * Copies a canvas to the system clipboard as a PNG.
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
 * Generates a clean, descriptive export filename.
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
 * Formats byte size into human readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
