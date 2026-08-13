"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Paintbrush, Copy, Trash2, CheckCircle2 } from 'lucide-react';

export default function CssMinifierWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.css');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const minifyCss = (css: string) => {
    let minified = css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ')             // Replace multiple spaces with one
      .replace(/\s*([\{\}\:\;\,])\s*/g, '$1') // Remove spaces around delimiters
      .replace(/\;+\}/g, '}')           // Remove trailing semicolons
      .trim();
    setOutput(minified);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[800px] mx-auto p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--accent-devsec)' }}>
        <Paintbrush /> {t('title') || 'CSS Minifier'}
      </h2>
      <textarea
        className="w-full p-4 mb-4 bg-black/20 text-white rounded-lg border border-white/10 focus:outline-none"
        rows={6}
        placeholder={t('placeholder') || 'Paste your CSS here...'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex gap-2 mb-4">
        <Button onClick={() => minifyCss(input)}>{t('minifyBtn') || 'Minify CSS'}</Button>
        <Button onClick={() => { setInput(''); setOutput(''); }} variant="secondary">
          <Trash2 className="w-4 h-4 mr-2" /> {t('clearBtn') || 'Clear'}
        </Button>
      </div>
      {output && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <textarea
            className="w-full p-4 bg-black/40 text-blue-300 rounded-lg border border-white/10"
            rows={6}
            readOnly
            value={output}
          />
          <button onClick={handleCopy} className="absolute top-2 right-2 p-2 bg-black/50 rounded-md text-white/70 hover:text-white transition">
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </motion.div>
      )}
    </div>
  );
}
