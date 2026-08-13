"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Network, Laptop, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MacLookupWidget({ locale }: { locale: string }) {
  const [mac, setMac] = useState('');
  const [loading, setLoading] = useState(false);
  const [vendor, setVendor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValidMac = (address: string) => {
    return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(address.trim()) ||
           /^([0-9A-Fa-f]{4}[.]){2}([0-9A-Fa-f]{4})$/.test(address.trim()) ||
           /^[0-9A-Fa-f]{12}$/.test(address.trim());
  };

  const lookupMac = async () => {
    const cleanMac = mac.trim();
    if (!cleanMac) {
      setError('Please enter a MAC address');
      return;
    }
    if (!isValidMac(cleanMac)) {
      setError('Invalid MAC address format (e.g., 00:11:22:33:44:55)');
      return;
    }

    setLoading(true);
    setError(null);
    setVendor(null);

    try {
      const response = await fetch(`https://api.macvendors.com/${encodeURIComponent(cleanMac)}`);
      
      if (response.status === 404) {
        setError('Vendor not found for this MAC address');
      } else if (!response.ok) {
        throw new Error('API request failed. Possible CORS block.');
      } else {
        const data = await response.text();
        setVendor(data);
      }
    } catch (err: any) {
      setError('Could not reach the MAC lookup service. The API might be blocked by CORS or an ad blocker.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '1rem', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Network size={24} style={{ color: 'var(--text-primary)' }} />
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>MAC Address Lookup</h2>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={mac}
          onChange={(e) => setMac(e.target.value)}
          placeholder="00:11:22:33:44:55"
          style={{
            flex: '1 1 auto',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            textTransform: 'uppercase',
            fontFamily: 'monospace'
          }}
          onKeyDown={(e) => e.key === 'Enter' && lookupMac()}
        />
        <Button onClick={lookupMac} disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
          {loading ? 'Searching...' : 'Find Vendor'}
        </Button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        {vendor && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '1.5rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
          >
            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: '#3b82f6' }}>
              <Laptop size={32} />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Manufacturer / Vendor</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600 }}>{vendor}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', fontFamily: 'monospace' }}>OUI: {mac.replace(/[:-]/g, '').substring(0, 6).toUpperCase()}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
