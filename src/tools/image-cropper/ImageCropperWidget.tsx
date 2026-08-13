"use client";

import React, { useState, useRef, useEffect } from 'react';

export default function ImageCropperWidget({ locale }: { locale: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [cropX, setCropX] = useState<number>(0);
  const [cropY, setCropY] = useState<number>(0);
  const [cropW, setCropW] = useState<number>(100);
  const [cropH, setCropH] = useState<number>(100);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
        setCropW(Math.min(img.width, 300));
        setCropH(Math.min(img.height, 300));
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  useEffect(() => {
    if (imageObj && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Scale down for preview
      const maxDisplayWidth = 600;
      let displayW = imageObj.width;
      let displayH = imageObj.height;
      if (displayW > maxDisplayWidth) {
        displayH = (maxDisplayWidth / displayW) * displayH;
        displayW = maxDisplayWidth;
      }

      canvas.width = displayW;
      canvas.height = displayH;
      ctx.drawImage(imageObj, 0, 0, displayW, displayH);

      // Draw crop box
      const scaleX = displayW / imageObj.width;
      const scaleY = displayH / imageObj.height;

      ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(cropX * scaleX, cropY * scaleY, cropW * scaleX, cropH * scaleY);
      
      ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
      ctx.fillRect(cropX * scaleX, cropY * scaleY, cropW * scaleX, cropH * scaleY);
    }
  }, [imageObj, cropX, cropY, cropW, cropH]);

  const downloadCrop = () => {
    if (!imageObj || cropW <= 0 || cropH <= 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        imageObj,
        cropX, cropY, cropW, cropH,
        0, 0, cropW, cropH
      );
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `cropped.png`;
      link.click();
    }
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl max-w-4xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-yellow-500">
        Image Cropper
      </h2>
      
      {!imageSrc ? (
        <label className="block w-full cursor-pointer bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 rounded-xl p-12 text-center transition-colors">
          <span className="text-red-300 font-medium">Upload Image to Crop</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 mt-6">
          <div className="flex-1 bg-black/40 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-4">
            <canvas ref={canvasRef} className="max-w-full max-h-[500px]" />
          </div>

          <div className="w-full md:w-64 space-y-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
              <h3 className="font-semibold text-red-300 border-b border-white/10 pb-2">Crop Settings</h3>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">X Position</label>
                <input type="number" value={cropX} onChange={e => setCropX(Number(e.target.value))} className="w-full bg-black/40 rounded px-2 py-1 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Y Position</label>
                <input type="number" value={cropY} onChange={e => setCropY(Number(e.target.value))} className="w-full bg-black/40 rounded px-2 py-1 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Width</label>
                <input type="number" value={cropW} onChange={e => setCropW(Number(e.target.value))} className="w-full bg-black/40 rounded px-2 py-1 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Height</label>
                <input type="number" value={cropH} onChange={e => setCropH(Number(e.target.value))} className="w-full bg-black/40 rounded px-2 py-1 text-sm text-white" />
              </div>
            </div>

            <button
              onClick={downloadCrop}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-yellow-600 rounded-lg font-bold hover:from-red-600 hover:to-yellow-700 transition-all shadow-lg shadow-red-500/20"
            >
              Download Crop
            </button>
            <button
              onClick={() => { setImageSrc(null); setImageObj(null); }}
              className="w-full py-2 bg-white/5 text-gray-400 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              Choose New Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
