# Canvas Crop - A Simple Image Resizer

Canvas Crop is a straightforward, client-side web application for resizing and cropping images. Built with Next.js, React, and TypeScript, it offers a clean, intuitive interface for all your basic image manipulation needs. Drag, drop, resize, and crop with ease, then copy to your clipboard or download the final image.

![Canvas Crop Screenshot](https://storage.googleapis.com/stedi-assets/studio-canvas-crop.png)

## Features

-   **Drag and Drop**: Easily upload images by dragging them onto the application.
-   **Client-Side Processing**: All image processing happens in your browser, ensuring privacy and speed.
-   **Interactive Resizing & Panning**: Click and drag corners to resize or move the image within the canvas.
-   **Zoom Functionality**: Zoom in and out for precise adjustments.
-   **Copy to Clipboard**: Instantly copy the edited image to your clipboard.
-   **Download Image**: Save the final resized and cropped image as a PNG file.
-   **Responsive Design**: Works seamlessly on both desktop and mobile devices.

---

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or later recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)
-   [Docker](https://www.docker.com/) (optional, for containerized setup)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/canvas-crop.git
    cd canvas-crop
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

### Dockerized Setup

For a containerized development environment, use the provided Docker configurations.

1.  **Build the development Docker image:**
    ```sh
    docker build -t canvas-crop-dev -f Dockerfile.dev .
    ```

2.  **Run the container:**
    ```sh
    docker run -p 9002:9002 -v .:/app canvas-crop-dev
    ```
    This will start the development server, and you can access it at [http://localhost:9002](http://localhost:9002).

---

## Deployment

The application is configured for production builds and can be deployed to any platform that supports Node.js or Docker containers, such as Vercel, Netlify, or Google Cloud Run.

### Production Build

To create a production-ready build, run:
```sh
npm run build
```
This will compile the application into an optimized set of static files in the `.next` directory.

### Production Start

To run the production server, use:
```sh
npm start
```

### Docker Production Deployment

1.  **Build the production Docker image:**
    ```sh
    docker build -t canvas-crop-prod -f Dockerfile.prod .
    ```

2.  **Run the production container:**
    ```sh
    docker run -p 3000:3000 canvas-crop-prod
    ```
    The application will be available at `http://localhost:3000`.

---

## Project Structure

The project follows a standard Next.js App Router structure. Here is an overview of the key files and directories:

```
.
├── public/                 # Static assets (images, fonts, etc.)
│   └── changelog.html      # HTML version of the changelog
├── src/
│   ├── app/                # Application routes and pages
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout component
│   │   └── page.tsx        # Main application page component
│   ├── components/         # Reusable React components
│   │   ├── ui/             # ShadCN UI components
│   │   ├── file-uploader.tsx # Component for uploading files
│   │   ├── image-editor.tsx  # Core image editing component
│   │   └── footerCopyright.tsx # Footer component with author credit
│   ├── hooks/              # Custom React hooks
│   │   └── use-toast.ts    # Hook for displaying toast notifications
│   ├── lib/                # Utility functions
│   │   └── utils.ts        # General utility functions (e.g., cn for classnames)
├── .env                    # Environment variables (empty by default)
├── Dockerfile.dev          # Docker configuration for development
├── Dockerfile.prod         # Docker configuration for production
├── next.config.ts          # Next.js configuration file
├── package.json            # Project dependencies and scripts
├── README.md               # This file
└── tsconfig.json           # TypeScript configuration
```

---

## Dependencies

-   **next**: `^15.3.3` - The React framework for production.
-   **react**: `^18.3.1` - A JavaScript library for building user interfaces.
-   **react-dom**: `^18.3.1` - Serves as the entry point to the DOM and server renderers for React.
-   **typescript**: `^5` - A typed superset of JavaScript that compiles to plain JavaScript.
-   **tailwindcss**: `^3.4.1` - A utility-first CSS framework for rapid UI development.
-   **shadcn/ui**: Various - A collection of re-usable components built using Radix UI and Tailwind CSS.
-   **lucide-react**: `^0.475.0` - A library of simply beautiful and consistent icons.
-   **clsx**: `^2.1.1` - A tiny utility for constructing `className` strings conditionally.
-   **tailwind-merge**: `^3.0.1` - A utility to intelligently merge Tailwind CSS classes.

---

## Troubleshooting

-   **"Could not copy image to clipboard" error**: This can sometimes be a browser security issue. Ensure you are serving the application over HTTPS in production, as some browser APIs require a secure context.
-   **Image quality**: The output image is a PNG. The resizing algorithm in the browser is standard quality; for professional-grade resizing, dedicated software may be better.

---

Created with ❤️ by <a href="https://ajbatac.github.io/?=ImageCropper" target="_blank">AJ Batac (@ajbatac)</a> - v1.0.0 (<a href="/public/changelog.html" target="_top">changelog</a>)
