# STL to Editable CAD Converter

A web-based tool that allows users to upload STL (Stereolithography) 3D model files, preview them interactively in 3D, and export them to the Wavefront OBJ format. OBJ files are widely supported and can be imported as editable mesh bodies into various CAD and 3D modeling software (like Fusion 360, Blender, Rhino, and Maya).

## Features

- **Drag-and-Drop Interface**: Easily upload `.stl` files by dragging them into the browser.
- **Interactive 3D Preview**: View, rotate, and zoom your 3D models before converting them, powered by Three.js and React Three Fiber.
- **Instant Conversion**: Converts STL mesh data to OBJ format instantly.
- **100% Client-Side**: All processing happens locally in your web browser. No files are uploaded to any server, ensuring complete privacy and zero cloud computing costs.

## What the Code Does

This application is built using **React**, **Vite**, and **Tailwind CSS**. The core 3D functionality relies on the `three` ecosystem:

1. **File Parsing**: When an STL file is uploaded, the app uses `STLLoader` from `three-stdlib` to read the binary or ASCII mesh data and convert it into a `THREE.BufferGeometry`.
2. **3D Rendering**: The parsed geometry is passed to a `<Canvas>` component from `@react-three/fiber`. It is rendered with a standard material inside a `<Stage>` environment (from `@react-three/drei`) which automatically handles lighting, shadows, and centering.
3. **Exporting**: When the user clicks "Export", the app wraps the geometry in a temporary mesh and uses `OBJExporter` to generate a standard `.obj` text string. This string is converted into a Blob and downloaded directly to the user's machine.

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS + Lucide React (Icons)
- **3D Rendering**: Three.js, @react-three/fiber, @react-three/drei, three-stdlib

## Getting Started (Local Development)

To run this project locally on your machine:

1. **Clone the repository** (if you haven't already).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000` (or the port specified in your terminal).

## Deployment

This app is a static Single Page Application (SPA) and can be hosted for free on platforms like **GitHub Pages**, **Vercel**, or **Netlify**. 

To deploy to GitHub Pages, you can use the official GitHub Actions workflow for Vite projects. Remember to set the `base` path in `vite.config.ts` to match your repository name if you are not using a custom domain.

## License

This project is open-source and available under the [MIT License](LICENSE).
