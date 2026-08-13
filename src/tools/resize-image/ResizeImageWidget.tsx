"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Maximize, X } from 'lucide-react';

export default function ResizeImageWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [ratio, setRatio] = useState(1);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (file: File) => {
    setFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setRatio(img.width / img.height);
      imgRef.current = img;
      generateResizedImage(img.width, img.height, img);
    };
    img.src = url;
  };

  const handleWidthChange = (w: string) => {
    const newWidth = parseInt(w) || 0;
    let newHeight = dimensions.height;
    if (maintainRatio && newWidth > 0) {
      newHeight = Math.round(newWidth / ratio);
    }
    setDimensions({ width: newWidth, height: newHeight });
  };

  const handleHeightChange = (h: string) => {
    const newHeight = parseInt(h) || 0;
    let newWidth = dimensions.width;
    if (maintainRatio && newHeight > 0) {
      newWidth = Math.round(newHeight * ratio);
    }
    setDimensions({ width: newWidth, height: newHeight });
  };

  useEffect(() => {
    if (imgRef.current && dimensions.width > 0 && dimensions.height > 0) {
      const timer = setTimeout(() => {
        generateResizedImage(dimensions.width, dimensions.height, imgRef.current!);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [dimensions, maintainRatio]);

  const generateResizedImage = (w: number, h: number, img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(img, 0, 0, w, h);
    setResultUrl(canvas.toDataURL(file?.type || 'image/png'));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg backdrop-blur-md">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
        <Maximize className="w-6 h-6 text-blue-400" />
        Resize Image
      </h2>

      {!originalUrl ? (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f?.type.startsWith('image/')) handleFileChange(f);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-lg font-medium text-[var(--text-primary)]">Click or drag an image here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6 bg-black/10 p-4 rounded-xl border border-[var(--border-subtle)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-[var(--text-primary)]">Dimensions</h3>
              <button onClick={() => setOriginalUrl(null)} className="p-1 hover:bg-white/10 rounded-md">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Width (px)</label>
                <input 
                  type="number" 
                  value={dimensions.width || ''}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full bg-black/30 border border-[var(--border-subtle)] rounded-lg p-2 text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Height (px)</label>
                <input 
                  type="number" 
                  value={dimensions.height || ''}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full bg-black/30 border border-[var(--border-subtle)] rounded-lg p-2 text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input 
                  type="checkbox" 
                  checked={maintainRatio}
                  onChange={(e) => setMaintainRatio(e.target.checked)}
                  className="rounded bg-black/30 border-[var(--border-subtle)] text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <span className="text-sm text-gray-300">Maintain aspect ratio</span>
              </label>
            </div>

            <button 
              onClick={() => {
                if (resultUrl) {
                  const a = document.createElement('a');
                  a.href = resultUrl;
                  a.download = `resized-${file?.name || 'image.png'}`;
                  a.click();
                }
              }}
              className="w-full py-2 rounded-lg font-medium text-sm bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center gap-2 mt-6"
            >
              <Download className="w-4 h-4" /> Download Resized
            </button>
          </div>

          <div className="md:col-span-2 aspect-square md:aspect-auto rounded-xl overflow-hidden bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-gray-800/30 border border-[var(--border-subtle)] flex items-center justify-center relative p-4 min-h-[400px]">
             {resultUrl ? (
               <img src={resultUrl} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl" />
             ) : (
               <div className="animate-pulse w-full h-full bg-black/20 rounded-lg"></div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
