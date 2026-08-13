"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Clock } from 'lucide-react';

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return 'Invalid cron expression format (requires 5 fields)';
  const [min, hour, dom, month, dow] = parts;
  
  if (min === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') return 'Every minute';
  if (min === '0' && hour === '*' && dom === '*' && month === '*' && dow === '*') return 'Every hour';
  if (min === '0' && hour === '0' && dom === '*' && month === '*' && dow === '*') return 'Daily at midnight';
  if (min === '0' && hour === '0' && dom === '*' && month === '*' && dow === '1') return 'Weekly on Monday at midnight';
  if (min === '0' && hour === '0' && dom === '1' && month === '*' && dow === '*') return 'Monthly on the 1st at midnight';

  return `At minute ${min}, hour ${hour}, day of month ${dom}, month ${month}, day of week ${dow}`;
}

export default function CronParserWidget({ locale }: { locale: string }) {
  const [cron, setCron] = useState('* * * * *');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    setDesc(describeCron(cron));
  }, [cron]);

  const presets = [
    { label: 'Every minute', val: '* * * * *' },
    { label: 'Every hour', val: '0 * * * *' },
    { label: 'Daily at midnight', val: '0 0 * * *' },
    { label: 'Weekly on Monday', val: '0 0 * * 1' },
    { label: 'Monthly on 1st', val: '0 0 1 * *' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px', color: 'white' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Clock className="w-6 h-6 text-purple-400" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Cron Expression Parser</h2>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {presets.map(p => (
          <Button key={p.label} onClick={() => setCron(p.val)}>{p.label}</Button>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af' }}>Cron Expression</label>
        <input 
          type="text" 
          value={cron} 
          onChange={e => setCron(e.target.value)}
          style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', color: 'white', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '4px', fontFamily: 'monospace' }}
        />
      </div>

      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
        <h3 style={{ color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Description</h3>
        <p style={{ fontSize: '1.25rem', color: '#a78bfa', margin: 0, fontWeight: 500 }}>{desc}</p>
      </div>

      <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
        <p style={{ fontSize: '0.9rem', color: '#9ca3af', margin: 0 }}>
          <strong>Format:</strong> <code>minute hour day(month) month day(week)</code>
        </p>
      </div>
    </motion.div>
  );
}
