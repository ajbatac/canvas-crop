'use client';

import React from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Github } from 'lucide-react';

const legalLinks = [
  { href: '/legal/terms-of-service', text: 'Terms of Service' },
  { href: '/legal/privacy-policy', text: 'Privacy Policy' },
  { href: '/legal/dmca-policy', text: 'DMCA Policy' },
  { href: '/legal/cookie-policy', text: 'Cookie Policy' },
  { href: '/legal/disclaimer', text: 'Disclaimer' },
  { href: '/legal/ugc-disclaimer', text: 'UGC Disclaimer' },
];

export function FooterCopyright() {
  return (
    <footer className="w-full py-6 px-4 md:px-6 border-t">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-center text-xs text-muted-foreground">
          Created with ❤️ by{' '}
          <a
            href="https://ajbatac.github.io/?=ImageCropper"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            AJ Batac (@ajbatac)
          </a>{' '}
          - v1.2.0 (
          <a
            href="/changelog"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            changelog
          </a>
          )
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
           <Link
              href="https://github.com/ajbatac/canvas-crop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="w-3 h-3" />
              Open Source
            </Link>
             <Separator orientation="vertical" className="h-4" />
          {legalLinks.map((link, index) => (
            <React.Fragment key={link.href}>
              <Link
                href={link.href}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {link.text}
              </Link>
              {index < legalLinks.length - 1 && (
                <Separator orientation="vertical" className="h-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </footer>
  );
}
