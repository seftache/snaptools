"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Key, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export default function JwtDecoderWidget({ locale }: { locale: string }) {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<{ header: any; payload: any; signature: string; valid: boolean; expired: boolean; error: string | null } | null>(null);

  useEffect(() => {
    if (!token.trim()) {
      setDecoded(null);
      return;
    }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format (must have 3 parts)');
      
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const signature = parts[2];
      
      let expired = false;
      if (payload.exp) {
        expired = payload.exp * 1000 < Date.now();
      }

      setDecoded({ header, payload, signature, valid: true, expired, error: null });
    } catch (e: any) {
      setDecoded({ header: null, payload: null, signature: '', valid: false, expired: false, error: e.message || 'Invalid token' });
    }
  }, [token]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px', color: 'white' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Key className="w-6 h-6 text-blue-400" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>JWT Decoder</h2>
      </div>

      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste your JWT token here (ey...)"
        style={{ width: '100%', height: '120px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', color: 'white', fontFamily: 'monospace', marginBottom: '24px', resize: 'vertical' }}
      />

      {decoded?.error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
          <ShieldAlert className="w-5 h-5" />
          <span>{decoded.error}</span>
        </div>
      )}

      {decoded?.valid && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
            {decoded.expired ? <Clock className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-green-400" />}
            <span style={{ color: decoded.expired ? '#ef4444' : '#4ade80', fontWeight: 500 }}>
              {decoded.expired ? 'Token has expired' : (decoded.payload.exp ? 'Token is valid and active' : 'Token has no expiration (exp) claim')}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ color: '#60a5fa', marginBottom: '12px', fontSize: '1.1rem', fontWeight: 600 }}>Header</h3>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ color: '#c084fc', marginBottom: '12px', fontSize: '1.1rem', fontWeight: 600 }}>Payload</h3>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>

            <div style={{ background: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.2)', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ color: '#fb923c', marginBottom: '12px', fontSize: '1.1rem', fontWeight: 600 }}>Signature</h3>
              <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.9rem', color: '#cbd5e1' }}>
                {decoded.signature}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
