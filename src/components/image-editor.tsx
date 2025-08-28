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
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;
    ctx.strokeRect(imageRect.x, imageRect.y, imageRect.width, imageRect.height);

    ctx.fillStyle = 'hsl(var(--accent))';
    ctx.strokeStyle = 'hsl(var(--primary))';
    Object.values(getHandles()).forEach(handle => {
      ctx.beginPath();
      ctx.rect(handle.x - HANDLE_SIZE / 2, handle.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      ctx.fill();
      ctx.stroke();
    });
  }, [imageRect, getHandles]);

  const loadImage = useCallback((src: string) => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    img.onload = () => {
      if (!container || !canvas) return;

      // Ensure canvas is sized before calculations
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
  }, []);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => loadImage(e.target?.result as string);
    reader.readAsDataURL(imageFile);
  }, [imageFile, loadImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver(() => {
      const currentImageAR = imageRect.width / imageRect.height;
      if (!container.clientWidth || !container.clientHeight || !imageRect.width) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      setImageRect(prev => {
        const containerAR = container.clientWidth / container.clientHeight;
        let newWidth, newHeight;
        
        if (currentImageAR > containerAR) {
            newWidth = container.clientWidth * 0.8;
            newHeight = newWidth / currentImageAR;
        } else {
            newHeight = container.clientHeight * 0.8;
            newWidth = newHeight * currentImageAR;
        }

        const newX = (container.clientWidth - newWidth) / 2;
        const newY = (container.clientHeight - newHeight) / 2;

        return { x: newX, y: newY, width: newWidth, height: newHeight };
      });
    });
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [redrawCanvas, imageRect.width, imageRect.height]);


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
    }
  };


  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeHandle || isPanning) return;
    
    const pos = getEventPos(e);
    const handles = getHandles();
    let newCursor = 'default';

    const handleHotspot = HANDLE_SIZE;

    const onTopLeft = Math.abs(pos.x - handles.topLeft.x) < handleHotspot && Math.abs(pos.y - handles.topLeft.y) < handleHotspot;
    const onBottomRight = Math.abs(pos.x - handles.bottomRight.x) < handleHotspot && Math.abs(pos.y - handles.bottomRight.y) < handleHotspot;
    const onTopRight = Math.abs(pos.x - handles.topRight.x) < handleHotspot && Math.abs(pos.y - handles.topRight.y) < handleHotspot;
    const onBottomLeft = Math.abs(pos.x - handles.bottomLeft.x) < handleHotspot && Math.abs(pos.y - handles.bottomLeft.y) < handleHotspot;

    if (onTopLeft || onBottomRight) {
      newCursor = 'nwse-resize';
    } else if (onTopRight || onBottomLeft) {
      newCursor = 'nesw-resize';
    } else if (
      pos.x >= imageRect.x && pos.x <= imageRect.x + imageRect.width &&
      pos.y >= imageRect.y && pos.y <= imageRect.y + imageRect.height
    ) {
      newCursor = 'move';
    }

    setCursor(newCursor);
  };

  const handleInteractionMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!activeHandle && !isPanning) return;
    e.preventDefault();

    const pos = getEventPos(e);
    const deltaX = pos.x - lastPos.x;
    const deltaY = pos.y - lastPos.y;

    if (activeHandle) {
      setImageRect(currentRect => {
        let { x, y, width, height } = currentRect;
        const aspectRatio = width / height;
        
        let newWidth = width;
        let newHeight = height;

        if (activeHandle.includes('Right')) {
          newWidth = Math.max(MIN_DIMENSION, width + deltaX);
        } else if (activeHandle.includes('Left')) {
          newWidth = Math.max(MIN_DIMENSION, width - deltaX);
          x += width - newWidth;
        }

        if (activeHandle.includes('Bottom')) {
          newHeight = Math.max(MIN_DIMENSION / aspectRatio, height + deltaY);
        } else if (activeHandle.includes('Top')) {
          newHeight = Math.max(MIN_DIMENSION / aspectRatio, height - deltaY);
          y += height - newHeight;
        }

        // Maintain aspect ratio
        if (activeHandle.includes('Left') || activeHandle.includes('Right')) {
          const oldHeight = height;
          newHeight = newWidth / aspectRatio;
          y += (oldHeight - newHeight) / 2;
        } else {
          const oldWidth = width;
          newWidth = newHeight * aspectRatio;
          x += (oldWidth - newWidth) / 2;
        }
        
        return { x, y, width: newWidth, height: newHeight };
      });
    } else if (isPanning) {
      setImageRect(r => ({ ...r, x: r.x + deltaX, y: r.y + deltaY }));
    }

    setLastPos(pos);
  }, [activeHandle, isPanning, lastPos]);

  const handleInteractionEnd = () => {
    setActiveHandle(null);
    setIsPanning(false);
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    window.addEventListener('mousemove', handleInteractionMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    
    // Touch events
    canvas.addEventListener('touchmove', handleInteractionMove, { passive: false });
    window.addEventListener('touchend', handleInteractionEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleInteractionMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      if (canvas) {
        canvas.removeEventListener('touchmove', handleInteractionMove);
      }
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
    const img = imageRef.current;
    if (!img.src) return null;

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = imageRect.width;
    finalCanvas.height = imageRect.height;
    const finalCtx = finalCanvas.getContext('2d')!;

    finalCtx.drawImage(img, 0, 0, imageRect.width, imageRect.height);
    
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
                onValueValueChange={([val]) => handleZoom(val)}
              />
              <ZoomIn className="w-5 h-5 text-muted-foreground" />
            </div>
             <div className="text-sm text-muted-foreground w-32 text-center shrink-0">
              {Math.round(imageRect.width)} x {Math.round(imageRect.height)}
            </div>
          </TooltipProvider>
        </div>
      </Card>
      <Card className="flex-grow w-full h-full overflow-hidden" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ cursor: isPanning ? 'grabbing' : cursor, touchAction: 'none' }}
          onMouseDown={handleInteractionStart}
          onTouchStart={handleInteractionStart}
          onMouseMove={handleCanvasMouseMove}
        />
      </Card>
    </div>
  );
}
