"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Play, Download, Clipboard, AlertCircle } from 'lucide-react';

const API_ENDPOINT = process.env.NEXT_PUBLIC_YT_API || '';

export default function YtDownloaderWidget({ locale }: { locale: string }) {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('1080p');
  const [format, setFormat] = useState('mp4');
  const [message, setMessage] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const handleDownload = () => {
    if (!url) return;
    setMessage('This feature requires an API key. Configure your API in settings.');
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
          <Play color="#ef4444" /> YouTube Downloader
        </h2>
        
        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
          Download YouTube videos in high quality.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input 
            type="text"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
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

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Quality</label>
            <select 
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'white',
                outline: 'none'
              }}
            >
              <option value="1080p">1080p (Full HD)</option>
              <option value="720p">720p (HD)</option>
              <option value="480p">480p</option>
              <option value="360p">360p</option>
            </select>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Format</label>
            <select 
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'white',
                outline: 'none'
              }}
            >
              <option value="mp4">MP4</option>
              <option value="webm">WEBM</option>
            </select>
          </div>
        </div>

        {message && (
          <div style={{ color: '#eab308', marginBottom: '1rem', padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} /> {message}
          </div>
        )}

        <Button 
          onClick={handleDownload} 
          disabled={!url}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          <Download size={20} /> Download Video
        </Button>
      </motion.div>
    </div>
  );
}
