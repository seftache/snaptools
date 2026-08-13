"use client";

import React, { useState, useRef } from 'react';
import { Upload, Download, RefreshCw, FileImage, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeicToJpgWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processHeic = async (heicFile: File) => {
    setFile(heicFile);
    setIsProcessing(true);
    setError(null);
    setResultUrl(null);

    try {
      // Dynamic import to avoid SSR issues
      const heic2any = (await import('heic2any')).default;
      
      const resultBlob = await heic2any({
        blob: heicFile,
        toType: "image/jpeg",
        quality: 0.9
      });
      
      const blob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error(err);
      setError("Failed to convert HEIC. Make sure it's a valid HEIC file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.name.toLowerCase().endsWith('.heic') || droppedFile.name.toLowerCase().endsWith('.heif'))) {
      processHeic(droppedFile);
    } else {
      setError("Please drop a valid .heic or .heif file");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg backdrop-blur-md">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
        <FileImage className="w-6 h-6 text-green-400" />
        HEIC to JPG Converter
      </h2>

      {!file ? (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-12 text-center cursor-pointer hover:border-green-500 hover:bg-green-500/5 transition-all group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => {
              if (e.target.files?.[0]) processHeic(e.target.files[0]);
            }} 
            accept=".heic,.heif" 
            className="hidden" 
          />
          <div className="bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-lg font-medium text-[var(--text-primary)] mb-2">
            Click or drag a HEIC file here
          </p>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FileImage className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">{file.name}</p>
                <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!isProcessing && (
              <button 
                onClick={() => setFile(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          <div className="aspect-video rounded-xl overflow-hidden bg-black/20 border border-[var(--border-subtle)] flex items-center justify-center p-2 relative">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="w-8 h-8 text-green-400 animate-spin" />
                <span className="text-sm text-gray-400">Converting to JPG...</span>
              </div>
            ) : resultUrl ? (
              <img src={resultUrl} alt="Converted" className="max-w-full max-h-full object-contain rounded-lg" />
            ) : (
              error && <p className="text-red-400">{error}</p>
            )}
          </div>

          {resultUrl && (
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = resultUrl;
                  a.download = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
                  a.click();
                }}
                className="px-6 py-2 rounded-lg font-medium text-sm bg-green-500 hover:bg-green-600 text-black transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download JPG
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
