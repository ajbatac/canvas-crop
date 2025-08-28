'use client';

import React from 'react';

export function FooterCopyright() {
  return (
    <footer className="w-full py-4 px-4 md:px-6">
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
        - v1.0.0 (
        <a
          href="/changelog.html"
          target="_top"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          changelog
        </a>
        )
      </div>
    </footer>
  );
}
