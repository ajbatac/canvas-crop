'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Check } from 'lucide-react';
import {
  ExportFormat,
  getCanvasBlob,
  getCanvasDataUrl,
  copyCanvasToClipboard,
  downloadFile,
  formatExportFilename,
  formatBytes,
} from '@/lib/crop-utils';
import { useToast } from '@/hooks/use-toast';

export interface CropPreviewDialogProps {
  /** Whether the modal preview dialog is visible */
  open: boolean;
  /** Callback fired when the dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** The rendered cropped canvas to display and export */
  croppedCanvas: HTMLCanvasElement | null;
  /** Original uploaded image filename used to derive the export name */
  originalFileName: string;
}

const EXPORT_FORMATS: readonly ExportFormat[] = ['png', 'jpeg', 'webp'] as const;

/**
 * Modal dialog presenting a high-fidelity preview of the cropped result,
 * allowing format selection (PNG, JPEG, WebP), quality adjustments, and export/copy actions.
 */
export function CropPreviewDialog({
  open,
  onOpenChange,
  croppedCanvas,
  originalFileName,
}: CropPreviewDialogProps) {
  const { toast } = useToast();
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState<number>(0.92);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isCopyProcessing, setIsCopyProcessing] = useState(false);

  useEffect(() => {
    if (!open || !croppedCanvas) return;

    let isMounted = true;
    const updatePreview = async () => {
      try {
        const url = getCanvasDataUrl(croppedCanvas, format, quality);
        const blob = await getCanvasBlob(croppedCanvas, format, quality);
        if (isMounted) {
          setPreviewUrl(url);
          setFileSize(blob.size);
        }
      } catch (err) {
        console.error('Failed to generate preview', err);
      }
    };

    void updatePreview();
    return () => {
      isMounted = false;
    };
  }, [open, croppedCanvas, format, quality]);

  if (!croppedCanvas) return null;

  const width = croppedCanvas.width;
  const height = croppedCanvas.height;

  const handleCopy = async () => {
    if (!croppedCanvas || isCopyProcessing) return;
    try {
      setIsCopyProcessing(true);
      await copyCanvasToClipboard(croppedCanvas);
      setIsCopied(true);
      toast({
        title: 'Copied to Clipboard!',
        description: 'PNG image copied with full transparency.',
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Copy Failed',
        description: 'Could not copy image to clipboard in this browser.',
        variant: 'destructive',
      });
    } finally {
      setIsCopyProcessing(false);
    }
  };

  const handleDownload = () => {
    if (previewUrl.length === 0) return;
    const filename = formatExportFilename(originalFileName, width, height, format);
    downloadFile(previewUrl, filename);
    toast({
      title: 'Download Started',
      description: `Saved as ${filename}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6 gap-5">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-xl">
              Cropped Image Preview
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                {width} × {height} px
              </Badge>
              {fileSize > 0 && (
                <Badge variant="outline" className="font-mono text-xs">
                  {formatBytes(fileSize)}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Image Preview Canvas Area */}
        <div className="relative flex-1 min-h-[260px] max-h-[420px] rounded-xl border bg-muted/30 overflow-hidden flex items-center justify-center p-4">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #8882 25%, transparent 25%),
                linear-gradient(-45deg, #8882 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #8882 75%),
                linear-gradient(-45deg, transparent 75%, #8882 75%)
              `,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          />
          {previewUrl.length > 0 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Cropped output preview"
              className="relative max-h-full max-w-full object-contain rounded-md shadow-md border"
            />
          )}
        </div>

        {/* Export settings */}
        <div className="flex flex-col gap-4 bg-muted/40 p-4 rounded-xl border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Format:</span>
              <div className="inline-flex rounded-lg border bg-background p-0.5">
                {EXPORT_FORMATS.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`px-3 py-1 text-xs font-semibold uppercase rounded-md transition-all ${
                      format === fmt
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {format !== 'png' && (
              <div className="flex items-center gap-3 min-w-[200px] flex-1 max-w-xs">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Quality: {Math.round(quality * 100)}%
                </span>
                <Slider
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={[quality]}
                  onValueChange={([val = 0.92]) => setQuality(val)}
                  className="flex-1"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between gap-2 pt-2 border-t">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Back to Editor
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={isCopyProcessing}
              className="gap-2"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
            <Button size="sm" onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download {format.toUpperCase()}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
