"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Shuffle, Copy } from 'lucide-react';

export default function ListShufflerWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.shuffle');
  const [input, setInput] = useState('');
  
  const shuffleList = () => {
    const lines = input.split('\n').filter(l => l.trim() !== '');
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    setInput(lines.join('\n'));
  };

  return (
    <div className="w-full max-w-[800px] mx-auto p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--accent-daily)' }}>
        <Shuffle /> {t('title') || 'List Shuffler'}
      </h2>
      <textarea
        className="w-full p-4 mb-4 bg-black/20 text-white rounded-lg border border-white/10"
        rows={8}
        placeholder={t('placeholder') || 'Enter items (one per line)...'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={shuffleList}>{t('shuffleBtn') || 'Shuffle Lines'}</Button>
        <Button variant="secondary" onClick={() => navigator.clipboard.writeText(input)}>
          <Copy className="w-4 h-4 mr-2" /> {t('copyBtn') || 'Copy'}
        </Button>
      </div>
    </div>
  );
}
