'use client';

import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Copy,
  Download,
  ZoomIn,
  ZoomOut,
  Trash2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const HANDLE_SIZE = 16; // Increased for better touch interaction
const MIN_DIMENSION = 50;

interface ImageEditorProps {
  imageFile: File;
  onNewImage: () => void;
}

export function ImageEditor({ imageFile, onNewImage }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [zoom, setZoom] = useState(1);
  const { toast } = useToast();

  const [imageRect, setImageRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [cursor, setCursor] = useState('grab');

  const getHandles = useCallback(() => {
    const { x, y, width, height } = imageRect;
    return {
      topLeft: { x, y },
      topRight: { x: x + width, y },
      bottomLeft: { x, y: y + height },
      bottomRight: { x: x + width, y: y + height },
    };
  }, [imageRect]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    if (!canvas || !ctx || !img.src) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a checkerboard pattern for transparency
    const patternCanvas = document.createElement('canvas');
    const patternCtx = patternCanvas.getContext('2d')!;
    patternCanvas.width = 20;
    patternCanvas.height = 20;
    patternCtx.fillStyle = '#e0e0e0';
    patternCtx.fillRect(0, 0, 10, 10);
    patternCtx.fillRect(10, 10, 10, 10);
    patternCtx.fillStyle = '#f0f0f0';
    patternCtx.fillRect(0, 10, 10, 10);
    patternCtx.fillRect(10, 0, 10, 10);
    const pattern = ctx.createPattern(patternCanvas, 'repeat')!;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    ctx.drawImage(img, imageRect.x, imageRect.y, imageRect.width, imageRect.height);
    
    // Draw border and handles
    if (hoveredHandle) {
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 2;
    } else {
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.lineWidth = 1;
    }
    ctx.strokeRect(imageRect.x, imageRect.y, imageRect.width, imageRect.height);

    ctx.fillStyle = 'hsl(var(--accent))';
    
    Object.entries(getHandles()).forEach(([name, handle]) => {
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = name === hoveredHandle ? 4 : 2;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(handle.x - HANDLE_SIZE / 2, handle.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE, [4]);
      } else {
        // Fallback for older browsers
        ctx.rect(handle.x - HANDLE_SIZE / 2, handle.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      }
      ctx.fill();
      ctx.stroke();
    });
  }, [imageRect, getHandles, hoveredHandle]);

  const loadImage = (src: string) => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    img.onload = () => {
      if (!container || !canvas) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      if (containerWidth === 0 || containerHeight === 0) return;
      
      canvas.width = containerWidth;
      canvas.height = containerHeight;

      const containerAR = containerWidth / containerHeight;
      const imgAR = img.width / img.height;
      
      let newWidth, newHeight;
      if (imgAR > containerAR) {
        newWidth = containerWidth * 0.8;
        newHeight = newWidth / imgAR;
      } else {
        newHeight = containerHeight * 0.8;
        newWidth = newHeight * imgAR;
      }

      const newX = (containerWidth - newWidth) / 2;
      const newY = (containerHeight - newHeight) / 2;

      setImageRect({ x: newX, y: newY, width: newWidth, height: newHeight });
      setZoom(1);
    };
    img.src = src;
  };

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => loadImage(e.target?.result as string);
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Sync canvas dimensions with container
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Recalculate image position and size based on new canvas dimensions
        setImageRect(prevRect => {
            if (prevRect.width === 0 || prevRect.height === 0) {
                // This case can happen on initial load before the image is ready.
                // We'll let the `loadImage` function handle the initial sizing.
                return prevRect;
            }

            const currentImageAR = prevRect.width / prevRect.height;
            const containerAR = canvas.width / canvas.height;
            let newWidth, newHeight;
            
            // Fit the image within an 80% bounding box, maintaining its aspect ratio
            if (currentImageAR > containerAR) {
                newWidth = canvas.width * 0.8;
                newHeight = newWidth / currentImageAR;
            } else {
                newHeight = canvas.height * 0.8;
                newWidth = newHeight * currentImageAR;
            }
            
            const newX = (canvas.width - newWidth) / 2;
            const newY = (canvas.height - newHeight) / 2;
            
            return { x: newX, y: newY, width: newWidth, height: newHeight };
        });
    };
    
    // Use ResizeObserver to detect when the container size changes.
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Initial resize to set up the canvas.
    handleResize();

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, []); // Empty dependency array means this runs once on mount.


  useEffect(() => {
    redrawCanvas();
  }, [imageRect, redrawCanvas]);

  const getEventPos = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getEventPos(e);
    setLastPos(pos);

    for (const [name, handlePos] of Object.entries(getHandles())) {
      if (
        Math.abs(pos.x - handlePos.x) < HANDLE_SIZE &&
        Math.abs(pos.y - handlePos.y) < HANDLE_SIZE
      ) {
        setActiveHandle(name);
        return;
      }
    }
    
    if (pos.x >= imageRect.x && pos.x <= imageRect.x + imageRect.width &&
        pos.y >= imageRect.y && pos.y <= imageRect.y + imageRect.height) {
        setIsPanning(true);
        setCursor('grabbing');
    }
  };


  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeHandle || isPanning) return;
    
    const pos = getEventPos(e);
    const handles = getHandles();
    let newCursor = 'default';
    let handleUnderCursor: string | null = null;
    
    const handleHotspot = HANDLE_SIZE;

    for (const [name, handlePos] of Object.entries(handles)) {
        if (
            Math.abs(pos.x - handlePos.x) < handleHotspot &&
            Math.abs(pos.y - handlePos.y) < handleHotspot
        ) {
            handleUnderCursor = name;
            if (name === 'topLeft' || name === 'bottomRight') {
                newCursor = 'nwse-resize';
            } else {
                newCursor = 'nesw-resize';
            }
            break;
        }
    }

    if (!handleUnderCursor) {
      if (
        pos.x >= imageRect.x && pos.x <= imageRect.x + imageRect.width &&
        pos.y >= imageRect.y && pos.y <= imageRect.y + imageRect.height
      ) {
        newCursor = 'grab';
      }
    }
    
    setHoveredHandle(handleUnderCursor);
    setCursor(newCursor);
  };

  const handleInteractionMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!activeHandle && !isPanning) return;
    
    if (e.cancelable) {
      e.preventDefault();
    }

    const pos = getEventPos(e);
    const deltaX = pos.x - lastPos.x;
    const deltaY = pos.y - lastPos.y;

    if (activeHandle) {
        setImageRect(currentRect => {
            let { x, y, width, height } = currentRect;
            const aspectRatio = width / height;

            // Define the anchor points which do not move during resize
            const right = x + width;
            const bottom = y + height;

            switch (activeHandle) {
                case 'topLeft':
                    width = Math.max(MIN_DIMENSION, width - deltaX);
                    height = width / aspectRatio;
                    x = right - width;
                    y = bottom - height;
                    break;
                case 'topRight':
                    width = Math.max(MIN_DIMENSION, width + deltaX);
                    height = width / aspectRatio;
                    y = bottom - height;
                    break;
                case 'bottomLeft':
                    width = Math.max(MIN_DIMENSION, width - deltaX);
                    height = width / aspectRatio;
                    x = right - width;
                    break;
                case 'bottomRight':
                    width = Math.max(MIN_DIMENSION, width + deltaX);
                    height = width / aspectRatio;
                    break;
            }
            return { x, y, width, height };
        });
    } else if (isPanning) {
      setImageRect(r => ({ ...r, x: r.x + deltaX, y: r.y + deltaY }));
    }

    setLastPos(pos);
  }, [activeHandle, isPanning, lastPos]);

  const handleInteractionEnd = () => {
    setActiveHandle(null);
    if(isPanning) {
        setIsPanning(false);
        setCursor('grab');
    }
  };
  
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => handleInteractionMove(e);
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleInteractionEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [handleInteractionMove]);


  const handleZoom = (newZoom: number) => {
    const { x, y, width, height } = imageRect;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const newWidth = width * (newZoom / zoom);
    const newHeight = height * (newZoom / zoom);
    setImageRect({
      width: newWidth,
      height: newHeight,
      x: centerX - newWidth / 2,
      y: centerY - newHeight / 2
    });
    setZoom(newZoom);
  };

  const getCroppedDataUrl = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img.src) return null;

    // Determine the visible part of the image on the canvas
    const cropX = Math.max(0, imageRect.x);
    const cropY = Math.max(0, imageRect.y);

    const cropWidth = Math.min(
      imageRect.x + imageRect.width,
      canvas.width
    ) - cropX;

    const cropHeight = Math.min(
      imageRect.y + imageRect.height,
      canvas.height
    ) - cropY;

    if (cropWidth <= 0 || cropHeight <= 0) {
      toast({
        title: 'Error',
        description: 'Cannot crop an empty area.',
        variant: 'destructive',
      });
      return null;
    }

    // Determine the source region from the original image
    const sourceX = (cropX - imageRect.x) * (img.naturalWidth / imageRect.width);
    const sourceY = (cropY - imageRect.y) * (img.naturalHeight / imageRect.height);
    const sourceWidth = cropWidth * (img.naturalWidth / imageRect.width);
    const sourceHeight = cropHeight * (img.naturalHeight / imageRect.height);

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = cropWidth;
    finalCanvas.height = cropHeight;
    const finalCtx = finalCanvas.getContext('2d')!;

    finalCtx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0, 0, // Draw at the top-left of the new canvas
      cropWidth,
      cropHeight
    );
    
    return finalCanvas.toDataURL('image/png');
  };

  const handleCopy = async () => {
    const dataUrl = getCroppedDataUrl();
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast({
        title: 'Success!',
        description: 'Image copied to clipboard.',
      });
    } catch (error) {
      console.error('Failed to copy image:', error);
      toast({
        title: 'Error',
        description: 'Could not copy image to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    const dataUrl = getCroppedDataUrl();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = 'resized-image.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Success!',
      description: 'Image download started.',
    });
  };

  return (
    <div className="w-full h-[calc(100vh-8rem)] flex flex-col gap-4">
      <Card className="flex-shrink-0">
        <div className="p-2 flex flex-wrap items-center justify-between gap-4">
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onNewImage}>
                    <Trash2 className="w-5 h-5" />
                    <span className="sr-only">New Image</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Image</TooltipContent>
              </Tooltip>
               <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    <Copy className="w-5 h-5" />
                    <span className="sr-only">Copy Image</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy to Clipboard</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleDownload}>
                    <Download className="w-5 h-5" />
                    <span className="sr-only">Download Image</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download Image</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 w-full max-w-xs">
              <ZoomOut className="w-5 h-5 text-muted-foreground" />
              <Slider
                min={0.1}
                max={5}
                step={0.1}
                value={[zoom]}
                onValueChange={([val]) => handleZoom(val)}
              />
              <ZoomIn className="w-5 h-5 text-muted-foreground" />
            </div>
             <div className="text-sm text-muted-foreground w-32 text-center shrink-0">
              {Math.round(imageRect.width)} x {Math.round(imageRect.height)}
            </div>
          </TooltipProvider>
        </div>
      </Card>
      <Card 
        className="flex-grow w-full h-full overflow-hidden" 
        ref={containerRef}
        onMouseLeave={() => setHoveredHandle(null)}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ cursor, touchAction: 'none' }}
          onMouseDown={handleInteractionStart}
          onTouchStart={handleInteractionStart}
          onMouseMove={handleCanvasMouseMove}
        />
      </Card>
    </div>
  );
}
