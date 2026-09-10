'use client';

import { useState } from 'react';
import type React from 'react';
import { FileUploader } from '@/components/file-uploader';
import { ImageEditor } from '@/components/image-editor';
import {
  Crop,
  RectangleHorizontal,
  RotateCcw,
  Download,
  Github,
  Lock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { FooterCopyright } from '@/components/footerCopyright';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
}

const features: Feature[] = [
  {
    icon: Crop,
    title: 'Interactive Crop Box',
    description:
      'Drag 8 precision handles — corners and edges — with a real-time rule-of-thirds composition guide and a dark scrim overlay over cropped-out regions.',
    accent: 'violet',
  },
  {
    icon: RectangleHorizontal,
    title: 'Aspect Ratio Presets',
    description:
      'One click to lock to 1:1 avatar, 16:9 widescreen, 4:3 photo, 9:16 Stories / Reels, 3:2 film, 2:3 portrait, or crop freely without constraints.',
    accent: 'blue',
  },
  {
    icon: RotateCcw,
    title: 'Rotate, Flip & Circle Crop',
    description:
      'Rotate in 90° increments, flip horizontally or vertically, zoom to inspect fine details, or enable circular avatar mode for perfectly round cutouts.',
    accent: 'purple',
  },
  {
    icon: Download,
    title: 'Lossless High-Res Export',
    description:
      'Always crops at the original full native resolution. Export as PNG (transparency-safe), JPEG (with quality control), or modern WebP — or copy directly to your clipboard.',
    accent: 'pink',
  },
];

const accentMap: Record<string, { bg: string; icon: string; badge: string }> = {
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    icon: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    icon: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    icon: 'text-pink-600 dark:text-pink-400',
    badge: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
  },
};

function FeatureCard({ icon: Icon, title, description, accent }: Feature) {
  const colors = accentMap[accent];
  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.bg} transition-colors`}>
        <Icon className={`h-5 w-5 ${colors.icon}`} />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-semibold text-foreground tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 md:px-6 py-3 border-b bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Crop className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm tracking-tight">Canvas Crop</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="https://github.com/ajbatac/canvas-crop"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-grow w-full flex flex-col items-center pt-14 bg-background">
        {!imageFile ? (
          /* ── Landing page ── */
          <div className="w-full">
            {/* Hero Section */}
            <section className="relative w-full overflow-hidden hero-grid">
              {/* Glow overlay */}
              <div className="absolute inset-0 hero-glow pointer-events-none" />

              <div className="relative max-w-4xl mx-auto flex flex-col items-center justify-center text-center px-4 pt-20 pb-24 md:pt-28 md:pb-32">
                {/* Privacy badge */}
                <div className="animate-fade-up inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border bg-background/80 backdrop-blur-sm text-xs font-medium text-muted-foreground shadow-sm">
                  <Lock className="h-3 w-3 text-emerald-500" />
                  100% private — nothing is ever uploaded or sent to any server
                  <ChevronRight className="h-3 w-3 opacity-50" />
                </div>

                {/* Title */}
                <h1 className="animate-fade-up-delay-1 text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-[0.95]">
                  The image{' '}
                  <span className="gradient-text">cropping tool</span>
                  <br />
                  that respects you
                </h1>

                {/* Subtitle */}
                <p className="animate-fade-up-delay-2 max-w-xl text-base md:text-lg text-muted-foreground mb-10 leading-relaxed">
                  Professional crop, rotate, flip, and export — entirely in your browser.
                  Your images never leave your device.
                </p>

                {/* Uploader */}
                <div className="animate-fade-up-delay-3 w-full max-w-xl">
                  <FileUploader onFileSelect={setImageFile} />
                </div>

                {/* Stats row */}
                <div className="animate-fade-up-delay-4 mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
                  {[
                    ['8', 'Crop handles'],
                    ['8', 'Aspect ratio presets'],
                    ['3', 'Export formats'],
                    ['0', 'Data uploaded'],
                  ].map(([num, label]) => (
                    <div key={label} className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-foreground tabular-nums">{num}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Feature Grid */}
            <section className="w-full border-t bg-background">
              <div className="max-w-5xl mx-auto px-4 py-20 md:py-28">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">Features</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-center mb-3">
                  Everything you need,{' '}
                  <span className="text-muted-foreground font-normal">nothing you don&apos;t.</span>
                </h2>
                <p className="text-muted-foreground text-center text-sm mb-12 max-w-lg mx-auto">
                  Built for designers, developers, and anyone who needs precise image output without uploading to third-party servers.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {features.map((feature) => (
                    <FeatureCard key={feature.title} {...feature} />
                  ))}
                </div>

                {/* Open source CTA */}
                <div className="mt-16 flex flex-col items-center gap-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    Open source and free forever.
                  </p>
                  <Link
                    href="https://github.com/ajbatac/canvas-crop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground border rounded-xl px-4 py-2 hover:bg-muted transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    View source on GitHub
                  </Link>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* ── Editor ── */
          <div className="w-full max-w-7xl px-4 pb-4 pt-4">
            <ImageEditor imageFile={imageFile} onNewImage={() => setImageFile(null)} />
          </div>
        )}
      </main>

      <FooterCopyright />
    </div>
  );
}
