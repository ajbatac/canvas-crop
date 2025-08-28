import type React from 'react';
import { Crop } from 'lucide-react';
import { FooterCopyright } from '@/components/footerCopyright';

interface LegalPageProps {
  title: string;
  children: React.ReactNode;
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 lg:p-6 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <Crop className="w-8 h-8 text-primary" />
          <a href="/" className="text-2xl font-bold tracking-tighter text-foreground">
            Canvas Crop
          </a>
        </div>
      </header>
      <main className="flex-grow w-full max-w-4xl mx-auto py-8 px-4 md:px-6">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>{title}</h1>
          {children}
        </div>
      </main>
      <FooterCopyright />
    </div>
  );
}
