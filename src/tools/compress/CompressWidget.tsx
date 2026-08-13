"use client";
import React, { useState, useRef } from 'react';

export default function CompressWidget({ locale }: { locale: string }) {
  const [quality, setQuality] = useState(0.8);
  const [origImage, setOrigImage] = useState<{ src: string; size: number; name: string } | null>(null);
  const [compImage, setCompImage] = useState<{ src: string; size: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setOrigImage({ src, size: file.size, name: file.name });
      compressImage(src, quality);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (src: string, q: number) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const compressedData = canvas.toDataURL('image/jpeg', q);
      const base64str = compressedData.split(',')[1];
      const sizeInBytes = Math.ceil(base64str.length * 0.75);
      
      setCompImage({ src: compressedData, size: sizeInBytes });
    };
    img.src = src;
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = parseFloat(e.target.value);
    setQuality(q);
    if (origImage) {
      compressImage(origImage.src, q);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg flex flex-col gap-6 max-w-2xl mx-auto border border-[var(--border-subtle)] shadow-sm">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-muted)]">{locale === 'fr' ? 'Choisir une image' : 'Choose Image'}</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFile}
          className="w-full text-sm text-[var(--text-primary)] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--accent-media)] file:text-white hover:file:opacity-90 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-muted)] flex justify-between">
          <span>{locale === 'fr' ? 'Qualité' : 'Quality'}</span>
          <span>{Math.round(quality * 100)}%</span>
        </label>
        <input 
          type="range" 
          min="0.1" 
          max="1" 
          step="0.05" 
          value={quality} 
          onChange={handleQualityChange}
          className="w-full accent-[var(--accent-media)] h-2 bg-[var(--bg-base)] rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {origImage && compImage && (
        <div className="mt-2 flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center bg-[var(--bg-base)] p-4 rounded-lg border border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-muted)] uppercase mb-1">Original</span>
              <span className="font-mono font-bold text-xl">{formatSize(origImage.size)}</span>
            </div>
            <div className="flex flex-col items-center bg-[var(--bg-base)] p-4 rounded-lg border border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-muted)] uppercase mb-1">Compressed</span>
              <span className="font-mono font-bold text-xl text-[var(--accent-media)]">{formatSize(compImage.size)}</span>
            </div>
          </div>
          
          <div className="flex justify-center my-4 bg-[var(--bg-base)] p-4 rounded-xl border border-dashed border-[var(--border-subtle)]">
            <img src={compImage.src} alt="Compressed preview" className="max-h-64 rounded-lg drop-shadow-md" />
          </div>

          <a 
            href={compImage.src} 
            download={`compressed-${origImage.name.replace(/\.[^/.]+$/, "")}.jpg`}
            className="w-full text-center px-5 py-3 rounded-lg font-bold text-sm bg-[var(--accent-media)] text-white hover:opacity-90 transition-all block"
          >
            {locale === 'fr' ? 'Télécharger l\'Image' : 'Download Image'}
          </a>
        </div>
      )}
    </div>
  );
}
