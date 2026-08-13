"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Lock, File, AlertCircle } from 'lucide-react';

export default function PdfProtectWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setMessage(null);
    }
  };

  const protectPdf = () => {
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    // As per requirements: note that client-side protection isn't supported yet natively in pdf-lib
    setError(null);
    setMessage('PDF encryption requires server-side processing - coming soon.');
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
          <Lock /> Protect PDF
        </h2>
        
        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
          Add password protection to your PDF document to keep it secure.
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
            <File size={48} color="#aaa" style={{ marginBottom: '1rem' }} />
            <span style={{ color: 'white', fontWeight: 500 }}>Select PDF</span>
            <input 
              type="file" 
              accept="application/pdf" 
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>
        ) : (
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <File size={24} color="#6366f1" style={{ marginRight: '1rem' }} />
              <div style={{ color: 'white', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </div>
              <button 
                onClick={() => setFile(null)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
            
            <input 
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'white',
                width: '100%',
                outline: 'none'
              }}
            />
            
            <input 
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'white',
                width: '100%',
                outline: 'none'
              }}
            />
          </div>
        )}

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        
        {message && (
          <div style={{ color: '#3b82f6', marginBottom: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} /> {message}
          </div>
        )}

        <Button 
          onClick={protectPdf} 
          disabled={!file}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          <Lock size={20} /> Protect Document
        </Button>
      </motion.div>
    </div>
  );
}
