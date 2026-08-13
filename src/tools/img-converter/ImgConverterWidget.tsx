"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Upload, RefreshCw, Download } from 'lucide-react';

export default function ImgConverterWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState('image/webp');
  const [quality, setQuality] = useState(80);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const convertImage = () => {
    if (!file || !canvasRef.current) return;
    setIsConverting(true);
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
        setIsConverting(false);
        return;
      }
      
      // Draw white background for png -> jpeg conversion transparency handling
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const ext = format.split('/')[1];
            const newUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = newUrl;
            link.download = `converted_${Date.now()}.${ext}`;
            link.click();
            URL.revokeObjectURL(newUrl);
          } else {
            setError('Conversion failed');
          }
          setIsConverting(false);
        },
        format,
        quality / 100
      );
      
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      setError('Failed to load image');
      setIsConverting(false);
      URL.revokeObjectURL(url);
    };

    img.src = url;
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
          <RefreshCw color="#3b82f6" /> Image Converter
        </h2>
        
        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
          Convert images between PNG, JPG, and WEBP formats directly in your browser.
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
            <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <ImageIcon size={24} color="#3b82f6" style={{ marginRight: '1rem' }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {file.name}
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              >
                Change
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#aaa', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Output Format</label>
                <select 
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    color: 'white',
                    width: '100%',
                    outline: 'none'
                  }}
                >
                  <option value="image/webp">WEBP</option>
                  <option value="image/jpeg">JPG / JPEG</option>
                  <option value="image/png">PNG</option>
                </select>
              </div>
            </div>

            {format !== 'image/png' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#aaa', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                  Quality: {quality}%
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={quality} 
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <Button 
          onClick={convertImage} 
          disabled={!file || isConverting}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          {isConverting ? 'Converting...' : <><Download size={20} /> Convert & Download</>}
        </Button>
      </motion.div>
    </div>
  );
}
