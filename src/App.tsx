import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
import { OBJExporter } from 'three-stdlib';
import { Upload, Download, Info, FileBox, AlertCircle, Trash2, Box } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSTL = async (loadedFile: File) => {
    if (!loadedFile.name.toLowerCase().endsWith('.stl')) {
      setError('Please upload a valid STL file.');
      return;
    }

    setLoading(true);
    setError(null);
    setFile(loadedFile);

    try {
      const buffer = await loadedFile.arrayBuffer();
      const loader = new STLLoader();
      const parsedGeometry = loader.parse(buffer);
      parsedGeometry.computeVertexNormals();
      parsedGeometry.center();
      setGeometry(parsedGeometry);
    } catch (err) {
      console.error(err);
      setError('Failed to parse STL file. It might be corrupted.');
      setFile(null);
      setGeometry(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      loadSTL(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      loadSTL(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setGeometry(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const exportToOBJ = () => {
    if (!geometry || !file) return;
    
    try {
      // Create a temporary mesh to export
      const material = new THREE.MeshStandardMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      
      const exporter = new OBJExporter();
      const result = exporter.parse(mesh);
      
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace(/\.stl$/i, '.obj');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to export to OBJ.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Box size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-neutral-900 leading-tight">
              STL to CAD Converter
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              Mesh to Editable Format (OBJ)
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Left Sidebar - Controls */}
        <div className="w-full lg:w-96 bg-white border-r border-neutral-200 flex flex-col overflow-y-auto">
          <div className="p-6 flex-1 flex flex-col gap-6">
            
            {/* Upload Section */}
            <section>
              <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">
                1. Upload STL
              </h2>
              
              {!file ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors duration-200",
                    isDragging 
                      ? "border-indigo-500 bg-indigo-50" 
                      : "border-neutral-300 hover:border-indigo-400 hover:bg-neutral-50"
                  )}
                >
                  <div className="bg-white p-3 rounded-full shadow-sm border border-neutral-100">
                    <Upload className="text-indigo-600" size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-neutral-900">
                      Click or drag STL file here
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Max file size: 50MB recommended
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".stl"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileBox className="text-indigo-600 shrink-0" size={20} />
                    <div className="truncate">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-3 bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-100">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </section>

            {/* Export Section */}
            <section className={cn("transition-opacity duration-300", !geometry && "opacity-50 pointer-events-none")}>
              <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">
                2. Export CAD Format
              </h2>
              
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1 block">
                    Format
                  </label>
                  <select className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm font-medium text-neutral-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                    <option value="obj">Wavefront OBJ (.obj)</option>
                    {/* Could add more formats later if needed */}
                  </select>
                </div>

                <button
                  onClick={exportToOBJ}
                  disabled={!geometry}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Download size={18} />
                  Export File
                </button>
              </div>
            </section>

            {/* Educational Info */}
            <section className="mt-auto pt-6 border-t border-neutral-200">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-blue-900 space-y-2">
                  <p className="font-semibold">Mesh vs. Parametric CAD</p>
                  <p>
                    STL files contain <strong>mesh data</strong> (triangles), not solid parametric bodies.
                  </p>
                  <p>
                    This tool converts your STL to an <strong>OBJ</strong> file, which is widely supported in 3D modeling software (Blender, Maya) and can be imported as a mesh body into CAD tools (Fusion 360, Rhino) for further editing.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Right Area - 3D Preview */}
        <div className="flex-1 bg-neutral-100 relative min-h-[400px] lg:min-h-0">
          {!geometry && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 pointer-events-none z-10">
              <Box size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Upload an STL file to preview</p>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100/80 backdrop-blur-sm z-20">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium text-neutral-600">Processing mesh...</p>
            </div>
          )}

          {geometry && (
            <Canvas shadows camera={{ position: [0, 0, 100], fov: 50 }}>
              <color attach="background" args={['#f5f5f5']} />
              <Stage environment="city" intensity={0.5}>
                <mesh geometry={geometry} castShadow receiveShadow>
                  <meshStandardMaterial 
                    color="#e0e0e0" 
                    roughness={0.4} 
                    metalness={0.1} 
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </Stage>
              <OrbitControls makeDefault autoRotate autoRotateSpeed={1} />
            </Canvas>
          )}
          
          {/* Overlay controls hint */}
          {geometry && (
            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-neutral-600 shadow-sm border border-neutral-200 pointer-events-none">
              Left click to rotate &bull; Scroll to zoom
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
