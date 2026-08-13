"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Network, Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeadersCheckerWidget({ locale }: { locale: string }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setData(null);
    setError(null);
    
    try {
      const res = await fetch(`/api/headers?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || 'Failed to check headers');
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkHeaderStatus = (key: string, value: string) => {
    const k = key.toLowerCase();
    if (k === 'strict-transport-security' || k === 'content-security-policy' || k === 'x-frame-options' || k === 'x-content-type-options') return 'pass';
    if (k === 'server' || k === 'x-powered-by') return 'fail';
    return 'info';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '1rem', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Network size={24} style={{ color: 'var(--text-primary)' }} />
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>HTTP Headers Analyzer</h2>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          style={{
            flex: '1 1 auto',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontSize: '1rem'
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
        />
        <Button onClick={handleCheck} disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <AlertTriangle size={24} />
            <div>
              <strong style={{ display: 'block' }}>Error checking headers</strong>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} /> Headers for {url} <span style={{fontSize: '0.875rem', color: data.status === 200 ? '#10b981' : '#f59e0b'}}>(HTTP {data.status})</span>
              </h3>
              
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                {Object.entries(data.headers || {}).map(([key, value], i, arr) => {
                  const status = checkHeaderStatus(key, value as string);
                  return (
                    <div key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '1rem', padding: '1rem', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '220px' }}>
                        {status === 'pass' && <CheckCircle size={16} color="#10b981" />}
                        {status === 'fail' && <AlertTriangle size={16} color="#ef4444" />}
                        {status === 'info' && <Info size={16} color="#3b82f6" />}
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>{key}</span>
                      </div>
                      <div style={{ flex: '1 1 auto', color: 'var(--text-secondary)', fontSize: '0.875rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {value as string}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
