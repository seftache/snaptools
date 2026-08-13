"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Terminal, ShieldAlert, Check, Play, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PortScannerWidget({ locale }: { locale: string }) {
  const [target, setTarget] = useState('');
  const [preset, setPreset] = useState('top20');
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);

  const handleScan = async () => {
    if (!target.trim()) return;
    setScanning(true);
    setScanned(false);
    setResults([]);
    setLogs([`> Initializing Nmap scan against ${target}...`]);
    
    try {
      const cleanTarget = target.replace(/^https?:\/\//, '').split('/')[0];
      const res = await fetch(`/api/portscan?host=${encodeURIComponent(cleanTarget)}`);
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || 'Failed to scan ports');
      
      setLogs(prev => [...prev, '> Scan completed successfully.']);
      setResults(json.results || []);
    } catch (err: any) {
      setLogs(prev => [...prev, `> Error: ${err.message}`]);
    } finally {
      setScanning(false);
      setScanned(true);
    }
  };

  const getServiceName = (port: number) => {
    const services: Record<number, string> = {
      21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp', 53: 'dns',
      80: 'http', 110: 'pop3', 143: 'imap', 443: 'https', 445: 'smb',
      3306: 'mysql', 3389: 'rdp', 5432: 'postgresql', 8080: 'http-proxy'
    };
    return services[port] || 'unknown';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem', background: '#0a0a0a', borderRadius: '1rem', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: '#00ff00', fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px dashed #333', paddingBottom: '1rem' }}>
        <Terminal size={24} style={{ color: '#00ff00' }} />
        <h2 style={{ margin: 0, color: '#00ff00', fontSize: '1.25rem', fontWeight: 600, textTransform: 'uppercase' }}>Port Scanner v1.0</h2>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="TARGET IP OR HOST (e.g. 192.168.1.1)"
          style={{
            flex: '1 1 auto',
            padding: '0.75rem 1rem',
            borderRadius: '0.25rem',
            border: '1px solid #00ff00',
            background: '#000',
            color: '#00ff00',
            fontFamily: 'monospace',
            outline: 'none'
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
        />
        <select
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.25rem',
            border: '1px solid #333',
            background: '#000',
            color: '#aaa',
            fontFamily: 'monospace',
            outline: 'none'
          }}
        >
          <option value="top20">Top 20 Ports</option>
        </select>
        <button 
          onClick={handleScan} 
          disabled={scanning}
          style={{ 
            padding: '0.75rem 1.5rem',
            background: scanning ? '#333' : '#00ff00',
            color: '#000',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: scanning ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Play size={16} />
          {scanning ? 'SCANNING...' : 'ENGAGE'}
        </button>
      </div>

      <AnimatePresence>
        {(scanning || scanned) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div style={{ padding: '1rem', background: '#050505', border: '1px solid #222', borderRadius: '0.25rem', minHeight: '100px', fontSize: '0.875rem', lineHeight: 1.5 }}>
              {logs.map((log, i) => (
                <div key={i} style={{ color: log.includes('open') ? '#00ff00' : log.includes('Error') ? '#ff3333' : '#888' }}>{log}</div>
              ))}
              {scanning && <div className="animate-pulse">_</div>}
            </div>

            {scanned && results.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333', color: '#888' }}>
                    <th style={{ padding: '0.75rem', fontWeight: 'normal' }}>PORT</th>
                    <th style={{ padding: '0.75rem', fontWeight: 'normal' }}>STATE</th>
                    <th style={{ padding: '0.75rem', fontWeight: 'normal' }}>SERVICE</th>
                  </tr>
                </thead>
                <tbody>
                  {results.sort((a, b) => a.port - b.port).map((p, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '0.75rem' }}>{p.port}/tcp</td>
                      <td style={{ 
                        padding: '0.75rem', 
                        color: p.status === 'open' ? '#00ff00' : p.status === 'closed' ? '#ff3333' : '#ffaa00',
                        fontWeight: p.status === 'open' ? 'bold' : 'normal'
                      }}>
                        {p.status.toUpperCase()}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#ccc' }}>{getServiceName(p.port)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
