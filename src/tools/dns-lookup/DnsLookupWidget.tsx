"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Search, Globe, Server, Database, Mail, Shield, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'CNAME', 'TXT', 'NS', 'SOA'];

export default function DnsLookupWidget({ locale }: { locale: string }) {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const lookupDns = async () => {
    if (!domain.trim()) {
      setError('Please enter a valid domain name');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${recordType}`);
      if (!response.ok) {
        throw new Error('Failed to resolve DNS');
      }
      
      const data = await response.json();
      
      if (data.Answer) {
        setResults(data.Answer);
      } else {
        setError(`No ${recordType} records found for ${domain}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during DNS lookup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '1rem', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Globe size={24} style={{ color: 'var(--text-primary)' }} />
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>DNS Lookup</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            style={{
              flex: '1 1 auto',
              minWidth: '200px',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '1rem'
            }}
            onKeyDown={(e) => e.key === 'Enter' && lookupDns()}
          />
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              minWidth: '100px'
            }}
          >
            {RECORD_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <Button onClick={lookupDns} disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
            {loading ? 'Looking up...' : 'Lookup'}
          </Button>
        </div>
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

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ overflowX: 'auto' }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>TTL</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>Data</th>
                </tr>
              </thead>
              <tbody>
                {results.map((record, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>{record.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{record.TTL}s</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{record.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
