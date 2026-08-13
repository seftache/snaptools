"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function UtmBuilderWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.utm');

  const [url, setUrl] = useState('');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!url) {
      setGeneratedUrl('');
      return;
    }

    try {
      let finalUrl = url;
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }
      const urlObj = new URL(finalUrl);
      if (source) urlObj.searchParams.set('utm_source', source);
      if (medium) urlObj.searchParams.set('utm_medium', medium);
      if (campaign) urlObj.searchParams.set('utm_campaign', campaign);
      if (term) urlObj.searchParams.set('utm_term', term);
      if (content) urlObj.searchParams.set('utm_content', content);
      
      setGeneratedUrl(urlObj.toString());
    } catch (e) {
      // Invalid URL base, just append manually
      const params = new URLSearchParams();
      if (source) params.set('utm_source', source);
      if (medium) params.set('utm_medium', medium);
      if (campaign) params.set('utm_campaign', campaign);
      if (term) params.set('utm_term', term);
      if (content) params.set('utm_content', content);
      
      const queryStr = params.toString();
      if (queryStr) {
        setGeneratedUrl(`${url}${url.includes('?') ? '&' : '?'}${queryStr}`);
      } else {
        setGeneratedUrl(url);
      }
    }
  }, [url, source, medium, campaign, term, content]);

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[800px] mx-auto p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 opacity-80">{t('urlLabel') || 'Website URL *'}</label>
          <input 
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent-productivity)] focus:ring-1 focus:ring-[var(--accent-productivity)] transition-all"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">{t('sourceLabel') || 'Campaign Source (utm_source)'}</label>
            <input 
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. google, newsletter, facebook"
              className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent-productivity)] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">{t('mediumLabel') || 'Campaign Medium (utm_medium)'}</label>
            <input 
              type="text"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="e.g. cpc, banner, email"
              className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent-productivity)] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 opacity-80">{t('campaignLabel') || 'Campaign Name (utm_campaign)'}</label>
          <input 
            type="text"
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            placeholder="e.g. summer_sale, promo_code"
            className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent-productivity)] transition-all"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">{t('termLabel') || 'Campaign Term (utm_term)'}</label>
            <input 
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. running+shoes"
              className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent-productivity)] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">{t('contentLabel') || 'Campaign Content (utm_content)'}</label>
            <input 
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. logolink, textlink"
              className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent-productivity)] transition-all"
            />
          </div>
        </div>
      </div>

      {generatedUrl && (
        <div className="mt-8 p-5 bg-black/60 border border-white/10 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-productivity)]"></div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--accent-productivity)] mb-3">{t('resultTitle') || 'Generated UTM URL'}</h3>
          
          <div className="break-all font-mono text-sm leading-relaxed text-white/90 bg-black/40 p-4 rounded-lg border border-white/5 mb-4">
            {generatedUrl}
          </div>
          
          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300"
            style={{
              background: copied ? 'var(--accent-success, #10b981)' : 'var(--accent-productivity)',
              color: '#0a0a0a',
            }}
          >
            {copied ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {t('copied') || 'Copied!'}
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                {t('copyBtn') || 'Copy URL'}
              </>
            )}
          </button>
        </div>
      )}
      
    </div>
  );
}
