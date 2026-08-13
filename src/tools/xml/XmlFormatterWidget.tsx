"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { FileCode2, Copy, Trash2, CheckCircle2 } from 'lucide-react';

export default function XmlFormatterWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.xml');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const formatXml = (xml: string) => {
    try {
      if (!xml.trim()) {
        setOutput('');
        return;
      }
      let formatted = '';
      let pad = 0;
      xml.replace(/>\s*</g, '><').split(/(?=<)|(?<=>)/).forEach(node => {
        if (!node.trim()) return;
        if (node.match(/^\/<\w/)) pad -= 1;
        if (node.match(/^<\/\w/)) pad -= 1;
        let indent = '';
        for (let i = 0; i < pad; i++) indent += '  ';
        formatted += indent + node + '\r\n';
        if (node.match(/^<\w[^>]*[^\/]>$/) && !node.startsWith("<!")) pad += 1;
      });
      setOutput(formatted.trim());
      setError('');
    } catch (e) {
      setError(t('invalidXml') || 'Invalid XML format');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[800px] mx-auto p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--accent-devsec)' }}>
        <FileCode2 /> {t('title') || 'XML Formatter'}
      </h2>
      <textarea
        className="w-full p-4 mb-4 bg-black/20 text-white rounded-lg border border-white/10"
        rows={6}
        placeholder={t('placeholder') || 'Paste your XML here...'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex gap-2 mb-4">
        <Button onClick={() => formatXml(input)}>{t('formatBtn') || 'Format XML'}</Button>
        <Button onClick={() => { setInput(''); setOutput(''); setError(''); }} variant="secondary">
          <Trash2 className="w-4 h-4 mr-2" /> {t('clearBtn') || 'Clear'}
        </Button>
      </div>
      {error && <div className="text-red-400 mb-4">{error}</div>}
      {output && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <textarea
            className="w-full p-4 bg-black/40 text-green-300 rounded-lg border border-white/10"
            rows={10}
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
