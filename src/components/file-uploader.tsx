'use client';

import type React from 'react';
import { useState, useCallback } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface FileUploaderProps {
  /** Callback fired when a valid image file is selected or dropped */
  onFileSelect: (file: File) => void;
}

const ACCEPTED_TYPES: readonly string[] = [
  'PNG',
  'JPG',
  'JPEG',
  'WEBP',
  'GIF',
  'AVIF',
  'TIFF',
  'BMP',
] as const;

/**
 * Prevents default event behavior and stops bubbling.
 */
function preventAndStop(e: React.SyntheticEvent): void {
  e.preventDefault();
  e.stopPropagation();
}

/**
 * Drag-and-drop and click-to-upload area for selecting local image files.
 * Validates that selected files are valid image types before proceeding.
 */
export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;

      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file (PNG, JPG, WEBP, etc.).',
          variant: 'destructive',
        });
      }
    },
    [onFileSelect, toast]
  );

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    preventAndStop(e);
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    preventAndStop(e);
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    preventAndStop(e);
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      preventAndStop(e);
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={cn(
        'relative w-full max-w-xl transition-all duration-300',
        isDragging && 'scale-[1.02]'
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Gradient border ring */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl transition-opacity duration-300',
          'bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500',
          isDragging ? 'opacity-100 blur-sm' : 'opacity-0'
        )}
      />

      <label
        htmlFor="file-upload"
        className={cn(
          'relative flex flex-col items-center justify-center gap-5 cursor-pointer',
          'rounded-2xl border-2 border-dashed px-8 py-10 md:py-14 transition-all duration-300',
          isDragging
            ? 'border-violet-500/70 bg-violet-50/80 dark:bg-violet-950/30'
            : 'border-border hover:border-primary/40 bg-card hover:bg-accent/30'
        )}
      >
        {/* Icon area */}
        <div
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300 shadow-sm',
            isDragging
              ? 'bg-violet-100 dark:bg-violet-900/50 scale-110'
              : 'bg-muted'
          )}
        >
          {isDragging ? (
            <ImageIcon className="h-9 w-9 text-violet-600 dark:text-violet-400" />
          ) : (
            <Upload className="h-9 w-9 text-muted-foreground" />
          )}
        </div>

        {/* Text */}
        <div className="space-y-1.5 text-center">
          {isDragging ? (
            <>
              <p className="text-lg font-semibold text-violet-700 dark:text-violet-300">
                Release to open
              </p>
              <p className="text-sm text-violet-500/80 dark:text-violet-400/80">
                Your image will load instantly
              </p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-foreground">
                Drop your image here
              </p>
              <p className="text-sm text-muted-foreground">
                or{' '}
                <span className="text-primary font-medium underline underline-offset-2">
                  click to browse
                </span>
              </p>
            </>
          )}
        </div>

        {/* Accepted formats */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {ACCEPTED_TYPES.map((type) => (
            <span
              key={type}
              className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-muted text-muted-foreground border"
            >
              {type}
            </span>
          ))}
        </div>

        <input
          id="file-upload"
          type="file"
          className="sr-only"
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
