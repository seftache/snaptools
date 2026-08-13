"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { AlignLeft, Copy } from 'lucide-react';

export default function RemoveLinesWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.remove-lines');
  const [input, setInput] = useState('');
  
  const removeBreaks = () => {
    // Replace newlines with spaces and clean up double spaces
    const cleaned = input.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
    setInput(cleaned);
  };

  const removeEmptyLines = () => {
    const cleaned = input.split(/\r?\n/).filter(line => line.trim() !== '').join('\n');
    setInput(cleaned);
  };

  return (
    <div className="w-full max-w-[800px] mx-auto p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--accent-daily)' }}>
        <AlignLeft /> {t('title') || 'Remove Line Breaks'}
      </h2>
      <textarea
        className="w-full p-4 mb-4 bg-black/20 text-white rounded-lg border border-white/10"
        rows={8}
        placeholder={t('placeholder') || 'Paste text with unwanted line breaks...'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={removeBreaks}>{t('removeBreaksBtn') || 'Remove All Line Breaks'}</Button>
        <Button onClick={removeEmptyLines} variant="secondary">{t('removeEmptyBtn') || 'Remove Empty Lines'}</Button>
        <Button variant="secondary" onClick={() => navigator.clipboard.writeText(input)}>
          <Copy className="w-4 h-4 mr-2" /> {t('copyBtn') || 'Copy'}
        </Button>
      </div>
    </div>
  );
}
