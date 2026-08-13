"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Download, Loader2, X, RefreshCw } from 'lucide-react';
import { removeBackgroundWithAI } from '@/lib/removeBackgroundAI';

export default function RemoveBackgroundWidget({ locale }: { locale: string }) {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      setSourceImage(url);
      setResultImage(null);
      setError(null);
      setIsProcessing(true);
      setProgress(10);

      const resultUrl = await removeBackgroundWithAI(file, (text, pct) => {
        setProgress(pct);
      });
      
      setResultImage(resultUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to remove background');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (resultImage) {
      const a = document.createElement('a');
      a.href = resultImage;
      a.download = 'removed-background.png';
      a.click();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg backdrop-blur-md">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
        <ImageIcon className="w-6 h-6 text-indigo-400" />
        Background Remover
      </h2>

      {!sourceImage ? (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-12 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="bg-indigo-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-lg font-medium text-[var(--text-primary)] mb-2">
            Click or drag an image here
          </p>
          <p className="text-sm text-gray-400">
            Supports PNG, JPG, WEBP
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-400">Original</span>
                <button 
                  onClick={() => { setSourceImage(null); setResultImage(null); }}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="aspect-square rounded-xl overflow-hidden bg-black/20 border border-[var(--border-subtle)] relative flex items-center justify-center">
                <img src={sourceImage} alt="Original" className="max-w-full max-h-full object-contain" />
              </div>
            </div>

            {/* Result */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-400">Result</span>
                {resultImage && (
                  <button 
                    onClick={downloadResult}
                    className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                )}
              </div>
              <div className="aspect-square rounded-xl overflow-hidden bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-gray-800/30 border border-[var(--border-subtle)] relative flex items-center justify-center">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                    <div className="text-sm text-gray-400">Processing... {progress}%</div>
                  </div>
                ) : resultImage ? (
                  <img src={resultImage} alt="Result" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                ) : error ? (
                  <div className="text-red-400 text-sm text-center p-4">{error}</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
