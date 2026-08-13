"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Monitor, Smartphone, Globe, Info } from 'lucide-react';

function parseUA(ua: string) {
  const browser = /Chrome\/(\d+)/.test(ua) ? 'Chrome' : /Firefox\/(\d+)/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : /Edge\/(\d+)/.test(ua) ? 'Edge' : 'Unknown';
  const os = /Windows NT/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : 'Unknown';
  const device = /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua) ? 'Mobile' : /Tablet|iPad|Playbook/.test(ua) ? 'Tablet' : 'Desktop';
  const engine = /WebKit/.test(ua) ? 'WebKit' : /Gecko/.test(ua) ? 'Gecko' : /Trident/.test(ua) ? 'Trident' : 'Unknown';

  return { browser, os, device, engine };
}

export default function UseragentParserWidget({ locale }: { locale: string }) {
  const [ua, setUa] = useState('');
  
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setUa(navigator.userAgent);
    }
  }, []);

  const parsed = parseUA(ua);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px', color: 'white' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Globe className="w-6 h-6 text-cyan-400" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>User Agent Parser</h2>
      </div>

      <textarea
        value={ua}
        onChange={(e) => setUa(e.target.value)}
        placeholder="User Agent String"
        style={{ width: '100%', height: '100px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', color: 'white', fontFamily: 'monospace', marginBottom: '24px', resize: 'vertical' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '12px', borderRadius: '50%' }}>
            <Globe className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Browser</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{parsed.browser}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(167, 139, 250, 0.1)', padding: '12px', borderRadius: '50%' }}>
            <Monitor className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Operating System</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{parsed.os}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(244, 114, 182, 0.1)', padding: '12px', borderRadius: '50%' }}>
            <Smartphone className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Device Type</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{parsed.device}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(251, 146, 60, 0.1)', padding: '12px', borderRadius: '50%' }}>
            <Info className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Engine</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{parsed.engine}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
