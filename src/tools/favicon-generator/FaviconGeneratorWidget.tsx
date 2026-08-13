"use client";

import React, { useState, useRef } from 'react';

export default function FaviconGeneratorWidget({ locale }: { locale: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [favicons, setFavicons] = useState<{ size: number; dataUrl: string }[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        generateFavicons(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateFavicons = (src: string) => {
    const sizes = [16, 32, 192, 512];
    const generated: { size: number; dataUrl: string }[] = [];
    const img = new Image();
    img.onload = () => {
      sizes.forEach((size) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, size, size);
          generated.push({ size, dataUrl: canvas.toDataURL('image/png') });
        }
      });
      setFavicons(generated);
    };
    img.src = src;
  };

  const downloadFavicon = (dataUrl: string, size: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `favicon-${size}x${size}.png`;
    link.click();
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl max-w-4xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">
        Favicon Generator
      </h2>
      <p className="text-gray-300 mb-6">Upload an image to generate standard favicon sizes for your website.</p>
      
      <div className="mb-8">
        <label className="block w-full cursor-pointer bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 rounded-xl p-8 text-center transition-colors">
          <span className="text-emerald-300 font-medium">Upload Image (Square recommended)</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      {favicons.length > 0 && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-emerald-300">Generated Sizes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {favicons.map((fav) => (
                <div key={fav.size} className="bg-white/5 p-4 rounded-xl flex flex-col items-center justify-center border border-white/5">
                  <div className="w-16 h-16 flex items-center justify-center mb-3">
                    <img src={fav.dataUrl} alt={`Favicon ${fav.size}`} width={fav.size} height={fav.size} className="max-w-full max-h-full" />
                  </div>
                  <span className="text-xs text-gray-400 mb-2">{fav.size} x {fav.size}</span>
                  <button
                    onClick={() => downloadFavicon(fav.dataUrl, fav.size)}
                    className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/40 transition-colors"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/10">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">HTML Code</h3>
            <pre className="text-xs text-emerald-200 overflow-x-auto p-2 bg-black/50 rounded-lg">
              {`<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png">`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
