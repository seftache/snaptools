"use client";

import React, { useState, useRef, useEffect } from 'react';

export default function ImageResizerWidget({ locale }: { locale: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [keepAspect, setKeepAspect] = useState(true);
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
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (keepAspect && imageObj) {
      const ratio = imageObj.height / imageObj.width;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (keepAspect && imageObj) {
      const ratio = imageObj.width / imageObj.height;
      setWidth(Math.round(val * ratio));
    }
  };

  const downloadImage = () => {
    if (!imageObj || !width || !height) return;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imageObj, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `resized-${width}x${height}.png`;
      link.click();
    }
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl max-w-4xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500">
        Image Resizer
      </h2>
      
      {!imageSrc ? (
        <label className="block w-full cursor-pointer bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 rounded-xl p-12 text-center transition-colors">
          <span className="text-violet-300 font-medium">Upload Image</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div className="flex flex-col space-y-6 bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="font-semibold text-lg text-violet-300">Dimensions</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Width (px)</label>
                <input 
                  type="number" 
                  value={width} 
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Height (px)</label>
                <input 
                  type="number" 
                  value={height} 
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input 
                  type="checkbox" 
                  id="keepAspect" 
                  checked={keepAspect} 
                  onChange={(e) => setKeepAspect(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-500 bg-black/40 border-white/20 focus:ring-violet-500"
                />
                <label htmlFor="keepAspect" className="text-sm text-gray-300">Keep Aspect Ratio</label>
              </div>
            </div>

            <button
              onClick={downloadImage}
              className="mt-4 w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-lg font-semibold hover:from-violet-600 hover:to-fuchsia-700 transition-all shadow-lg"
            >
              Download Resized Image
            </button>
            <button
              onClick={() => { setImageSrc(null); setImageObj(null); }}
              className="mt-2 w-full py-2 bg-white/5 text-gray-400 rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              Start Over
            </button>
          </div>

          <div className="flex items-center justify-center bg-black/30 rounded-xl border border-white/5 overflow-hidden p-4">
            {imageObj && (
              <img 
                src={imageSrc} 
                alt="Preview" 
                className="max-w-full max-h-[400px] object-contain opacity-75"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
