import type { Metadata } from 'next';
import type React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Canvas Crop — Free Online Image Cropping Tool',
  description:
    'Crop, rotate, flip, and export images in PNG, JPEG, or WebP — entirely in your browser. No uploads. No account. 100% private.',
  keywords: 'image cropper, crop image online, aspect ratio crop, circle crop avatar, free image editor, privacy, no upload',
  openGraph: {
    title: 'Canvas Crop — Free Online Image Cropping Tool',
    description:
      'Crop, rotate, and export images — entirely in your browser. No uploads, no tracking.',
    type: 'website',
  },
};

/**
 * Root application layout establishing fonts, theme provider, and global toaster.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body
        className={cn(
          'min-h-screen font-body antialiased',
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
