'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Copy, Check, Link as LinkIcon, Globe, Hash, List, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function UrlParserWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.url');
  const [url, setUrl] = useState('');
  const [parsed, setParsed] = useState<URL | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!url.trim()) {
        setParsed(null);
        return;
      }
      
      // Add protocol if missing to allow parsing
      const validUrl = url.includes('://') ? url : `https://${url}`;
      setParsed(new URL(validUrl));
    } catch (e) {
      setParsed(null);
    }
  }, [url]);

  const copyToClipboard = async (text: string, field: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const encodeUrl = () => {
    setUrl(encodeURIComponent(url));
  };

  const decodeUrl = () => {
    try {
      setUrl(decodeURIComponent(url));
    } catch (e) {
      // Ignore if not decodable
    }
  };

  const renderField = (label: string, value: string, icon: React.ReactNode, fieldId: string) => (
    <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8a8a9a', fontSize: '13px', fontWeight: 500 }}>
        {icon}
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ color: value ? '#f0f0f5' : '#55556a', fontSize: '15px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
          {value || 'None'}
        </div>
        {value && (
          <button
            onClick={() => copyToClipboard(value, fieldId)}
            style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: copiedField === fieldId ? '#10b981' : '#8a8a9a', flexShrink: 0, transition: 'all 0.2s' }}
          >
            {copiedField === fieldId ? <Check size={16} /> : <Copy size={16} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Input Section */}
      <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <textarea
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t('inputPlaceholder')}
          style={{
            width: '100%',
            minHeight: '100px',
            background: '#0a0a0f',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            color: '#f0f0f5',
            fontSize: '15px',
            fontFamily: 'monospace',
            resize: 'vertical',
            outline: 'none',
            lineHeight: '1.5'
          }}
        />
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={encodeUrl} style={{ flex: 1 }}>{t('encodeBtn')}</Button>
          <Button variant="secondary" onClick={decodeUrl} style={{ flex: 1 }}>{t('decodeBtn')}</Button>
        </div>
      </div>

      {/* Output Section */}
      {parsed && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}
        >
          {renderField(t('protocol'), parsed.protocol.replace(':', ''), <LinkIcon size={16} color="#3b82f6" />, 'protocol')}
          {renderField(t('host'), parsed.hostname, <Globe size={16} color="#10b981" />, 'host')}
          {renderField(t('port'), parsed.port || (parsed.protocol === 'https:' ? '443' : parsed.protocol === 'http:' ? '80' : ''), <Hash size={16} color="#f59e0b" />, 'port')}
          {renderField(t('path'), parsed.pathname, <List size={16} color="#8b5cf6" />, 'path')}
          {renderField(t('hash'), parsed.hash, <Hash size={16} color="#ec4899" />, 'hash')}
          
          <div style={{ gridColumn: '1 / -1', background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8a8a9a', fontSize: '13px', fontWeight: 500 }}>
              <Key size={16} color="#f43f5e" />
              {t('query')}
            </div>
            {Array.from(parsed.searchParams.entries()).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array.from(parsed.searchParams.entries()).map(([key, val], idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', background: '#0a0a0f', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ flex: 1, color: '#f0f0f5', fontWeight: 500, fontFamily: 'monospace' }}>{key}</div>
                    <div style={{ flex: 2, color: '#8a8a9a', wordBreak: 'break-all', fontFamily: 'monospace' }}>{val}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#55556a', fontSize: '15px', fontFamily: 'monospace' }}>None</div>
            )}
          </div>

        </motion.div>
      )}
    </div>
  );
}
