"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Code2, ArrowRightLeft } from 'lucide-react';

export default function HtmlEntitiesWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.html-entities');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const encode = () => {
    let result = '';
    for (let i = 0; i < input.length; i++) {
      result += '&#' + input.charCodeAt(i) + ';';
    }
    setOutput(result);
  };

  const decode = () => {
    try {
      const doc = new DOMParser().parseFromString(input, "text/html");
      setOutput(doc.documentElement.textContent || '');
    } catch {
      setOutput('Error decoding entities');
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--accent-devsec)' }}>
        <Code2 /> {t('title') || 'HTML Entities'}
      </h2>
      <textarea
        className="w-full p-4 mb-4 bg-black/20 text-white rounded-lg border border-white/10"
        rows={4}
        placeholder={t('placeholder') || 'Enter text or HTML entities...'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex gap-2 mb-4">
        <Button onClick={encode}>{t('encodeBtn') || 'Encode to Entities'}</Button>
        <Button onClick={decode} variant="secondary">{t('decodeBtn') || 'Decode to Text'}</Button>
      </div>
      {output && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <label className="block mb-2 text-sm text-gray-300">Result</label>
          <textarea
            className="w-full p-4 bg-black/40 text-purple-300 rounded-lg border border-white/10"
            rows={4}
            readOnly
            value={output}
          />
        </motion.div>
      )}
    </div>
  );
}
