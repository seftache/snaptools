"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, RotateCcw, EyeOff, Sliders, Sparkles, Image as ImageIcon, ShieldCheck } from 'lucide-react';

export default function BlurFaceWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(45);
  const [blurMode, setBlurMode] = useState<'pixelate' | 'blur'>('pixelate');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          setImageSrc(event.target?.result as string);
          setHistory([]);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (originalImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const maxWidth = 800;
      let width = originalImage.width;
      let height = originalImage.height;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(originalImage, 0, 0, width, height);

      // Save initial state
      setHistory([ctx.getImageData(0, 0, width, height)]);
    }
  }, [originalImage]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setHistory((prev) => [...prev.slice(-10), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    applyEffect(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    applyEffect(e);
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const applyEffect = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const radius = brushSize;
    const startX = Math.max(0, Math.floor(x - radius));
    const startY = Math.max(0, Math.floor(y - radius));
    const w = Math.min(canvas.width - startX, Math.floor(radius * 2));
    const h = Math.min(canvas.height - startY, Math.floor(radius * 2));

    if (w <= 0 || h <= 0) return;

    if (blurMode === 'pixelate') {
      const pixelSize = 10;
      const imgData = ctx.getImageData(startX, startY, w, h);
      const data = imgData.data;

      for (let py = 0; py < h; py += pixelSize) {
        for (let px = 0; px < w; px += pixelSize) {
          const dx = px + startX - x;
          const dy = py + startY - y;
          if (dx * dx + dy * dy <= radius * radius) {
            const index = (py * w + px) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            for (let npy = 0; npy < pixelSize && py + npy < h; npy++) {
              for (let npx = 0; npx < pixelSize && px + npx < w; npx++) {
                const subIndex = ((py + npy) * w + (px + npx)) * 4;
                data[subIndex] = r;
                data[subIndex + 1] = g;
                data[subIndex + 2] = b;
              }
            }
          }
        }
      }
      ctx.putImageData(imgData, startX, startY);
    } else {
      // Gaussian / Canvas Blur
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.filter = 'blur(12px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
    }
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
  };

  const resetCanvas = () => {
    if (!originalImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'snaptools-blurred-face.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
          <EyeOff className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {isFr ? 'Flouter un Visage ou Élément' : 'Blur Face or Object'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {isFr ? '100% Privé • Traitement direct dans votre navigateur sans envoi sur serveur' : '100% Private • Direct client-side processing'}
          </p>
        </div>
      </div>

      {!imageSrc ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-subtle)] hover:border-purple-500/50 rounded-2xl p-12 text-center cursor-pointer transition-all bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)] group">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-purple-400" />
          </div>
          <span className="text-base font-medium text-[var(--text-primary)] mb-1">
            {isFr ? 'Cliquez ou glissez une photo ici' : 'Click or drop an image here'}
          </span>
          <span className="text-xs text-[var(--text-muted)]">PNG, JPG, WEBP, HEIC</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-300">
                {isFr ? 'Style :' : 'Style:'}
              </span>
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setBlurMode('pixelate')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                    blurMode === 'pixelate' ? 'bg-purple-500 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isFr ? 'Mosaïque / Pixels' : 'Pixelate'}
                </button>
                <button
                  type="button"
                  onClick={() => setBlurMode('blur')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                    blurMode === 'blur' ? 'bg-purple-500 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isFr ? 'Flou Artistique' : 'Smooth Blur'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <span className="text-xs font-semibold text-gray-300 whitespace-nowrap">
                {isFr ? 'Taille du pinceau :' : 'Brush Size:'}
              </span>
              <input
                type="range"
                min="15"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-xs text-purple-400 font-mono w-8">{brushSize}px</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={undo}
                disabled={history.length <= 1}
                title={isFr ? 'Annuler la dernière action' : 'Undo'}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isFr ? 'Annuler' : 'Undo'}
              </button>
              <button
                type="button"
                onClick={resetCanvas}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/10 transition-all text-xs font-medium"
              >
                {isFr ? 'Réinitialiser' : 'Reset'}
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/60 border border-white/10 overflow-hidden relative">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              {isFr ? 'Cliquez et glissez sur les visages à masquer' : 'Click and drag over faces to conceal'}
            </p>
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="rounded-lg cursor-crosshair max-w-full shadow-2xl border border-white/5"
            />
          </div>

          {/* Download & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="text-xs text-gray-400 hover:text-white cursor-pointer underline flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              {isFr ? 'Changer de photo' : 'Choose another image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>

            <button
              onClick={downloadImage}
              className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/25 ml-auto"
            >
              <Download className="w-4 h-4" />
              {isFr ? 'Télécharger la Photo Protégée' : 'Download Protected Image'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

