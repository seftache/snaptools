'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Type, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CaseConverterWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.case');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (val: string, id: string) => {
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {}
  };

  const toUpper = (str: string) => str.toUpperCase();
  const toLower = (str: string) => str.toLowerCase();
  
  const toTitle = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  };

  const toCamel = (str: string) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  };

  const toSnake = (str: string) => {
    return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      ?.map(x => x.toLowerCase())
      .join('_') || str;
  };

  const toKebab = (str: string) => {
    return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      ?.map(x => x.toLowerCase())
      .join('-') || str;
  };

  const conversions = [
    { id: 'upper', label: t('upper'), value: toUpper(text) },
    { id: 'lower', label: t('lower'), value: toLower(text) },
    { id: 'title', label: t('title'), value: toTitle(text) },
    { id: 'camel', label: t('camel'), value: toCamel(text) },
    { id: 'snake', label: t('snake'), value: toSnake(text) },
    { id: 'kebab', label: t('kebab'), value: toKebab(text) }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Input */}
      <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '24px' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('inputPlaceholder')}
          style={{
            width: '100%', minHeight: '120px', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '16px', color: '#f0f0f5', fontSize: '16px', resize: 'vertical', outline: 'none'
          }}
        />
      </div>

      {/* Outputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {conversions.map((conv) => (
          <div key={conv.id} style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c9a96e', fontSize: '14px', fontWeight: 500 }}>
                <Type size={16} /> {conv.label}
              </div>
              <button
                onClick={() => copyToClipboard(conv.value, conv.id)}
                disabled={!text}
                style={{
                  background: 'transparent', border: 'none', cursor: text ? 'pointer' : 'not-allowed',
                  color: copied === conv.id ? '#10b981' : text ? '#f0f0f5' : '#55556a', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                }}
              >
                {copied === conv.id ? <Check size={14} /> : <Copy size={14} />} {t('copyResult')}
              </button>
            </div>
            <div style={{ background: '#0a0a0f', borderRadius: '8px', padding: '12px', minHeight: '60px', color: text ? '#f0f0f5' : '#55556a', fontSize: '15px', wordBreak: 'break-all' }}>
              {conv.value || '...'}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
