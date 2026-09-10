import { CANONICAL_URL, APP_NAME } from '@/lib/constants';

interface ChangelogEntry {
  version: string;
  date: string;
  pubDate: string;
  sections: {
    Added?: string[];
    Changed?: string[];
    Fixed?: string[];
    Removed?: string[];
  };
}

const changelogEntries: readonly ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: '2026-09-09',
    pubDate: 'Wed, 09 Sep 2026 00:00:00 GMT',
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
    pubDate: 'Sat, 30 Aug 2025 00:00:00 GMT',
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
    pubDate: 'Thu, 28 Aug 2025 00:00:00 GMT',
    sections: {
      Added: [
        'Implemented a dark/light mode theme toggle using next-themes.',
        'Added a ThemeProvider and a ThemeToggle button component.',
        'Placed the theme toggle in the header of all pages for easy access.',
        'Added an "Open Source" link to the main page footer.',
      ],
      Changed: [
        'Updated the introductory text on the homepage for clarity and conciseness.',
        'Updated documentation (README.md, CHANGELOG.md) to reflect the latest changes.',
        'Incremented the project version to 1.1.0.',
      ],
    },
  },
  {
    version: '1.0.3',
    date: '2025-08-28',
    pubDate: 'Thu, 28 Aug 2025 00:00:00 GMT',
    sections: {
      Changed: [
        'Refactored image editor event handling to support both mouse and touch events, fixing mobile Safari compatibility.',
        'Corrected image resizing logic to strictly maintain aspect ratio and prevent distortion.',
        'Fixed a bug preventing the image from appearing on desktop after mobile fixes were implemented.',
        'Corrected the cropping logic to ensure the output image is properly cropped to the canvas boundaries.',
      ],
      Fixed: [
        'Resolved a console error caused by an incorrect prop name (onValueValueChange) in the Slider component.',
      ],
    },
  },
  {
    version: '1.0.2',
    date: '2025-08-28',
    pubDate: 'Thu, 28 Aug 2025 00:00:00 GMT',
    sections: {
      Added: [
        'Comprehensive legal pages: Terms of Service, Privacy Policy, DMCA Policy, Cookie Policy, Disclaimer, and UGC Disclaimer.',
        'New legal-page component to provide a consistent layout for all legal documents.',
        'Added @tailwindcss/typography plugin for improved content formatting on legal pages.',
        'Added favicon, apple-touch-icon, and web manifest links to the main layout.',
      ],
      Changed: [
        'Updated the footer to include a dedicated section with links to all legal pages.',
        'Updated project documentation (README.md, CHANGELOG.md) to reflect the latest changes and dependencies.',
        'Incremented the version number in the footer and documentation to v1.0.2.',
      ],
    },
  },
  {
    version: '1.0.1',
    date: '2025-08-28',
    pubDate: 'Thu, 28 Aug 2025 00:00:00 GMT',
    sections: {
      Added: [
        'Created a new changelog page at /changelog to dynamically display project updates.',
        'Updated all links to point to the new /changelog route.',
      ],
      Changed: [
        'Updated documentation (README.md, CHANGELOG.md) to reflect recent changes.',
        'Incremented the version number in the footer to v1.0.1.',
      ],
      Removed: [
        'Deleted the static public/changelog.html file in favor of the new dynamic page.',
      ],
    },
  },
  {
    version: '1.0.0',
    date: '2024-08-01',
    pubDate: 'Thu, 01 Aug 2024 00:00:00 GMT',
    sections: {
      Added: [
        'Initial release of Canvas Crop.',
        'Core functionality: image upload, resize, pan, and zoom.',
        'Ability to download the cropped image as a PNG.',
        'Ability to copy the cropped image to the clipboard.',
        'User interface built with Next.js, ShadCN, and Tailwind CSS.',
        'Docker support for both development and production environments.',
        'Comprehensive README.md for setup and deployment.',
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

function buildDescriptionHtml(sections: ChangelogEntry['sections']): string {
  const parts: string[] = [];
  const sectionKeys = ['Added', 'Changed', 'Fixed', 'Removed'] as const;

  for (const key of sectionKeys) {
    const items = sections[key];
    if (items && items.length > 0) {
      parts.push(`<h4>${key}</h4>`);
      parts.push('<ul>');
      for (const item of items) {
        // Escape HTML special characters for safe output
        const escaped = item
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        parts.push(`  <li>${escaped}</li>`);
      }
      parts.push('</ul>');
    }
  }

  return parts.join('\n');
}

export function generateRssFeedXml(): string {
  const itemsXml = changelogEntries
    .map((entry) => {
      const description = buildDescriptionHtml(entry.sections);
      return `    <item>
      <title>${APP_NAME} v${entry.version} (${entry.date})</title>
      <link>${CANONICAL_URL}/changelog</link>
      <guid isPermaLink="false">${CANONICAL_URL}/changelog#v${entry.version}</guid>
      <pubDate>${entry.pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${APP_NAME} Changelog</title>
    <link>${CANONICAL_URL}/changelog</link>
    <description>All notable changes, bug fixes, and feature updates for ${APP_NAME}.</description>
    <language>en-us</language>
    <lastBuildDate>${changelogEntries[0]?.pubDate ?? new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${CANONICAL_URL}/changelog/rss" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;
}

export async function GET() {
  const xml = generateRssFeedXml();
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
