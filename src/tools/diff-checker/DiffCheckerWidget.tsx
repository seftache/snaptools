"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GitCompare } from 'lucide-react';

function computeDiff(original: string, modified: string) {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');
  const result: Array<{type: 'same' | 'added' | 'removed', line: string}> = [];
  const maxLen = Math.max(origLines.length, modLines.length);
  
  let additions = 0;
  let removals = 0;
  let unchanged = 0;

  for (let i = 0; i < maxLen; i++) {
    const orig = origLines[i];
    const mod = modLines[i];
    if (orig === mod) {
      result.push({type: 'same', line: orig || ''});
      unchanged++;
    } else {
      if (orig !== undefined) {
        result.push({type: 'removed', line: orig});
        removals++;
      }
      if (mod !== undefined) {
        result.push({type: 'added', line: mod});
        additions++;
      }
    }
  }
  return { result, stats: { additions, removals, unchanged } };
}

export default function DiffCheckerWidget({ locale }: { locale: string }) {
  const [original, setOriginal] = useState('const x = 1;\nconsole.log(x);');
  const [modified, setModified] = useState('const x = 2;\nconsole.log(x);\n// modified');
  const [diffData, setDiffData] = useState<{ result: Array<{type: string, line: string}>, stats: any } | null>(null);

  const handleCompare = () => {
    setDiffData(computeDiff(original, modified));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px', color: 'white' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <GitCompare className="w-6 h-6 text-red-400" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Diff Checker</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af' }}>Original Text</label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            style={{ width: '100%', height: '150px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', color: 'white', fontFamily: 'monospace', resize: 'vertical' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af' }}>Modified Text</label>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            style={{ width: '100%', height: '150px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', color: 'white', fontFamily: 'monospace', resize: 'vertical' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <Button onClick={handleCompare}>Compare Texts</Button>
      </div>

      {diffData && (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: '#4ade80' }}>+{diffData.stats.additions} Additions</span>
            <span style={{ color: '#ef4444' }}>-{diffData.stats.removals} Removals</span>
            <span style={{ color: '#9ca3af' }}>{diffData.stats.unchanged} Unchanged</span>
          </div>
          <div style={{ padding: '16px', overflowX: 'auto', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.5' }}>
            {diffData.result.map((item, idx) => {
              let bg = 'transparent';
              let color = '#d1d5db';
              if (item.type === 'added') { bg = 'rgba(74, 222, 128, 0.1)'; color = '#4ade80'; }
              if (item.type === 'removed') { bg = 'rgba(239, 68, 68, 0.1)'; color = '#ef4444'; }
              
              return (
                <div key={idx} style={{ display: 'flex', background: bg, color }}>
                  <div style={{ width: '40px', flexShrink: 0, textAlign: 'right', paddingRight: '12px', color: '#6b7280', userSelect: 'none' }}>{idx + 1}</div>
                  <div style={{ flexGrow: 1, whiteSpace: 'pre-wrap' }}>
                    {item.type === 'added' && '+ '}
                    {item.type === 'removed' && '- '}
                    {item.type === 'same' && '  '}
                    {item.line}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
