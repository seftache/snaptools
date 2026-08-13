"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Hash, Copy, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type HashAlgo = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' | 'MD5';

export default function HashGeneratorWidget({ locale }: { locale: string }) {
  const [text, setText] = useState('');
  const [algo, setAlgo] = useState<HashAlgo>('SHA-256');
  const [hash, setHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateHash(text, algo);
  }, [text, algo]);

  const generateHash = async (input: string, algorithm: HashAlgo) => {
    if (!input) {
      setHash('');
      setError(null);
      return;
    }

    if (algorithm === 'MD5') {
      setError("MD5 is considered cryptographically insecure and is not supported by the Web Crypto API. Please use a SHA algorithm.");
      setHash('');
      return;
    }

    setError(null);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setHash(hashHex);
    } catch (err: any) {
      setError(`Error generating hash: ${err.message}`);
    }
  };

  const copyToClipboard = async () => {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '1rem', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Hash size={24} style={{ color: 'var(--text-primary)' }} />
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>Hash Generator</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to hash..."
          rows={4}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            resize: 'vertical'
          }}
        />

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as HashAlgo)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              minWidth: '150px'
            }}
          >
            <option value="SHA-1">SHA-1 (Insecure)</option>
            <option value="SHA-256">SHA-256 (Recommended)</option>
            <option value="SHA-384">SHA-384</option>
            <option value="SHA-512">SHA-512</option>
            <option value="MD5">MD5 (Deprecated)</option>
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        ) : hash ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '1.25rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)', position: 'relative' }}
          >
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Generated {algo} Hash
            </div>
            <div style={{ 
              color: 'var(--text-primary)', 
              fontFamily: 'monospace', 
              fontSize: '1.125rem', 
              wordBreak: 'break-all',
              paddingRight: '3rem' 
            }}>
              {hash}
            </div>
            <button
              onClick={copyToClipboard}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                color: copied ? '#10b981' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title="Copy to clipboard"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
