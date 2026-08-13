"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Search, Globe, AlertCircle, Info, Calendar, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhoisWidget({ locale }: { locale: string }) {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const lookupWhois = async () => {
    if (!domain.trim()) {
      setError('Please enter a valid domain name');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    // Basic domain extraction
    let target = domain.trim().toLowerCase();
    try {
      const url = new URL(target.includes('http') ? target : `http://${target}`);
      target = url.hostname;
    } catch (e) {
      // Keep original input if URL parsing fails
    }

    try {
      const response = await fetch(`https://rdap.org/domain/${target}`);
      if (!response.ok) {
        throw new Error('Domain not found or RDAP query failed');
      }
      
      const json = await response.json();
      
      // Extract relevant data
      const events = json.events || [];
      const registrationDate = events.find((e: any) => e.eventAction === 'registration')?.eventDate;
      const expirationDate = events.find((e: any) => e.eventAction === 'expiration')?.eventDate;
      
      const entities = json.entities || [];
      const registrar = entities.find((e: any) => e.roles?.includes('registrar'))?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3];
      
      const nameservers = json.nameservers?.map((ns: any) => ns.ldhName) || [];
      const status = json.status || [];

      setData({
        handle: json.handle,
        registrar: registrar || 'Unknown',
        registrationDate,
        expirationDate,
        nameservers,
        status
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred during WHOIS lookup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '1rem', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Info size={24} style={{ color: 'var(--text-primary)' }} />
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>WHOIS Lookup</h2>
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
          onKeyDown={(e) => e.key === 'Enter' && lookupWhois()}
        />
        <Button onClick={lookupWhois} disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
          {loading ? 'Searching...' : 'Lookup'}
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

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Registrar</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{data.registrar}</div>
              </div>
              
              <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> Creation Date</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{data.registrationDate ? new Date(data.registrationDate).toLocaleDateString() : 'N/A'}</div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> Expiry Date</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{data.expirationDate ? new Date(data.expirationDate).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Server size={14} /> Nameservers</div>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-primary)' }}>
                {data.nameservers.length > 0 ? (
                  data.nameservers.map((ns: string, i: number) => <li key={i}>{ns}</li>)
                ) : (
                  <li>No nameservers found</li>
                )}
              </ul>
            </div>
            
            {data.status && data.status.length > 0 && (
              <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Status</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {data.status.map((s: string, i: number) => (
                    <span key={i} style={{ padding: '0.25rem 0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '0.25rem', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                      {s.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
