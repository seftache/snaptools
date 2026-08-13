"use client";

import React, { useState, useRef } from 'react';
import { Upload, Download, Layers } from 'lucide-react';

export default function IcoConverterWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [size, setSize] = useState<256 | 128 | 64 | 32 | 16>(256);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const convertToIco = () => {
    if (!previewUrl) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw and scale the image to fit the square icon
      const minDim = Math.min(img.width, img.height);
      const startX = (img.width - minDim) / 2;
      const startY = (img.height - minDim) / 2;
      
      ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

      // Convert to PNG blob first (ICO can just be a PNG for modern usage)
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${file?.name.split('.')[0] || 'icon'}.ico`;
        a.click();
      }, 'image/png');
    };
    img.src = previewUrl;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg backdrop-blur-md">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
        <Layers className="w-6 h-6 text-purple-400" />
        ICO Converter
      </h2>

      {!previewUrl ? (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f?.type.startsWith('image/')) handleFileChange(f);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-500/5 transition-all group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="bg-purple-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-lg font-medium text-[var(--text-primary)]">Click or drag an image here</p>
          <p className="text-sm text-gray-400 mt-2">Will be cropped to a square and converted to .ico</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-6">
            <div className="w-48 h-48 rounded-xl overflow-hidden bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-gray-800/30 border border-[var(--border-subtle)] flex items-center justify-center p-4">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-w-full max-h-full object-cover aspect-square rounded-lg shadow-lg" 
              />
            </div>

            <div className="w-full max-w-sm space-y-4">
              <label className="block text-sm font-medium text-gray-300">Icon Size</label>
              <div className="grid grid-cols-5 gap-2">
                {[256, 128, 64, 32, 16].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s as any)}
                    className={`py-2 rounded-lg text-xs font-mono transition-colors ${
                      size === s 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-black/30 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {s}px
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 w-full max-w-sm pt-4 border-t border-[var(--border-subtle)]">
              <button 
                onClick={() => setPreviewUrl(null)}
                className="flex-1 py-2 rounded-lg font-medium text-sm border border-[var(--border-subtle)] hover:bg-white/5 transition-colors"
              >
                Change Image
              </button>
              <button 
                onClick={convertToIco}
                className="flex-1 py-2 rounded-lg font-medium text-sm bg-purple-500 hover:bg-purple-600 text-white transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download .ico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
