"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Lock, Shield, Calendar, Server, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SslCheckerWidget({ locale }: { locale: string }) {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setData(null);
    setError(null);
    
    try {
      const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
      const res = await fetch(`/api/ssl?domain=${encodeURIComponent(cleanDomain)}`);
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || 'Failed to check SSL');
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '1rem', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Lock size={24} style={{ color: '#10b981' }} />
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>SSL Certificate Checker</h2>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
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
          {loading ? 'Checking...' : 'Check SSL'}
        </Button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={24} />
            <div>
              <strong style={{ display: 'block' }}>Error checking SSL</strong>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '1rem' }}>
                  <Shield size={20} />
                  <span style={{ fontWeight: 600 }}>Certificate Subject</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Subject</div>
                    <div style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{data.subject}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Issuer</div>
                    <div style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{data.issuer}</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1.25rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  <Calendar size={20} />
                  <span style={{ fontWeight: 600 }}>Validity Period</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Issued On</div>
                    <div style={{ color: 'var(--text-primary)' }}>{new Date(data.validFrom).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Expires On</div>
                    <div style={{ color: 'var(--text-primary)' }}>{new Date(data.validTo).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                <Server size={20} />
                <span style={{ fontWeight: 600 }}>Connection Details</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Protocol</div>
                  <div style={{ color: 'var(--text-primary)' }}>{data.protocol}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Cipher</div>
                  <div style={{ color: 'var(--text-primary)' }}>{data.cipher}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
