"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Code, Check } from 'lucide-react';

function formatSql(sql: string, indentSize: number = 2, uppercase: boolean = true): string {
  let formatted = sql.replace(/\s+/g, ' ').trim();
  const newlineKeywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'];
  
  newlineKeywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${uppercase ? kw : kw.toLowerCase()}`);
  });

  const lines = formatted.split('\n').filter(l => l.trim());
  return lines.map((line) => {
    const trimmed = line.trim();
    const isMainKeyword = newlineKeywords.some(kw => trimmed.toUpperCase().startsWith(kw));
    return isMainKeyword ? trimmed : ' '.repeat(indentSize) + trimmed;
  }).join('\n');
}

export default function SqlFormatterWidget({ locale }: { locale: string }) {
  const [sql, setSql] = useState('select id, name, email from users where active = 1 order by created_at desc');
  const [formatted, setFormatted] = useState('');
  const [indent, setIndent] = useState(2);
  const [uppercase, setUppercase] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    setFormatted(formatSql(sql, indent, uppercase));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px', color: 'white' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Code className="w-6 h-6 text-green-400" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>SQL Formatter</h2>
      </div>

      <textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        placeholder="Paste your minified or messy SQL here..."
        style={{ width: '100%', height: '150px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', color: 'white', fontFamily: 'monospace', marginBottom: '16px', resize: 'vertical' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#9ca3af' }}>Indent:</span>
          <select 
            value={indent} 
            onChange={e => setIndent(Number(e.target.value))}
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'white', padding: '4px 8px', borderRadius: '4px' }}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={uppercase} 
            onChange={e => setUppercase(e.target.checked)} 
            style={{ width: '16px', height: '16px' }}
          />
          <span style={{ color: '#9ca3af' }}>Uppercase Keywords</span>
        </label>

        <div style={{ flexGrow: 1 }} />
        <Button onClick={handleFormat}>Format SQL</Button>
      </div>

      {formatted && (
        <div style={{ position: 'relative' }}>
          <textarea
            readOnly
            value={formatted}
            style={{ width: '100%', height: '200px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', color: '#4ade80', fontFamily: 'monospace', resize: 'vertical' }}
          />
          <Button 
            onClick={handleCopy}
            style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', fontSize: '0.8rem' }}
          >
            {copied ? <Check className="w-4 h-4" /> : 'Copy'}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
