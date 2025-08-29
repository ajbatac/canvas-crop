'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/file-uploader';
import { ImageEditor } from '@/components/image-editor';
import { Crop, Scale, ZoomIn, Download, Copy, Github } from 'lucide-react';
import { FooterCopyright } from '@/components/footerCopyright';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <Card className="text-left">
    <CardHeader className="flex flex-row items-center gap-4 pb-2">
      <div className="bg-primary/10 p-2 rounded-lg">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);


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
              <div className="flex items-center gap-3 mb-2">
                <Crop className="w-12 h-12 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
                  Canvas Crop
                </h1>
              </div>
              <Link href="https://github.com/ajbatac/canvas-crop" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 text-sm">
                <Github className="w-4 h-4" />
                <span>Open Source</span>
              </Link>
              <p className="max-w-2xl text-muted-foreground mb-8 text-base">
                A simple tool to resize and crop your images. Your privacy is paramount—everything happens on your local computer, so your files are never uploaded or saved. Drag and drop a file to get started.
              </p>
              <FileUploader onFileSelect={handleFileSelect} />

              <div className="max-w-4xl mx-auto mt-12 w-full">
                <h2 className="text-2xl font-bold text-center mb-6">What can you do with this tool?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FeatureCard
                    icon={Scale}
                    title="Resize Your Image"
                    description="Easily make your image larger or smaller. Just drag the corners to get the perfect size."
                  />
                  <FeatureCard
                    icon={Crop}
                    title="Crop Your Picture"
                    description="The canvas is your frame. What you see is what you get, so anything outside the box is automatically cropped."
                  />
                  <FeatureCard
                    icon={ZoomIn}
                    title="Zoom and Pan"
                    description="Get a closer look by zooming in, and move the image around to focus on the exact spot you need."
                  />
                  <FeatureCard
                    icon={Download}
                    title="Download or Copy"
                    description="Save the finished image to your computer or copy it straight to your clipboard with a single click."
                  />
                </div>
              </div>

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
