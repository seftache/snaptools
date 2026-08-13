"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Crop as CropIcon, X } from 'lucide-react';

export default function CropImageWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 }); // Percentages
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (f: File) => {
    setFile(f);
    setImgUrl(URL.createObjectURL(f));
    setCrop({ x: 10, y: 10, width: 80, height: 80 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      cropX: crop.x,
      cropY: crop.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.y) / rect.height) * 100;
    
    let newX = dragStart.cropX + dx;
    let newY = dragStart.cropY + dy;
    
    // Bounds check
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX + crop.width > 100) newX = 100 - crop.width;
    if (newY + crop.height > 100) newY = 100 - crop.height;
    
    setCrop(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const downloadCropped = () => {
    if (!imgRef.current) return;
    
    const img = imgRef.current;
    // Calculate actual pixels
    const actualX = (crop.x / 100) * img.naturalWidth;
    const actualY = (crop.y / 100) * img.naturalHeight;
    const actualWidth = (crop.width / 100) * img.naturalWidth;
    const actualHeight = (crop.height / 100) * img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = actualWidth;
    canvas.height = actualHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      img, 
      actualX, actualY, actualWidth, actualHeight,
      0, 0, actualWidth, actualHeight
    );

    const dataUrl = canvas.toDataURL(file?.type || 'image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `cropped-${file?.name || 'image.png'}`;
    a.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg backdrop-blur-md">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
        <CropIcon className="w-6 h-6 text-pink-400" />
        Crop Image
      </h2>

      {!imgUrl ? (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f?.type.startsWith('image/')) handleFileChange(f);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-12 text-center cursor-pointer hover:border-pink-500 hover:bg-pink-500/5 transition-all group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="bg-pink-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-lg font-medium text-[var(--text-primary)]">Click or drag an image here</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">Drag the highlighted area to crop</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setImgUrl(null)}
                className="px-4 py-2 rounded-lg text-sm border border-[var(--border-subtle)] hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button 
                onClick={downloadCropped}
                className="px-6 py-2 rounded-lg font-medium text-sm bg-pink-500 hover:bg-pink-600 text-white transition-colors flex items-center gap-2"
              >
                <CropIcon className="w-4 h-4" /> Apply & Download
              </button>
            </div>
          </div>

          <div 
            className="relative w-full max-h-[60vh] bg-black/20 rounded-xl overflow-hidden flex items-center justify-center select-none"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <div className="relative inline-block max-w-full max-h-full" ref={containerRef}>
              <img 
                ref={imgRef}
                src={imgUrl} 
                alt="To crop" 
                className="block max-w-full max-h-[60vh] pointer-events-none" 
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
              
              {/* Crop Box */}
              <div 
                className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move touch-none"
                style={{
                  top: `${crop.y}%`,
                  left: `${crop.x}%`,
                  width: `${crop.width}%`,
                  height: `${crop.height}%`,
                  clipPath: 'inset(0 0 0 0)' // Fix for the shadow mask trick
                }}
                onMouseDown={handleMouseDown}
              >
                <img 
                  src={imgUrl} 
                  alt="Crop preview" 
                  className="absolute max-w-none pointer-events-none"
                  style={{
                    width: `${100 / (crop.width / 100)}%`,
                    height: `${100 / (crop.height / 100)}%`,
                    top: `-${(crop.y / crop.height) * 100}%`,
                    left: `-${(crop.x / crop.width) * 100}%`
                  }}
                />
                <div className="absolute inset-0 border border-white/30 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  {Array.from({length: 9}).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-white/30"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 items-center justify-center">
            <span className="text-sm text-gray-400">Box Size:</span>
            <input 
              type="range" 
              min="10" max="100" 
              value={crop.width}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setCrop(prev => ({
                  ...prev,
                  width: val,
                  height: val,
                  x: Math.min(prev.x, 100 - val),
                  y: Math.min(prev.y, 100 - val)
                }));
              }}
              className="w-48 accent-pink-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
