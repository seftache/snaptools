"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Download, Wand2, Eraser, Brush, RotateCcw, 
  Sparkles, Sliders, Image as ImageIcon, Check, ArrowRight, RefreshCw, Cpu 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { removeBackgroundWithAI } from '@/lib/removeBackgroundAI';

export default function RemoveBgWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiProgressText, setAiProgressText] = useState('');
  const [aiPercent, setAiPercent] = useState(0);
  const [brushMode, setBrushMode] = useState<'erase' | 'restore'>('erase');
  const [brushSize, setBrushSize] = useState(30);
  const [bgColor, setBgColor] = useState<string>('transparent');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const originalImageDataRef = useRef<ImageData | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const rawUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      originalImageRef.current = img;
      setImageSrc(rawUrl);
    };
    img.src = rawUrl;

    // Trigger AI Cutout
    runAICutout(file);
  };

  const runAICutout = async (fileOrBlob: File | Blob | string) => {
    setLoading(true);
    setAiProgressText(isFr ? 'Détourage IA en cours...' : 'AI background removal in progress...');
    setAiPercent(10);

    try {
      const transparentUrl = await removeBackgroundWithAI(fileOrBlob, (text, pct) => {
        setAiProgressText(text);
        setAiPercent(pct);
      });

      const cutImg = new Image();
      cutImg.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const maxWidth = 900;
        let width = cutImg.width;
        let height = cutImg.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(cutImg, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        setHistory([imgData]);
        setLoading(false);
      };
      cutImg.src = transparentUrl;
    } catch (err) {
      console.warn('AI cutout fallback:', err);
      setLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    applyBrush(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    applyBrush(e);
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          setHistory((prev) => [...prev.slice(-10), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
        }
      }
    }
  };

  const applyBrush = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = currentData.data;

    const startX = Math.max(0, Math.floor(x - radius));
    const startY = Math.max(0, Math.floor(y - radius));
    const endX = Math.min(canvas.width, Math.floor(x + radius));
    const endY = Math.min(canvas.height, Math.floor(y + radius));

    for (let py = startY; py < endY; py++) {
      for (let px = startX; px < endX; px++) {
        const dx = px - x;
        const dy = py - y;
        if (dx * dx + dy * dy <= radius * radius) {
          const idx = (py * canvas.width + px) * 4;
          if (brushMode === 'erase') {
            data[idx + 3] = 0; // Make transparent
          }
        }
      }
    }

    ctx.putImageData(currentData, 0, 0);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop();
    const previous = newHistory[newHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setHistory(newHistory);
  };

  const resetAll = () => {
    if (originalImageRef.current) {
      runAICutout(originalImageRef.current.src);
    }
  };

  const downloadImage = (format: 'png' | 'jpg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    if (bgColor !== 'transparent') {
      expCtx.fillStyle = bgColor;
      expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }

    expCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `snaptools-remove-bg.${format}`;
    link.href = exportCanvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
    link.click();
  };

  // Transfer transparent image to Passport Photo Maker
  const sendToPassportPhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    try {
      sessionStorage.setItem('snaptools_passport_photo', dataUrl);
    } catch {}

    router.push(`/${locale}/tools/passport-photo`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400">
          <Wand2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {isFr ? 'Supprimer l\'Arrière-Plan par Intelligence Artificielle' : 'AI Background Remover'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {isFr ? 'Détourage haute précision par IA • 100% Gratuit sans clé API • Export PNG transparent ou Fond blanc' : 'High precision AI cutout • 100% Free no API key • Transparent PNG or White background'}
          </p>
        </div>
      </div>

      {!imageSrc ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-subtle)] hover:border-pink-500/50 rounded-2xl p-14 text-center cursor-pointer transition-all bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)] group">
          <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-pink-400" />
          </div>
          <span className="text-base font-semibold text-[var(--text-primary)] mb-1">
            {isFr ? 'Cliquez ou glissez une photo ici' : 'Click or drop a photo here'}
          </span>
          <span className="text-xs text-pink-300 font-medium flex items-center gap-1 mt-1">
            <Sparkles className="w-3.5 h-3.5" />
            {isFr ? 'L\'IA isole automatiquement le portrait sans abîmer les traits du visage' : 'AI automatically isolates subject without degrading face features'}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      ) : (
        <div className="space-y-6">
          {/* AI Progress Bar */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gradient-to-r from-pink-600/20 via-rose-600/20 to-purple-600/20 border border-pink-500/30 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-pink-300 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-pink-400 animate-pulse" />
                  {aiProgressText || (isFr ? 'Détourage IA en cours...' : 'AI segmentation in progress...')}
                </span>
                <span className="font-mono text-pink-400 font-bold">{aiPercent}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${aiPercent}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* Action Bar & Background Options */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-300">{isFr ? 'Pinceau gomme :' : 'Eraser brush:'}</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-24 accent-pink-500"
                />
                <span className="text-gray-400 font-mono">{brushSize}px</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-300">{isFr ? 'Arrière-plan :' : 'Background:'}</span>
              <div className="flex gap-1.5 items-center">
                <button
                  type="button"
                  onClick={() => setBgColor('transparent')}
                  title={isFr ? 'Transparent' : 'Transparent'}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    bgColor === 'transparent' ? 'border-pink-500 ring-2 ring-pink-500/50' : 'border-white/20'
                  }`}
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setBgColor('#ffffff')}
                  title={isFr ? 'Blanc officiel' : 'White'}
                  className={`w-7 h-7 rounded-lg bg-white border transition-all ${
                    bgColor === '#ffffff' ? 'border-pink-500 ring-2 ring-pink-500/50' : 'border-white/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setBgColor('#f1f5f9')}
                  title={isFr ? 'Gris clair' : 'Light Grey'}
                  className={`w-7 h-7 rounded-lg bg-slate-100 border transition-all ${
                    bgColor === '#f1f5f9' ? 'border-pink-500 ring-2 ring-pink-500/50' : 'border-white/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setBgColor('#3b82f6')}
                  title={isFr ? 'Bleu identité' : 'Passport Blue'}
                  className={`w-7 h-7 rounded-lg bg-blue-500 border transition-all ${
                    bgColor === '#3b82f6' ? 'border-pink-500 ring-2 ring-pink-500/50' : 'border-white/20'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={undo}
                disabled={history.length <= 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 disabled:opacity-30 transition-all text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isFr ? 'Annuler' : 'Undo'}
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-pink-500/20 text-gray-300 hover:text-pink-400 border border-white/10 transition-all text-xs font-medium"
              >
                {isFr ? 'Relancer IA' : 'Re-run AI'}
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl"
            style={{
              backgroundColor: bgColor === 'transparent' ? '#18181b' : bgColor,
              backgroundImage:
                bgColor === 'transparent'
                  ? 'linear-gradient(45deg, #27272a 25%, transparent 25%), linear-gradient(-45deg, #27272a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #27272a 75%), linear-gradient(-45deg, transparent 75%, #27272a 75%)'
                  : 'none',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="rounded-xl cursor-crosshair max-w-full shadow-lg"
            />
          </div>

          {/* Download and Next Step Flow */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="text-xs text-gray-400 hover:text-white cursor-pointer underline flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              {isFr ? 'Changer d\'image' : 'Upload another photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>

            <div className="flex flex-wrap items-center gap-3 ml-auto">
              <button
                onClick={() => downloadImage('png')}
                className="flex items-center gap-2 py-3 px-5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-pink-500/25"
              >
                <Download className="w-4 h-4" />
                {isFr ? 'Télécharger PNG Transparent' : 'Download Transparent PNG'}
              </button>

              <button
                onClick={() => downloadImage('jpg')}
                className="flex items-center gap-2 py-3 px-5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all border border-white/10"
              >
                <Download className="w-4 h-4" />
                {isFr ? 'Télécharger JPEG Fond Blanc' : 'Download White BG JPEG'}
              </button>

              <button
                type="button"
                onClick={sendToPassportPhoto}
                className="flex items-center gap-2 py-3 px-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25"
              >
                {isFr ? 'Créer planche 4x / 8x photos' : 'Create 4x / 8x ID sheet'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
