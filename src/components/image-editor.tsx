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
  const { toast } = useToast();

  const [imageRect, setImageRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
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

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeHandle || isPanning) return;
    
    const pos = getMousePos(e);
    const handles = getHandles();
    let newCursor = 'grab';

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const pos = getMousePos(e);
    const deltaX = pos.x - lastMousePos.x;
    const deltaY = pos.y - lastMousePos.y;

    if (activeHandle) {
      setImageRect(currentRect => {
        let { x, y, width, height } = currentRect;
        const aspectRatio = imageRef.current.width / imageRef.current.height;
        
        let newWidth = width;
        let deltaWidth = 0;

        if (activeHandle.includes('Right')) {
          deltaWidth = deltaX;
        } else if (activeHandle.includes('Left')) {
          deltaWidth = -deltaX;
        }
        
        newWidth = Math.max(MIN_DIMENSION, width + deltaWidth);
        const newHeight = newWidth / aspectRatio;

        if (activeHandle.includes('Left')) {
          x -= newWidth - width;
        }
        if (activeHandle.includes('Top')) {
          y -= newHeight - height;
        }
        
        return { x, y, width: newWidth, height: newHeight };
      });
    } else if (isPanning) {
      setImageRect(r => ({ ...r, x: r.x + deltaX, y: r.y + deltaY }));
    }

    setLastMousePos(pos);
  }, [activeHandle, isPanning, lastMousePos]);

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
  }, [handleMouseMove]);


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

    // The portion of the original image to draw
    const sourceX = (canvas.width / 2 - x - width / 2) / width * img.width;
    const sourceY = (canvas.height / 2 - y - height / 2) / height * img.height;
    const sourceWidth = img.width;
    const sourceHeight = img.height;
    
    // Where on the temp canvas to draw the image
    const destX = 0;
    const destY = 0;
    const destWidth = img.width;
    const destHeight = img.height;
    
    tempCanvas.width = destWidth;
    tempCanvas.height = destHeight;

    const ctx = tempCanvas.getContext('2d')!;
    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);

    // Now, create a final canvas with the exact cropped dimensions
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d')!;

    const cropX = Math.max(0, x);
    const cropY = Math.max(0, y);
    const cropWidth = Math.min(canvas.width, width) - Math.max(0, x) + Math.min(0, x);
    const cropHeight = Math.min(canvas.height, height) - Math.max(0, y) + Math.min(0, y);

    finalCanvas.width = cropWidth;
    finalCanvas.height = cropHeight;
    finalCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    
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
    link.download = 'cropped-image.png';
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
          </TooltipProvider>
        </div>
      </Card>
      <Card className="flex-grow w-full h-full overflow-hidden" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ cursor: isPanning ? 'grabbing' : cursor }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleCanvasMouseMove}
        />
      </Card>
    </div>
  );
}
