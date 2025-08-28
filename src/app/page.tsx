'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/file-uploader';
import { ImageEditor } from '@/components/image-editor';
import { Crop } from 'lucide-react';
import { FooterCopyright } from '@/components/footerCopyright';

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
  };

  const handleNewImage = () => {
    setImageFile(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow w-full flex flex-col items-center justify-center bg-background p-4 lg:p-8">
        <div className="w-full max-w-7xl">
          {!imageFile ? (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-3 mb-4">
                <Crop className="w-12 h-12 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
                  Canvas Crop
                </h1>
              </div>
              <p className="max-w-xl text-muted-foreground md:text-lg mb-8">
                A simple tool to resize and crop your images. Drag and drop a file to get started.
              </p>
              <FileUploader onFileSelect={handleFileSelect} />
            </div>
          ) : (
            <ImageEditor imageFile={imageFile} onNewImage={handleNewImage} />
          )}
        </div>
      </main>
      <FooterCopyright />
    </div>
  );
}
