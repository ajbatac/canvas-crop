'use client';

import type React from 'react';
import { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback((file: File | null | undefined) => {
    if (file) {
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file (e.g., PNG, JPG, WEBP).',
          variant: 'destructive',
        });
      }
    }
  }, [onFileSelect, toast]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    handleFile(file);
  };

  return (
    <div
      className={cn(
        'w-full max-w-lg rounded-lg p-1 bg-gradient-to-r from-purple-500 to-orange-500 transition-all duration-300',
        isDragging && 'scale-105'
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Card 
        className={cn(
          'w-full h-full border-2 border-dashed transition-all duration-300 bg-background',
          isDragging ? 'border-transparent' : 'border-background'
        )}
      >
        <CardContent className="p-6">
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
            <div className={cn(
              'flex h-24 w-24 items-center justify-center rounded-full transition-colors',
              isDragging ? 'bg-accent' : 'bg-muted'
            )}>
              <Upload className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-lg font-semibold">Drag & drop your image here</p>
              <p className="text-muted-foreground">or <span className="text-primary font-medium">click to browse</span></p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
