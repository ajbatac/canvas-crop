'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/file-uploader';
import { ImageEditor } from '@/components/image-editor';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
  };

  const handleNewImage = () => {
    setImageFile(null);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 lg:p-8">
      <div className="w-full max-w-7xl">
        {!imageFile ? (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-12 h-12 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
                Canvas Crop
              </h1>
            </div>
            <p className="max-w-xl text-muted-foreground md:text-lg mb-8">
              An AI-powered image tool to resize, crop, and upscale your images with ease. Drag and drop a file to get started.
            </p>
            <FileUploader onFileSelect={handleFileSelect} />
          </div>
        ) : (
          <ImageEditor imageFile={imageFile} onNewImage={handleNewImage} />
        )}
      </div>
    </main>
  );
}
