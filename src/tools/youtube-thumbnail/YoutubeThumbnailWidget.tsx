"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Clipboard, Download } from 'lucide-react';

export default function YoutubeThumbnailWidget({ locale }: { locale: string }) {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      extractVideoId(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    extractVideoId(e.target.value);
  };

  const extractVideoId = (inputUrl: string) => {
    if (!inputUrl) {
      setVideoId(null);
      return;
    }
    
    // Basic regex for youtube URLs (watch, youtu.be, shorts)
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/;
    const match = inputUrl.match(regExp);
    
    if (match && match[2].length === 11) {
      setVideoId(match[2]);
    } else {
      setVideoId(null);
    }
  };

  const sizes = [
    { id: 'maxresdefault', name: 'Max Resolution (1080p)' },
    { id: 'hqdefault', name: 'High Quality (720p)' },
    { id: 'mqdefault', name: 'Medium Quality (480p)' },
    { id: 'sddefault', name: 'Standard Quality (360p)' }
  ];

  const handleDownload = async (sizeId: string) => {
    if (!videoId) return;
    
    const imgUrl = `https://img.youtube.com/vi/${videoId}/${sizeId}.jpg`;
    
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `youtube_thumbnail_${videoId}_${sizeId}.jpg`;
      link.click();
      
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback if fetch fails due to CORS
      window.open(imgUrl, '_blank');
    }
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
          <ImageIcon color="#f43f5e" /> YouTube Thumbnail Downloader
        </h2>
        
        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
          Download high-quality thumbnails from any YouTube video.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <input 
            type="text"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={handleUrlChange}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'white',
              outline: 'none'
            }}
          />
          <Button onClick={handlePaste} style={{ padding: '0 1rem' }}>
            <Clipboard size={20} />
          </Button>
        </div>

        {videoId && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {sizes.map((size) => (
              <div key={size.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 500 }}>{size.name}</span>
                  <Button onClick={() => handleDownload(size.id)} style={{ padding: '0.5rem 1rem' }}>
                    <Download size={16} style={{ marginRight: '0.5rem' }} /> Download
                  </Button>
                </div>
                <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#000', display: 'flex', justifyContent: 'center' }}>
                  <img 
                    src={`https://img.youtube.com/vi/${videoId}/${size.id}.jpg`} 
                    alt={`Thumbnail ${size.name}`}
                    style={{ maxWidth: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
