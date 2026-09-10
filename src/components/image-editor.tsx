'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Download,
  Trash2,
  Eye,
  Check,
  Circle,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import {
  type PixelCrop,
  type HandleType,
  type CropShape,
  type ExportFormat,
  type ImageTransform,
  type Point,
  type Dimensions,
  ASPECT_RATIOS,
  getTransformedDimensions,
  getInitialCrop,
  applyAspectToCrop,
  resizeCropWithHandle,
  createCroppedCanvas,
  copyCanvasToClipboard,
  downloadFile,
  getCanvasDataUrl,
  formatExportFilename,
  formatBytes,
} from '@/lib/crop-utils';
import { CropPreviewDialog } from '@/components/crop/crop-preview-dialog';

export interface ImageEditorProps {
  /** The source image file to edit */
  imageFile: File;
  /** Callback fired when the user chooses to discard and select a new image */
  onNewImage: () => void;
}

const HANDLE_HIT_RADIUS = 20;

/**
 * Creates and caches a reusable checkerboard tile canvas pattern for transparent image backgrounds.
 */
let cachedPattern: CanvasPattern | null = null;
let patternCanvasRef: HTMLCanvasElement | null = null;

function getCheckerboardPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  if (cachedPattern) return cachedPattern;

  if (!patternCanvasRef) {
    patternCanvasRef = document.createElement('canvas');
    patternCanvasRef.width = 16;
    patternCanvasRef.height = 16;
    const pCtx = patternCanvasRef.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#e2e4e9';
      pCtx.fillRect(0, 0, 8, 8);
      pCtx.fillRect(8, 8, 8, 8);
      pCtx.fillStyle = '#ffffff';
      pCtx.fillRect(8, 0, 8, 8);
      pCtx.fillRect(0, 8, 8, 8);
    }
  }

  cachedPattern = ctx.createPattern(patternCanvasRef, 'repeat');
  return cachedPattern;
}

interface ViewportLayout {
  scale: number;
  imgX: number;
  imgY: number;
  viewportWidth: number;
  viewportHeight: number;
}

type HitTarget =
  | { type: 'handle'; handle: HandleType; cursor: string }
  | { type: 'crop'; cursor: string }
  | { type: 'image'; cursor: string }
  | { type: 'outside'; cursor: string };

/**
 * Interactive canvas image editor providing real-time crop manipulation,
 * 8-point handles, aspect-ratio constraints, rotation, flipping, zoom, preview,
 * and lossless export.
 */
export function ImageEditor({ imageFile, onNewImage }: ImageEditorProps) {
  const { toast } = useToast();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Loaded image natural state
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);

  // Transform state
  const [transform, setTransform] = useState<ImageTransform>({
    rotate: 0,
    flipH: false,
    flipV: false,
  });

  // Effective dimensions based on rotation
  const effDimensions: Dimensions = useMemo(
    () => getTransformedDimensions(naturalWidth, naturalHeight, transform.rotate),
    [naturalWidth, naturalHeight, transform.rotate]
  );

  // Crop configuration
  const [aspectPreset, setAspectPreset] = useState<string>('free');
  const [cropShape, setCropShape] = useState<CropShape>('rect');
  const [crop, setCrop] = useState<PixelCrop>({ x: 0, y: 0, width: 0, height: 0 });

  // Viewport Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });

  // Interactive interaction states
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [isCreatingCrop, setIsCreatingCrop] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<Point>({ x: 0, y: 0 });
  const [startCrop, setStartCrop] = useState<PixelCrop>({ x: 0, y: 0, width: 0, height: 0 });
  const [cursor, setCursor] = useState<string>('default');

  // Preview Dialog & Actions
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Load image from File
  useEffect(() => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(imageFile);
    img.onload = () => {
      imageElementRef.current = img;
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      setTransform({ rotate: 0, flipH: false, flipV: false });
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
      setAspectPreset('free');
      setCropShape('rect');

      const initial = getInitialCrop(img.naturalWidth, img.naturalHeight, null);
      setCrop(initial);
      setImageLoaded(true);
    };
    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  // Current active aspect ratio value
  const activeAspect = useMemo(() => {
    const found = ASPECT_RATIOS.find((a) => a.id === aspectPreset);
    return found ? found.value : null;
  }, [aspectPreset]);

  // Helper to compute viewport layout coordinates
  const getLayout = useCallback((): ViewportLayout => {
    const canvas = canvasRef.current;
    if (!canvas || effDimensions.width === 0 || effDimensions.height === 0) {
      return { scale: 1, imgX: 0, imgY: 0, viewportWidth: 0, viewportHeight: 0 };
    }

    const viewportWidth = canvas.clientWidth;
    const viewportHeight = canvas.clientHeight;
    const padding = 36;

    const availW = Math.max(50, viewportWidth - padding * 2);
    const availH = Math.max(50, viewportHeight - padding * 2);

    const fitScale = Math.min(availW / effDimensions.width, availH / effDimensions.height);
    const scale = fitScale * zoom;

    const renderedW = effDimensions.width * scale;
    const renderedH = effDimensions.height * scale;

    const imgX = (viewportWidth - renderedW) / 2 + panOffset.x;
    const imgY = (viewportHeight - renderedH) / 2 + panOffset.y;

    return { scale, imgX, imgY, viewportWidth, viewportHeight };
  }, [effDimensions, zoom, panOffset]);

  // Transform coordinates between Viewport Space and Image Space
  const viewportToImage = useCallback(
    (vx: number, vy: number): Point => {
      const { scale, imgX, imgY } = getLayout();
      return {
        x: (vx - imgX) / scale,
        y: (vy - imgY) / scale,
      };
    },
    [getLayout]
  );

  const imageToViewport = useCallback(
    (ix: number, iy: number): Point => {
      const { scale, imgX, imgY } = getLayout();
      return {
        x: imgX + ix * scale,
        y: imgY + iy * scale,
      };
    },
    [getLayout]
  );

  // Return handle positions in Viewport pixels
  const getHandlePositions = useCallback((): Record<
    HandleType,
    { x: number; y: number; cursor: string }
  > => {
    const tl = imageToViewport(crop.x, crop.y);
    const br = imageToViewport(crop.x + crop.width, crop.y + crop.height);
    const mx = (tl.x + br.x) / 2;
    const my = (tl.y + br.y) / 2;

    return {
      nw: { x: tl.x, y: tl.y, cursor: 'nwse-resize' },
      n: { x: mx, y: tl.y, cursor: 'ns-resize' },
      ne: { x: br.x, y: tl.y, cursor: 'nesw-resize' },
      e: { x: br.x, y: my, cursor: 'ew-resize' },
      se: { x: br.x, y: br.y, cursor: 'nwse-resize' },
      s: { x: mx, y: br.y, cursor: 'ns-resize' },
      sw: { x: tl.x, y: br.y, cursor: 'nesw-resize' },
      w: { x: tl.x, y: my, cursor: 'ew-resize' },
    };
  }, [crop, imageToViewport]);

  // Main Canvas Render Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageElementRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const { scale, imgX, imgY } = getLayout();
    const renderedW = effDimensions.width * scale;
    const renderedH = effDimensions.height * scale;

    // 1. Draw Checkerboard background inside image boundary for transparent assets
    ctx.save();
    ctx.beginPath();
    ctx.rect(imgX, imgY, renderedW, renderedH);
    ctx.clip();

    const pattern = getCheckerboardPattern(ctx);
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(imgX, imgY, renderedW, renderedH);
    }
    ctx.restore();

    // 2. Draw Transformed Image
    ctx.save();
    ctx.translate(imgX + renderedW / 2, imgY + renderedH / 2);
    ctx.rotate((transform.rotate * Math.PI) / 180);
    ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);

    const isOrthogonal = Math.abs(transform.rotate % 180) === 90;
    const naturalDrawW = (isOrthogonal ? effDimensions.height : effDimensions.width) * scale;
    const naturalDrawH = (isOrthogonal ? effDimensions.width : effDimensions.height) * scale;

    ctx.drawImage(
      img,
      -naturalDrawW / 2,
      -naturalDrawH / 2,
      naturalDrawW,
      naturalDrawH
    );
    ctx.restore();

    // Image border outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(imgX, imgY, renderedW, renderedH);

    // 3. Dark Scrim (Mask over non-cropped areas)
    const cropTl = imageToViewport(crop.x, crop.y);
    const cropW = crop.width * scale;
    const cropH = crop.height * scale;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.beginPath();
    ctx.rect(0, 0, width, height);

    if (cropShape === 'round') {
      const cx = cropTl.x + cropW / 2;
      const cy = cropTl.y + cropH / 2;
      const rx = Math.max(1, cropW / 2);
      const ry = Math.max(1, cropH / 2);
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2, true);
    } else {
      ctx.rect(cropTl.x + cropW, cropTl.y, -cropW, cropH);
    }
    ctx.fill('evenodd');
    ctx.restore();

    // 4. Rule-of-Thirds Grid lines
    ctx.save();
    ctx.beginPath();
    if (cropShape === 'round') {
      const cx = cropTl.x + cropW / 2;
      const cy = cropTl.y + cropH / 2;
      ctx.ellipse(cx, cy, cropW / 2, cropH / 2, 0, 0, Math.PI * 2);
      ctx.clip();
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(cropTl.x + cropW / 3, cropTl.y);
    ctx.lineTo(cropTl.x + cropW / 3, cropTl.y + cropH);
    ctx.moveTo(cropTl.x + (cropW * 2) / 3, cropTl.y);
    ctx.lineTo(cropTl.x + (cropW * 2) / 3, cropTl.y + cropH);

    ctx.moveTo(cropTl.x, cropTl.y + cropH / 3);
    ctx.lineTo(cropTl.x + cropW, cropTl.y + cropH / 3);
    ctx.moveTo(cropTl.x, cropTl.y + (cropH * 2) / 3);
    ctx.lineTo(cropTl.x + cropW, cropTl.y + (cropH * 2) / 3);
    ctx.stroke();
    ctx.restore();

    // 5. Crop Box Outline
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    if (cropShape === 'round') {
      ctx.beginPath();
      ctx.ellipse(
        cropTl.x + cropW / 2,
        cropTl.y + cropH / 2,
        cropW / 2,
        cropH / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    } else {
      ctx.strokeRect(cropTl.x, cropTl.y, cropW, cropH);
    }
    ctx.restore();

    // 6. Draw 8 Interactive Handles
    const handles = getHandlePositions();
    const cornerBracketLen = 14;

    (Object.entries(handles) as [HandleType, { x: number; y: number; cursor: string }][]).forEach(
      ([name, pos]) => {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'hsl(var(--primary))';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 4;

        if (['nw', 'ne', 'se', 'sw'].includes(name)) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          if (name === 'nw') {
            ctx.moveTo(pos.x, pos.y + cornerBracketLen);
            ctx.lineTo(pos.x, pos.y);
            ctx.lineTo(pos.x + cornerBracketLen, pos.y);
          } else if (name === 'ne') {
            ctx.moveTo(pos.x - cornerBracketLen, pos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.lineTo(pos.x, pos.y + cornerBracketLen);
          } else if (name === 'se') {
            ctx.moveTo(pos.x, pos.y - cornerBracketLen);
            ctx.lineTo(pos.x, pos.y);
            ctx.lineTo(pos.x - cornerBracketLen, pos.y);
          } else if (name === 'sw') {
            ctx.moveTo(pos.x + cornerBracketLen, pos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.lineTo(pos.x, pos.y - cornerBracketLen);
          }
          ctx.stroke();
        } else {
          const isHorizontalPill = name === 'n' || name === 's';
          const pillW = isHorizontalPill ? 18 : 6;
          const pillH = isHorizontalPill ? 6 : 18;
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(pos.x - pillW / 2, pos.y - pillH / 2, pillW, pillH, 3);
          } else {
            ctx.rect(pos.x - pillW / 2, pos.y - pillH / 2, pillW, pillH);
          }
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
    );

    ctx.restore();
  }, [
    effDimensions,
    transform,
    zoom,
    crop,
    cropShape,
    imageLoaded,
    getLayout,
    imageToViewport,
    getHandlePositions,
  ]);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      render();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [render]);

  // Hit test handles or crop interior
  const getHitTarget = useCallback(
    (vx: number, vy: number): HitTarget => {
      const handles = getHandlePositions();
      for (const [name, pos] of Object.entries(handles) as [
        HandleType,
        { x: number; y: number; cursor: string }
      ][]) {
        const dist = Math.hypot(vx - pos.x, vy - pos.y);
        if (dist <= HANDLE_HIT_RADIUS) {
          return { type: 'handle', handle: name, cursor: pos.cursor };
        }
      }

      const layout = getLayout();
      const cropTl = imageToViewport(crop.x, crop.y);
      const cropW = crop.width * layout.scale;
      const cropH = crop.height * layout.scale;

      if (
        vx >= cropTl.x &&
        vx <= cropTl.x + cropW &&
        vy >= cropTl.y &&
        vy <= cropTl.y + cropH
      ) {
        return { type: 'crop', cursor: 'move' };
      }

      const renderedW = effDimensions.width * layout.scale;
      const renderedH = effDimensions.height * layout.scale;

      if (
        vx >= layout.imgX &&
        vx <= layout.imgX + renderedW &&
        vy >= layout.imgY &&
        vy <= layout.imgY + renderedH
      ) {
        return { type: 'image', cursor: 'crosshair' };
      }

      return { type: 'outside', cursor: 'default' };
    },
    [getHandlePositions, imageToViewport, crop, getLayout, effDimensions]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const vx = e.clientX - rect.left;
    const vy = e.clientY - rect.top;

    const hit = getHitTarget(vx, vy);

    setDragStartPos({ x: vx, y: vy });
    setStartCrop({ ...crop });

    if (hit.type === 'handle') {
      setActiveHandle(hit.handle);
    } else if (hit.type === 'crop') {
      setIsDraggingCrop(true);
    } else if (hit.type === 'image') {
      const imgPos = viewportToImage(vx, vy);
      setIsCreatingCrop(true);
      setStartCrop({
        x: Math.round(imgPos.x),
        y: Math.round(imgPos.y),
        width: 10,
        height: 10,
      });
      setCrop({
        x: Math.round(imgPos.x),
        y: Math.round(imgPos.y),
        width: 10,
        height: 10,
      });
      setActiveHandle('se');
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const vx = e.clientX - rect.left;
    const vy = e.clientY - rect.top;

    if (!activeHandle && !isDraggingCrop && !isCreatingCrop) {
      const hit = getHitTarget(vx, vy);
      setCursor(hit.cursor);
      return;
    }

    const { scale } = getLayout();
    const deltaVx = vx - dragStartPos.x;
    const deltaVy = vy - dragStartPos.y;

    const deltaImgX = deltaVx / scale;
    const deltaImgY = deltaVy / scale;

    if (activeHandle) {
      const newCrop = resizeCropWithHandle(
        activeHandle,
        startCrop,
        deltaImgX,
        deltaImgY,
        effDimensions.width,
        effDimensions.height,
        activeAspect
      );
      setCrop(newCrop);
    } else if (isDraggingCrop) {
      const targetX = startCrop.x + deltaImgX;
      const targetY = startCrop.y + deltaImgY;

      const clampedX = Math.max(
        0,
        Math.min(targetX, effDimensions.width - startCrop.width)
      );
      const clampedY = Math.max(
        0,
        Math.min(targetY, effDimensions.height - startCrop.height)
      );

      setCrop({
        ...startCrop,
        x: Math.round(clampedX),
        y: Math.round(clampedY),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if not captured
    }
    setActiveHandle(null);
    setIsDraggingCrop(false);
    setIsCreatingCrop(false);
  };

  // Aspect ratio switch handler
  const handleAspectChange = useCallback(
    (aspectId: string) => {
      setAspectPreset(aspectId);
      const targetPreset = ASPECT_RATIOS.find((a) => a.id === aspectId);
      const aspectValue = targetPreset ? targetPreset.value : null;

      setCrop((prev) =>
        applyAspectToCrop(
          prev,
          aspectValue,
          effDimensions.width,
          effDimensions.height
        )
      );
    },
    [effDimensions.width, effDimensions.height]
  );

  // Rotate handler (90° increments)
  const handleRotate = useCallback(
    (dir: 'cw' | 'ccw') => {
      const delta = dir === 'cw' ? 90 : -90;
      const newRotate = (transform.rotate + delta + 360) % 360;

      const newEff = getTransformedDimensions(
        naturalWidth,
        naturalHeight,
        newRotate
      );

      setTransform((prev) => ({ ...prev, rotate: newRotate }));

      const newCrop = getInitialCrop(newEff.width, newEff.height, activeAspect);
      setCrop(newCrop);
    },
    [transform.rotate, naturalWidth, naturalHeight, activeAspect]
  );

  // Flip handler
  const handleFlip = useCallback((axis: 'H' | 'V') => {
    setTransform((prev) => ({
      ...prev,
      [axis === 'H' ? 'flipH' : 'flipV']: !prev[axis === 'H' ? 'flipH' : 'flipV'],
    }));
  }, []);

  // Reset crop to default bounding selection
  const handleResetCrop = useCallback(() => {
    const initial = getInitialCrop(
      effDimensions.width,
      effDimensions.height,
      activeAspect
    );
    setCrop(initial);
    toast({
      description: 'Crop selection reset.',
    });
  }, [effDimensions.width, effDimensions.height, activeAspect, toast]);

  // Maximize crop to entire image
  const handleMaximizeCrop = useCallback(() => {
    let newCrop: PixelCrop;
    if (activeAspect === null) {
      newCrop = {
        x: 0,
        y: 0,
        width: effDimensions.width,
        height: effDimensions.height,
      };
    } else {
      newCrop = getInitialCrop(
        effDimensions.width,
        effDimensions.height,
        activeAspect
      );
    }
    setCrop(newCrop);
  }, [effDimensions.width, effDimensions.height, activeAspect]);

  // Generate cropped output canvas helper
  const getRenderedCroppedCanvas = useCallback((): HTMLCanvasElement | null => {
    const img = imageElementRef.current;
    if (!img || !imageLoaded) return null;
    return createCroppedCanvas(img, crop, transform, cropShape);
  }, [crop, transform, cropShape, imageLoaded]);

  // Open Preview Modal
  const handleOpenPreview = useCallback(() => {
    const canvas = getRenderedCroppedCanvas();
    if (!canvas) return;
    setPreviewCanvas(canvas);
    setPreviewOpen(true);
  }, [getRenderedCroppedCanvas]);

  // Direct Download with format
  const handleExport = useCallback(
    (format: ExportFormat = 'png') => {
      const canvas = getRenderedCroppedCanvas();
      if (!canvas) return;

      const dataUrl = getCanvasDataUrl(canvas, format, 0.92);
      const filename = formatExportFilename(
        imageFile.name,
        crop.width,
        crop.height,
        format
      );
      downloadFile(dataUrl, filename);
      toast({
        title: 'Downloaded!',
        description: `Saved ${filename}`,
      });
    },
    [getRenderedCroppedCanvas, imageFile.name, crop.width, crop.height, toast]
  );

  // Instant Copy
  const handleCopyCrop = useCallback(async () => {
    const canvas = getRenderedCroppedCanvas();
    if (!canvas) return;

    try {
      setIsCopying(true);
      await copyCanvasToClipboard(canvas);
      setCopiedSuccess(true);
      toast({
        title: 'Success!',
        description: `Cropped image (${Math.round(crop.width)}×${Math.round(
          crop.height
        )}) copied to clipboard.`,
      });
      setTimeout(() => setCopiedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Copy Failed',
        description: 'Could not copy to clipboard in this browser.',
        variant: 'destructive',
      });
    } finally {
      setIsCopying(false);
    }
  }, [getRenderedCroppedCanvas, crop.width, crop.height, toast]);

  // Keyboard navigation for nudge / shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!imageLoaded) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else if (e.key === 'Escape') {
        handleResetCrop();
        return;
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        void handleCopyCrop();
        return;
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleExport('png');
        return;
      }

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        setCrop((prev) => {
          const clampedX = Math.max(
            0,
            Math.min(prev.x + dx, effDimensions.width - prev.width)
          );
          const clampedY = Math.max(
            0,
            Math.min(prev.y + dy, effDimensions.height - prev.height)
          );
          return {
            ...prev,
            x: Math.round(clampedX),
            y: Math.round(clampedY),
          };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageLoaded, effDimensions, handleResetCrop, handleCopyCrop, handleExport]);

  return (
    <div className="w-full flex flex-col gap-4 max-w-7xl mx-auto h-[calc(100vh-6rem)]">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card/90 backdrop-blur-md border rounded-2xl px-4 py-3 shadow-sm">
        {/* Left: New Image & File Info */}
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNewImage}
                  className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/40"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">New Image</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Discard and pick a new image</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate max-w-[180px] sm:max-w-[240px]">
              {imageFile.name}
            </span>
            <Badge variant="secondary" className="font-mono text-xs hidden md:inline-flex">
              Original: {effDimensions.width} × {effDimensions.height} px
            </Badge>
            <Badge variant="outline" className="font-mono text-xs text-muted-foreground hidden lg:inline-flex">
              {formatBytes(imageFile.size)}
            </Badge>
          </div>
        </div>

        {/* Center: Crop output dimensions badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="default"
            className="px-3 py-1 text-xs font-mono font-medium shadow-sm bg-primary/90 hover:bg-primary"
          >
            Crop: {Math.round(crop.width)} × {Math.round(crop.height)} px
          </Badge>
        </div>

        {/* Right: Actions (Reset, Preview, Copy, Download) */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetCrop}
                  className="gap-1 text-xs"
                  aria-label="Reset crop box"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset crop box to initial frame</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPreview}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCrop}
            disabled={isCopying}
            className="gap-2"
          >
            {copiedSuccess ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{copiedSuccess ? 'Copied' : 'Copy'}</span>
          </Button>

          {/* Download Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2 shadow-sm">
                <Download className="w-4 h-4" />
                <span>Download</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => handleExport('png')} className="justify-between">
                <span>PNG Image</span>
                <span className="text-[10px] text-muted-foreground uppercase font-mono">Lossless</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('jpeg')} className="justify-between">
                <span>JPEG Image</span>
                <span className="text-[10px] text-muted-foreground uppercase font-mono">Photo</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('webp')} className="justify-between">
                <span>WebP Image</span>
                <span className="text-[10px] text-muted-foreground uppercase font-mono">Modern</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. Main Stage Area */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full bg-slate-950/90 rounded-2xl border overflow-hidden flex items-center justify-center select-none shadow-inner"
        style={{ minHeight: '380px' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ cursor, touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={handleMaximizeCrop}
        />

        {/* Floating Controls Overlay (Aspect ratios & tools) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 bg-background/95 backdrop-blur-md border shadow-xl px-3 py-2 rounded-2xl max-w-[94vw] z-10 transition-all">
          {/* Aspect Ratio Presets */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
            {ASPECT_RATIOS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleAspectChange(preset.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  aspectPreset === preset.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}

            {/* Circle / Avatar Crop Toggle */}
            <div className="h-4 w-[1px] bg-border mx-1" />

            <button
              onClick={() => {
                const next = cropShape === 'rect' ? 'round' : 'rect';
                setCropShape(next);
                if (next === 'round' && aspectPreset !== '1:1') {
                  handleAspectChange('1:1');
                }
              }}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                cropShape === 'round'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="Circular Avatar Crop"
            >
              {cropShape === 'round' ? (
                <Circle className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Circle</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block" />

          {/* Transform Buttons: Rotate & Flip */}
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRotate('ccw')}
                    aria-label="Rotate counter-clockwise 90 degrees"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rotate -90°</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRotate('cw')}
                    aria-label="Rotate clockwise 90 degrees"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rotate +90°</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${transform.flipH ? 'bg-primary/20 text-primary' : ''}`}
                    onClick={() => handleFlip('H')}
                    aria-label="Flip horizontally"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Flip Horizontally</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${transform.flipV ? 'bg-primary/20 text-primary' : ''}`}
                    onClick={() => handleFlip('V')}
                    aria-label="Flip vertically"
                  >
                    <FlipVertical className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Flip Vertically</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="h-4 w-[1px] bg-border mx-1 hidden md:block" />

          {/* Zoom Slider */}
          <div className="hidden md:flex items-center gap-2 pl-1">
            <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
            <Slider
              min={0.5}
              max={2.5}
              step={0.1}
              value={[zoom]}
              onValueChange={([val = 1]) => setZoom(val)}
              className="w-20"
              aria-label="Zoom level"
            />
            <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-mono text-muted-foreground w-8 text-right">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => {
                setZoom(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              title="Fit to view"
              aria-label="Fit to view"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Crop Preview Modal */}
      <CropPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        croppedCanvas={previewCanvas}
        originalFileName={imageFile.name}
      />
    </div>
  );
}
