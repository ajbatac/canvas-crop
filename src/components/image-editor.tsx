'use client';

import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { upscaleImage } from '@/ai/flows/upscale-image';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Copy,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const HANDLE_SIZE = 12;
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
  const [isUpscaling, setIsUpscaling] = useState(false);
  const { toast } = useToast();

  const [imageRect, setImageRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

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
      const containerAR = container.clientWidth / container.clientHeight;
      const imgAR = img.width / img.height;
      
      let newWidth, newHeight;
      if (imgAR > containerAR) {
        newWidth = container.clientWidth * 0.8;
        newHeight = newWidth / imgAR;
      } else {
        newHeight = container.clientHeight * 0.8;
        newWidth = newHeight * imgAR;
      }

      const newX = (container.clientWidth - newWidth) / 2;
      const newY = (container.clientHeight - newHeight) / 2;

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
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas();
    });
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [imageRect, redrawCanvas]);

  const getMousePos = (e: MouseEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setLastMousePos(pos);

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

  const handleMouseMove = (e: MouseEvent) => {
    const pos = getMousePos(e);
    const deltaX = pos.x - lastMousePos.x;
    const deltaY = pos.y - lastMousePos.y;

    if (activeHandle) {
      let { x, y, width, height } = imageRect;
      const aspectRatio = imageRef.current.width / imageRef.current.height;

      switch (activeHandle) {
        case 'bottomRight':
          width = Math.max(MIN_DIMENSION, width + deltaX);
          height = width / aspectRatio;
          break;
        case 'bottomLeft':
          width = Math.max(MIN_DIMENSION, width - deltaX);
          height = width / aspectRatio;
          x += deltaX;
          break;
        case 'topLeft':
          width = Math.max(MIN_DIMENSION, width - deltaX);
          height = width / aspectRatio;
          x += deltaX;
          y += deltaY;
          break;
        case 'topRight':
          width = Math.max(MIN_DIMENSION, width + deltaX);
          height = width / aspectRatio;
          y += deltaY;
          break;
      }
      setImageRect({ x, y, width, height });
    } else if (isPanning) {
      setImageRect(r => ({ ...r, x: r.x + deltaX, y: r.y + deltaY }));
    }

    setLastMousePos(pos);
  };

  const handleMouseUp = () => {
    setActiveHandle(null);
    setIsPanning(false);
  };
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHandle, isPanning, lastMousePos]);


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
    const tempCanvas = document.createElement('canvas');
    const img = imageRef.current;
    if (!img.src) return null;
    
    const { x, y, width, height } = imageRect;
    const canvas = canvasRef.current!;

    const sourceX = (0 - x) / width * img.width;
    const sourceY = (0 - y) / height * img.height;
    const sourceWidth = canvas.width / width * img.width;
    const sourceHeight = canvas.height / height * img.height;
    
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const ctx = tempCanvas.getContext('2d')!;
    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    return tempCanvas.toDataURL('image/png');
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

  const handleUpscale = async () => {
    const dataUrl = getCroppedDataUrl();
    if (!dataUrl) return;
    setIsUpscaling(true);
    try {
      const result = await upscaleImage({ photoDataUri: dataUrl });
      loadImage(result.upscaledPhotoDataUri);
      toast({
        title: 'Upscale Successful',
        description: 'Your image has been upscaled with AI.',
      });
    } catch (error) {
      console.error('Upscaling failed', error);
      toast({
        title: 'Upscale Failed',
        description: 'An error occurred while upscaling the image.',
        variant: 'destructive',
      });
    } finally {
      setIsUpscaling(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-8rem)] flex flex-col gap-4">
      <Card className="flex-shrink-0">
        <div className="p-2 flex items-center justify-between gap-4">
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
                  <Button variant="ghost" size="icon" onClick={handleUpscale} disabled={isUpscaling}>
                    {isUpscaling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    <span className="sr-only">Upscale with AI</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upscale with AI</TooltipContent>
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
          </TooltipProvider>
        </div>
      </Card>
      <Card className="flex-grow w-full h-full overflow-hidden" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        />
      </Card>
    </div>
  );
}
