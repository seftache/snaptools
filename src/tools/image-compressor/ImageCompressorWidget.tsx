"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, Zap, Image as ImageIcon } from 'lucide-react';

export default function ImageCompressorWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [compressedDataUrl, setCompressedDataUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressImage = (imageFile: File, q: number) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0);
        
        // Output as WebP for best compression, fallback to JPEG
        const type = imageFile.type === 'image/png' ? 'image/png' : 'image/webp';
        // PNG doesn't support quality in canvas, so if it's png we just convert to webp if we want quality reduction, or stick to jpeg.
        const outputType = imageFile.type === 'image/png' && q > 0.99 ? 'image/png' : 'image/jpeg';
        
        const dataUrl = canvas.toDataURL(outputType, q);
        setCompressedDataUrl(dataUrl);
        
        // Calculate size
        const base64str = dataUrl.split(',')[1];
        const decoded = atob(base64str);
        setCompressedSize(decoded.length);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  };

  useEffect(() => {
    if (file) {
      compressImage(file, quality);
    }
  }, [file, quality]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
    }
  };

  const downloadResult = () => {
    if (compressedDataUrl) {
      const a = document.createElement('a');
      a.href = compressedDataUrl;
      a.download = `compressed-${file?.name || 'image.jpg'}`;
      a.click();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg backdrop-blur-md">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
        <Zap className="w-6 h-6 text-yellow-400" />
        Image Compressor
      </h2>

      {!file ? (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-12 text-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-500/5 transition-all group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => {
              if (e.target.files?.[0]) setFile(e.target.files[0]);
            }} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="bg-yellow-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-lg font-medium text-[var(--text-primary)] mb-2">
            Click or drag an image here
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-primary)]">Compression Level</span>
              <span className="text-yellow-400 font-mono">{Math.round(quality * 100)}% Quality</span>
            </div>
            <input 
              type="range" 
              min="0.1" max="1" step="0.05" 
              value={quality} 
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full accent-yellow-500 h-2 bg-black/30 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-400">Original ({formatSize(file.size)})</span>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden bg-black/20 border border-[var(--border-subtle)] flex items-center justify-center p-2">
                <img src={URL.createObjectURL(file)} alt="Original" className="max-w-full max-h-full object-contain" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-400">
                  Compressed ({formatSize(compressedSize)}) 
                  <span className="text-green-400 ml-2">
                    (-{Math.round((1 - compressedSize / file.size) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden bg-black/20 border border-[var(--border-subtle)] flex items-center justify-center p-2 relative">
                {compressedDataUrl ? (
                  <img src={compressedDataUrl} alt="Compressed" className="max-w-full max-h-full object-contain" />
                ) : (
                  <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin" />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button 
              onClick={() => setFile(null)}
              className="px-4 py-2 rounded-lg font-medium text-sm border border-[var(--border-subtle)] hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={downloadResult}
              className="px-6 py-2 rounded-lg font-medium text-sm bg-yellow-500 hover:bg-yellow-600 text-black transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Compressed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
