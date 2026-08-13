'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, AlertCircle, Shield, FileJson, Hash } from 'lucide-react';

export default function JwtDecoderWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.jwt');
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<{ header: any; payload: any; signature: string } | null>(null);
  const [error, setError] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const decodeJwt = (token: string) => {
    setInput(token);
    if (!token.trim()) {
      setDecoded(null);
      setError(false);
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT');

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const signature = parts[2];

      setDecoded({ header, payload, signature });
      setError(false);
    } catch (err) {
      setDecoded(null);
      setError(true);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Input Section */}
      <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield style={{ color: '#10b981', width: '20px', height: '20px' }} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500, color: '#f0f0f5' }}>JSON Web Token</h3>
        </div>
        <div style={{ padding: '24px' }}>
          <textarea
            value={input}
            onChange={(e) => decodeJwt(e.target.value)}
            placeholder={t('inputPlaceholder')}
            style={{
              width: '100%',
              minHeight: '150px',
              background: '#0a0a0f',
              border: `1px solid ${error ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '8px',
              padding: '16px',
              color: error ? '#ef4444' : '#f0f0f5',
              fontSize: '14px',
              fontFamily: 'monospace',
              resize: 'vertical',
              outline: 'none',
              lineHeight: '1.5'
            }}
          />
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}
              >
                <AlertCircle style={{ width: '16px', height: '16px' }} />
                {t('invalidToken')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Decoded Output */}
      {decoded && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'grid', gap: '24px' }}
        >
          {/* Header */}
          <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', background: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Hash style={{ color: '#ef4444', width: '20px', height: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500, color: '#ef4444' }}>{t('headerLabel')}</h3>
              </div>
              <button
                onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2), 'header')}
                style={{ background: 'transparent', border: 'none', color: '#8a8a9a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
              >
                {copiedSection === 'header' ? <Check style={{ color: '#10b981', width: '16px', height: '16px' }} /> : <Copy style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
            <pre style={{ margin: 0, padding: '24px', background: '#0a0a0f', color: '#ef4444', fontSize: '14px', overflowX: 'auto' }}>
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', background: 'rgba(168, 85, 247, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileJson style={{ color: '#a855f7', width: '20px', height: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500, color: '#a855f7' }}>{t('payloadLabel')}</h3>
              </div>
              <button
                onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2), 'payload')}
                style={{ background: 'transparent', border: 'none', color: '#8a8a9a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
              >
                {copiedSection === 'payload' ? <Check style={{ color: '#10b981', width: '16px', height: '16px' }} /> : <Copy style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
            <pre style={{ margin: 0, padding: '24px', background: '#0a0a0f', color: '#a855f7', fontSize: '14px', overflowX: 'auto' }}>
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>

          {/* Signature */}
          <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', background: 'rgba(59, 130, 246, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield style={{ color: '#3b82f6', width: '20px', height: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500, color: '#3b82f6' }}>{t('signatureLabel')}</h3>
              </div>
              <button
                onClick={() => copyToClipboard(decoded.signature, 'signature')}
                style={{ background: 'transparent', border: 'none', color: '#8a8a9a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
              >
                {copiedSection === 'signature' ? <Check style={{ color: '#10b981', width: '16px', height: '16px' }} /> : <Copy style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
            <div style={{ padding: '24px', background: '#0a0a0f', color: '#3b82f6', fontSize: '14px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {decoded.signature}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
