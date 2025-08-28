'use client';

import { Crop, FilePlus, FileText, Trash2 } from 'lucide-react';
import { FooterCopyright } from '@/components/footerCopyright';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const changelog = [
  {
    version: '1.0.2',
    date: '2025-08-28',
    sections: {
      Added: [
        'Comprehensive legal pages: `Terms of Service`, `Privacy Policy`, `DMCA Policy`, `Cookie Policy`, `Disclaimer`, and `UGC Disclaimer`.',
        'New `legal-page.tsx` component to provide a consistent layout for all legal documents.',
        'Added `@tailwindcss/typography` plugin for improved content formatting on legal pages.',
      ],
      Changed: [
        'Updated the footer to include a dedicated section with links to all legal pages.',
        'Updated project documentation (`README.md`, `CHANGELOG.md`) to reflect the latest changes and dependencies.',
        'Incremented the version number in the footer and documentation to `v1.0.2`.',
      ],
      Removed: [],
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
];

const Section = ({ title, items, icon: Icon, badgeVariant }: { title: string, items: string[], icon: React.ElementType, badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }) => {
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
          <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/`([^`]+)`/g, '<code class="bg-muted text-muted-foreground font-mono text-sm py-0.5 px-1 rounded-sm">$&</code>') }}></li>
        ))}
      </ul>
    </div>
  );
};

export default function ChangelogPage() {
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
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
            <p className="mt-2 text-muted-foreground">
              All notable changes to this project, based on{' '}
              <a href="https://keepachangelog.com/en/1.0.0/" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">
                Keep a Changelog
              </a>.
            </p>
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
                  <Section title="Added" items={entry.sections.Added} icon={FilePlus} badgeVariant="default" />
                  <Section title="Changed" items={entry.sections.Changed} icon={FileText} badgeVariant="secondary" />
                  <Section title="Removed" items={entry.sections.Removed} icon={Trash2} badgeVariant="destructive" />
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
