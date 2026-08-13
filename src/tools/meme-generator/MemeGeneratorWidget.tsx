"use client";

import React, { useState, useRef, useEffect } from 'react';

export default function MemeGeneratorWidget({ locale }: { locale: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

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
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  useEffect(() => {
    if (imageObj && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const maxWidth = 800;
      let width = imageObj.width;
      let height = imageObj.height;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw Image
      ctx.drawImage(imageObj, 0, 0, width, height);

      // Setup Text
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = Math.floor(width / 150);
      ctx.textAlign = "center";
      
      const fontSize = Math.floor(width / 10);
      ctx.font = `${fontSize}px Impact, sans-serif`;

      // Draw Top Text
      if (topText) {
        ctx.textBaseline = "top";
        const text = topText.toUpperCase();
        ctx.fillText(text, width / 2, 10);
        ctx.strokeText(text, width / 2, 10);
      }

      // Draw Bottom Text
      if (bottomText) {
        ctx.textBaseline = "bottom";
        const text = bottomText.toUpperCase();
        ctx.fillText(text, width / 2, height - 10);
        ctx.strokeText(text, width / 2, height - 10);
      }
    }
  }, [imageObj, topText, bottomText]);

  const downloadImage = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'meme.png';
    link.click();
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl max-w-4xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
        Meme Generator
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Upload Base Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-300 hover:file:bg-orange-500/30 transition-colors"
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Top Text</label>
            <input
              type="text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              placeholder="ENTER TOP TEXT"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bottom Text</label>
            <input
              type="text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              placeholder="ENTER BOTTOM TEXT"
            />
          </div>
        </div>
      </div>

      {imageSrc && (
        <div className="flex flex-col items-center space-y-6 mt-8">
          <div className="border-4 border-white/10 rounded-lg overflow-hidden bg-black/50">
            <canvas ref={canvasRef} className="max-w-full h-auto" />
          </div>
          <button
            onClick={downloadImage}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl font-bold hover:from-orange-600 hover:to-pink-700 transition-all shadow-lg shadow-orange-500/25 transform hover:scale-105 active:scale-95"
          >
            Download Meme
          </button>
        </div>
      )}
    </div>
  );
}
