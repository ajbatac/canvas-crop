'use client';

import { Crop } from 'lucide-react';
import { FooterCopyright } from '@/components/footerCopyright';

export default function ChangelogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 lg:p-6 border-b">
        <div className="flex items-center gap-3">
            <Crop className="w-8 h-8 text-primary" />
            <a href="/" className="text-2xl font-bold tracking-tighter text-foreground">
              Canvas Crop
            </a>
        </div>
      </header>
      <main className="flex-grow w-full max-w-4xl mx-auto py-8 px-4 md:px-6">
        <div className="prose prose-stone dark:prose-invert">
            <h1>Changelog</h1>
            <p>All notable changes to this project will be documented in this file. The format is based on <a href="https://keepachangelog.com/en/1.0.0/">Keep a Changelog</a>, and this project adheres to <a href="https://semver.org/spec/v2.0.0.html">Semantic Versioning</a>.</p>
            
            <h2>[1.0.1] - 2025-08-28</h2>
            <h3>Added</h3>
            <ul>
                <li>Created a new changelog page at <code>/changelog</code> to dynamically display project updates.</li>
                <li>Updated all links to point to the new <code>/changelog</code> route.</li>
            </ul>
            <h3>Changed</h3>
            <ul>
                <li>Updated documentation (<code>README.md</code>, <code>CHANGELOG.md</code>) to reflect recent changes.</li>
                <li>Incremented the version number in the footer to <code>v1.0.1</code>.</li>
            </ul>
            <h3>Removed</h3>
            <ul>
                <li>Deleted the static <code>public/changelog.html</code> file in favor of the new dynamic page.</li>
            </ul>

            <hr/>

            <h2>[1.0.0] - 2024-08-01</h2>
            <h3>Added</h3>
            <ul>
                <li>Initial release of Canvas Crop.</li>
                <li>Core functionality: image upload, resize, pan, and zoom.</li>
                <li>Ability to download the cropped image as a PNG.</li>
                <li>Ability to copy the cropped image to the clipboard.</li>
                <li>User interface built with Next.js, ShadCN, and Tailwind CSS.</li>
                <li>Docker support for both development and production environments.</li>
                <li>Comprehensive <code>README.md</code> for setup and deployment.</li>
            </ul>
            <h3>Changed</h3>
            <ul>
                <li>Simplified image resizing logic for better performance and maintainability.</li>
                <li>Refined cursor behavior to indicate resize and pan actions more clearly.</li>
            </ul>
            <h3>Removed</h3>
            <ul>
                <li>Removed unused UI components and hooks to streamline the project.</li>
                <li>Stripped out initial AI and upscaling-related features to focus on a simple, fast resizer.</li>
            </ul>
        </div>
      </main>
      <FooterCopyright />
    </div>
  );
}
