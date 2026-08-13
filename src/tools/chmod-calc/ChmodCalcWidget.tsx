"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Settings } from 'lucide-react';

export default function ChmodCalcWidget({ locale }: { locale: string }) {
  const [perms, setPerms] = useState({
    owner: { r: true, w: true, x: true },
    group: { r: true, w: false, x: true },
    others: { r: true, w: false, x: true }
  });
  
  const [numeric, setNumeric] = useState('755');

  useEffect(() => {
    const o = (perms.owner.r ? 4 : 0) + (perms.owner.w ? 2 : 0) + (perms.owner.x ? 1 : 0);
    const g = (perms.group.r ? 4 : 0) + (perms.group.w ? 2 : 0) + (perms.group.x ? 1 : 0);
    const ot = (perms.others.r ? 4 : 0) + (perms.others.w ? 2 : 0) + (perms.others.x ? 1 : 0);
    setNumeric(`${o}${g}${ot}`);
  }, [perms]);

  const handleNumericChange = (val: string) => {
    if (!/^[0-7]{0,3}$/.test(val)) return;
    setNumeric(val);
    if (val.length === 3) {
      const o = parseInt(val[0]);
      const g = parseInt(val[1]);
      const ot = parseInt(val[2]);
      setPerms({
        owner: { r: (o & 4) > 0, w: (o & 2) > 0, x: (o & 1) > 0 },
        group: { r: (g & 4) > 0, w: (g & 2) > 0, x: (g & 1) > 0 },
        others: { r: (ot & 4) > 0, w: (ot & 2) > 0, x: (ot & 1) > 0 }
      });
    }
  };

  const toSymbolic = () => {
    const p = (role: { r: boolean; w: boolean; x: boolean }) => `${role.r ? 'r' : '-'}${role.w ? 'w' : '-'}${role.x ? 'x' : '-'}`;
    return `${p(perms.owner)}${p(perms.group)}${p(perms.others)}`;
  };

  const applyPreset = (preset: string) => handleNumericChange(preset);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px', color: 'white' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Settings className="w-6 h-6 text-yellow-400" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Chmod Calculator</h2>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['777', '755', '644', '600', '400'].map(preset => (
          <Button key={preset} onClick={() => applyPreset(preset)}>{preset}</Button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {(['owner', 'group', 'others'] as const).map(role => (
          <div key={role} style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ textTransform: 'capitalize', marginBottom: '16px', fontSize: '1.1rem', textAlign: 'center' }}>{role}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(['r', 'w', 'x'] as const).map(perm => (
                <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={perms[role][perm]} 
                    onChange={e => setPerms(prev => ({ ...prev, [role]: { ...prev[role], [perm]: e.target.checked } }))}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>{perm === 'r' ? 'Read' : perm === 'w' ? 'Write' : 'Execute'}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af' }}>Numeric Value</label>
          <input 
            type="text" 
            value={numeric} 
            onChange={e => handleNumericChange(e.target.value)}
            maxLength={3}
            style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '1.2rem', textAlign: 'center' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af' }}>Symbolic Notation</label>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', color: 'white', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '2px' }}>
            {toSymbolic()}
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <span style={{ color: '#9ca3af' }}>Command:</span>
        <code style={{ fontSize: '1.2rem', color: '#4ade80' }}>chmod {numeric.padEnd(3, '0')} filename</code>
      </div>
    </motion.div>
  );
}
