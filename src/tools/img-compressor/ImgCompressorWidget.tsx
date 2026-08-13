"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Shrink, Upload, Download, CheckCircle2 } from 'lucide-react';

export default function ImgCompressorWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(60);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setCompressedBlob(null);
      setError(null);
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  const compressImage = () => {
    if (!file || !canvasRef.current) return;
    setIsCompressing(true);
    setCompressedBlob(null);
    setError(null);

    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Canvas not supported');
        setIsCompressing(false);
        return;
      }
      
      // White background for transparent images
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCompressedBlob(blob);
          } else {
            setError('Compression failed');
          }
          setIsCompressing(false);
        },
        'image/jpeg',
        quality / 100
      );
      
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      setError('Failed to load image');
      setIsCompressing(false);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const downloadCompressed = () => {
    if (!compressedBlob) return;
    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed_${Date.now()}.jpg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '2rem',
          backdropFilter: 'blur(12px)'
        }}
      >
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shrink color="#10b981" /> Image Compressor
        </h2>
        
        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
          Reduce image file size instantly without leaving your browser.
        </p>

        {!file ? (
          <label 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem',
              border: '2px dashed var(--border-subtle)',
              borderRadius: '12px',
              background: 'var(--bg-surface)',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              transition: 'background 0.2s'
            }}
          >
            <Upload size={48} color="#aaa" style={{ marginBottom: '1rem' }} />
            <span style={{ color: 'white', fontWeight: 500 }}>Select Image</span>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>
        ) : (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ color: 'white' }}>{file.name}</span>
              <button 
                onClick={() => { setFile(null); setCompressedBlob(null); }}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              >
                Change
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                Compression Level (Quality: {quality}%)
              </label>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={quality} 
                onChange={(e) => {
                  setQuality(Number(e.target.value));
                  setCompressedBlob(null);
                }}
                style={{ width: '100%' }}
              />
            </div>

            {compressedBlob ? (
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '0.5rem', fontWeight: 500 }}>
                  <CheckCircle2 size={20} /> Compression Complete!
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '0.9rem' }}>
                  <span>Original: {formatSize(file.size)}</span>
                  <span>New: {formatSize(compressedBlob.size)}</span>
                  <span style={{ color: '#10b981' }}>
                    Saved: {Math.round((1 - compressedBlob.size / file.size) * 100)}%
                  </span>
                </div>
              </div>
            ) : (
              <Button 
                onClick={compressImage} 
                disabled={isCompressing}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {isCompressing ? 'Compressing...' : 'Compress Image'}
              </Button>
            )}
          </div>
        )}

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {compressedBlob && (
          <Button 
            onClick={downloadCompressed} 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: '#10b981', color: 'white' }}
          >
            <Download size={20} /> Download Compressed Image
          </Button>
        )}
      </motion.div>
    </div>
  );
}
