'use client';

import type React from 'react';
import { Crop, FilePlus, FileText, Rss, Trash2, Wrench } from 'lucide-react';
import { FooterCopyright } from '@/components/footer-copyright';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, type badgeVariants } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import type { VariantProps } from 'class-variance-authority';

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

interface ChangelogEntry {
  version: string;
  date: string;
  sections: {
    Added?: string[];
    Changed?: string[];
    Fixed?: string[];
    Removed?: string[];
  };
}

const changelog: readonly ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: '2026-09-09',
    sections: {
      Added: [
        'Interactive Crop Preview modal before saving, enabling you to inspect your exact crop output, select preferred image formats (PNG, JPEG, WebP), adjust compression quality, and copy directly to your clipboard.',
        'Extensive aspect ratio presets including Freeform, Square (1:1), Widescreen (16:9), Standard (4:3), Stories/Reels (9:16), 35mm Classic (3:2 & 2:3), Original Image Ratio, and Circular Avatar cutout.',
        'Non-destructive orientation controls to rotate images clockwise and counter-clockwise in 90-degree steps, or flip horizontally and vertically.',
        'Composition rule-of-thirds alignment grid and softened focus overlay to help frame balanced photos.',
        'RSS feed subscription support for receiving instant updates about new features and improvements.',
      ],
      Changed: [
        'Upgraded the core application framework for significantly faster loading, enhanced security, and smoother responsiveness across desktop and mobile browsers.',
        'Refined touch handles and mouse pointer interactions for pixel-perfect cropping accuracy.',
      ],
      Fixed: [
        'Resolved coordinate and boundary alignment issues when scaling or cropping at high zoom factors.',
        'Fixed image aspect ratio consistency when resizing selections on small screens.',
      ],
    },
  },
  {
    version: '1.2.0',
    date: '2025-08-30',
    sections: {
      Changed: [
        'Improved the UI of the resize handles to have rounded corners and a more prominent hover effect.',
        'The image border is now thin and grey by default, becoming thicker and primary-colored on handle hover for a cleaner look.',
      ],
      Fixed: [
        'Corrected a bug where dragging the top resize handles caused the image to resize in the wrong direction.',
      ],
    },
  },
  {
    version: '1.1.0',
    date: '2025-08-28',
    sections: {
      Added: [
        'Implemented a dark/light mode theme toggle using `next-themes`.',
        'Added a `ThemeProvider` and a `ThemeToggle` button component.',
        'Placed the theme toggle in the header of all pages for easy access.',
        'Added an "Open Source" link to the main page footer.',
      ],
      Changed: [
        'Updated the introductory text on the homepage for clarity and conciseness.',
        'Updated documentation (`README.md`, `CHANGELOG.md`) to reflect the latest changes.',
        'Incremented the project version to `1.1.0`.',
      ],
    },
  },
  {
    version: '1.0.3',
    date: '2025-08-28',
    sections: {
      Changed: [
        'Refactored image editor event handling to support both mouse and touch events, fixing mobile Safari compatibility.',
        'Corrected image resizing logic to strictly maintain aspect ratio and prevent distortion.',
        'Fixed a bug preventing the image from appearing on desktop after mobile fixes were implemented.',
        'Corrected the cropping logic to ensure the output image is properly cropped to the canvas boundaries.',
      ],
      Fixed: [
        'Resolved a console error caused by an incorrect prop name (`onValueValueChange`) in the `Slider` component.',
      ],
    },
  },
  {
    version: '1.0.2',
    date: '2025-08-28',
    sections: {
      Added: [
        'Comprehensive legal pages: `Terms of Service`, `Privacy Policy`, `DMCA Policy`, `Cookie Policy`, `Disclaimer`, and `UGC Disclaimer`.',
        'New `legal-page.tsx` component to provide a consistent layout for all legal documents.',
        'Added `@tailwindcss/typography` plugin for improved content formatting on legal pages.',
        'Added favicon, apple-touch-icon, and web manifest links to the main layout.',
      ],
      Changed: [
        'Updated the footer to include a dedicated section with links to all legal pages.',
        'Updated project documentation (`README.md`, `CHANGELOG.md`) to reflect the latest changes and dependencies.',
        'Incremented the version number in the footer and documentation to `v1.0.2`.',
      ],
    },
  },
  {
    version: '1.0.1',
    date: '2025-08-28',
    sections: {
      Added: [
        'Created a new changelog page at `/changelog` to dynamically display project updates.',
        'Updated all links to point to the new `/changelog` route.',
      ],
      Changed: [
        'Updated documentation (`README.md`, `CHANGELOG.md`) to reflect recent changes.',
        'Incremented the version number in the footer to `v1.0.1`.',
      ],
      Removed: [
        'Deleted the static `public/changelog.html` file in favor of the new dynamic page.',
      ],
    },
  },
  {
    version: '1.0.0',
    date: '2024-08-01',
    sections: {
      Added: [
        'Initial release of Canvas Crop.',
        'Core functionality: image upload, resize, pan, and zoom.',
        'Ability to download the cropped image as a PNG.',
        'Ability to copy the cropped image to the clipboard.',
        'User interface built with Next.js, ShadCN, and Tailwind CSS.',
        'Docker support for both development and production environments.',
        'Comprehensive `README.md` for setup and deployment.',
      ],
      Changed: [
        'Simplified image resizing logic for better performance and maintainability.',
        'Refined cursor behavior to indicate resize and pan actions more clearly.',
      ],
      Removed: [
        'Removed unused UI components and hooks to streamline the project.',
        'Stripped out initial AI and upscaling-related features to focus on a simple, fast resizer.',
      ],
    },
  },
] as const;

interface SectionProps {
  title: string;
  items?: string[];
  icon: React.ElementType;
  badgeVariant: BadgeVariant;
}

function Section({ title, items, icon: Icon, badgeVariant }: SectionProps) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
        <Badge variant={badgeVariant} className="text-sm">
          <Icon className="w-4 h-4 mr-1.5" />
          {title}
        </Badge>
      </h3>
      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
        {items.map((item, index) => (
          <li
            key={index}
            dangerouslySetInnerHTML={{
              __html: item.replace(
                /`([^`]+)`/g,
                '<code class="bg-muted text-muted-foreground font-mono text-sm py-0.5 px-1 rounded-sm">$1</code>'
              ),
            }}
          />
        ))}
      </ul>
    </div>
  );
}

/**
 * Historical changelog page displaying version highlights, features, fixes, and removals.
 */
export default function ChangelogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 lg:p-6 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Crop className="w-8 h-8 text-primary" />
            <Link href="/" className="text-2xl font-bold tracking-tighter text-foreground">
              Canvas Crop
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-grow w-full max-w-4xl mx-auto py-8 px-4 md:px-6">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
              <p className="mt-2 text-muted-foreground">
                All notable changes to this project, based on{' '}
                <a
                  href="https://keepachangelog.com/en/1.0.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Keep a Changelog
                </a>
                .
              </p>
            </div>
            <Link
              href="/changelog/rss"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border border-border bg-card hover:bg-accent text-foreground transition-colors w-fit shadow-xs group"
            >
              <Rss className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>Subscribe to this feed</span>
            </Link>
          </div>
          <div className="space-y-12">
            {changelog.map((entry) => (
              <Card key={entry.version} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-2xl font-bold">Version {entry.version}</span>
                    <Badge variant="outline">{entry.date}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Section
                    title="Added"
                    items={entry.sections.Added}
                    icon={FilePlus}
                    badgeVariant="default"
                  />
                  <Section
                    title="Changed"
                    items={entry.sections.Changed}
                    icon={FileText}
                    badgeVariant="secondary"
                  />
                  <Section
                    title="Fixed"
                    items={entry.sections.Fixed}
                    icon={Wrench}
                    badgeVariant="fixed"
                  />
                  <Section
                    title="Removed"
                    items={entry.sections.Removed}
                    icon={Trash2}
                    badgeVariant="destructive"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <FooterCopyright />
    </div>
  );
}
