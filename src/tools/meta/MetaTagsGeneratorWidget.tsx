'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Type, FileText, Tag, Image as ImageIcon, Code } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MetaTagsGeneratorWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.meta');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    image: '',
  });
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const metaCode = `<!-- Primary Meta Tags -->
<title>${formData.title || 'Page Title'}</title>
<meta name="title" content="${formData.title}">
<meta name="description" content="${formData.description}">
${formData.keywords ? `<meta name="keywords" content="${formData.keywords}">\n` : ''}
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://example.com/">
<meta property="og:title" content="${formData.title}">
<meta property="og:description" content="${formData.description}">
${formData.image ? `<meta property="og:image" content="${formData.image}">\n` : ''}
<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://example.com/">
<meta property="twitter:title" content="${formData.title}">
<meta property="twitter:description" content="${formData.description}">
${formData.image ? `<meta property="twitter:image" content="${formData.image}">` : ''}`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(metaCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  const InputField = ({ label, icon, value, onChange, placeholder, maxLength }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ display: 'flex', justifyContent: 'space-between', color: '#8a8a9a', fontSize: '14px', fontWeight: 500 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{icon} {label}</span>
        {maxLength && <span style={{ color: value.length > maxLength ? '#ef4444' : '#55556a' }}>{value.length} / {maxLength}</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '12px 16px', background: '#0a0a0f', border: `1px solid ${maxLength && value.length > maxLength ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '8px', color: '#f0f0f5', fontSize: '15px', outline: 'none'
        }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      
      {/* Editor Panel */}
      <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <InputField label={t('titleLabel')} icon={<Type size={16} />} value={formData.title} onChange={(v: string) => setFormData({ ...formData, title: v })} placeholder="Best Meta Tags Tool..." maxLength={60} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', color: '#8a8a9a', fontSize: '14px', fontWeight: 500 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> {t('descLabel')}</span>
            <span style={{ color: formData.description.length > 155 ? '#ef4444' : '#55556a' }}>{formData.description.length} / 155</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="A compelling description for search engines..."
            style={{ width: '100%', minHeight: '100px', padding: '12px 16px', background: '#0a0a0f', border: `1px solid ${formData.description.length > 155 ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: '#f0f0f5', fontSize: '15px', outline: 'none', resize: 'vertical' }}
          />
        </div>

        <InputField label={t('keywordsLabel')} icon={<Tag size={16} />} value={formData.keywords} onChange={(v: string) => setFormData({ ...formData, keywords: v })} placeholder="seo, meta tags, tool..." />
        <InputField label={t('imageLabel')} icon={<ImageIcon size={16} />} value={formData.image} onChange={(v: string) => setFormData({ ...formData, image: v })} placeholder="https://example.com/image.jpg" />

        <Button variant="primary" onClick={() => setShowCode(true)} style={{ marginTop: '8px', background: '#c9a96e', color: '#000' }}>
          {t('generateBtn')}
        </Button>
      </div>

      {/* Output Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Google SERP Preview */}
        <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#f0f0f5', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>Google Preview</h3>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ color: '#202124', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', background: '#f1f3f4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🌐</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ lineHeight: '1' }}>Website Name</span>
                <span style={{ fontSize: '12px', color: '#4d5156' }}>https://example.com/</span>
              </div>
            </div>
            <div style={{ color: '#1a0dab', fontSize: '20px', fontWeight: 400, marginTop: '8px', wordBreak: 'break-word', lineHeight: '1.3' }}>
              {formData.title || 'Page Title Displayed in Search Results'}
            </div>
            <div style={{ color: '#4d5156', fontSize: '14px', lineHeight: '1.58', marginTop: '4px', wordBreak: 'break-word' }}>
              {formData.description || 'This is the meta description that will be shown in search results. It should be concise and compelling.'}
            </div>
          </div>
        </div>

        {/* Code Output */}
        <AnimatePresence>
          {showCode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c9a96e', fontWeight: 500 }}><Code size={16} /> {t('codeLabel')}</span>
                <button onClick={copyCode} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '6px 12px', borderRadius: '6px', color: copied ? '#10b981' : '#f0f0f5', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />} {t('copyCode')}
                </button>
              </div>
              <pre style={{ margin: 0, padding: '16px', background: '#0a0a0f', color: '#f0f0f5', fontSize: '13px', overflowX: 'auto' }}>
                {metaCode}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
