"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Copy, Check, Sparkles, User, Briefcase, 
  Phone, Globe, MapPin, Palette, Image as ImageIcon, Download 
} from 'lucide-react';

type TemplateStyle = 'modern' | 'corporate' | 'bordered' | 'minimal';

export default function EmailSignatureWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';

  const [fullName, setFullName] = useState('Alexandre Martin');
  const [jobTitle, setJobTitle] = useState('Directeur Général');
  const [company, setCompany] = useState('SnapTools Inc.');
  const [phone, setPhone] = useState('+33 6 12 34 56 78');
  const [email, setEmail] = useState('alexandre@snaptools.store');
  const [website, setWebsite] = useState('https://snaptools.store');
  const [address, setAddress] = useState('Paris, France');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  // Social Links
  const [linkedin, setLinkedin] = useState('https://linkedin.com');
  const [twitter, setTwitter] = useState('https://x.com');
  const [instagram, setInstagram] = useState('');

  // Styles
  const [template, setTemplate] = useState<TemplateStyle>('modern');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [copiedRich, setCopiedRich] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Generate Email-Compatible HTML Table
  const generateSignatureHtml = () => {
    const avatarHtml = avatarUrl
      ? `<td style="vertical-align: middle; padding-right: 18px;">
          <img src="${avatarUrl}" alt="${fullName}" width="70" height="70" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; display: block; border: 2px solid ${primaryColor};" />
        </td>`
      : '';

    const socialsHtml = `
      <div style="margin-top: 8px; font-size: 11px;">
        ${linkedin ? `<a href="${linkedin}" style="color: ${primaryColor}; text-decoration: none; font-weight: bold; margin-right: 10px;">LinkedIn</a>` : ''}
        ${twitter ? `<a href="${twitter}" style="color: ${primaryColor}; text-decoration: none; font-weight: bold; margin-right: 10px;">Twitter/X</a>` : ''}
        ${instagram ? `<a href="${instagram}" style="color: ${primaryColor}; text-decoration: none; font-weight: bold;">Instagram</a>` : ''}
      </div>
    `;

    if (template === 'bordered') {
      return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #334155; line-height: 1.4; max-width: 500px; border-left: 4px solid ${primaryColor}; padding-left: 16px;">
  <tr>
    ${avatarHtml}
    <td style="vertical-align: middle;">
      <div style="font-size: 16px; font-weight: bold; color: #0f172a; letter-spacing: -0.2px;">${fullName}</div>
      <div style="font-size: 12px; color: ${primaryColor}; font-weight: 600; margin-top: 1px;">${jobTitle} ${company ? `• ${company}` : ''}</div>
      <div style="margin-top: 6px; font-size: 12px; color: #64748b;">
        ${phone ? `<div><span style="color: #94a3b8;">Tél :</span> <a href="tel:${phone}" style="color: #334155; text-decoration: none;">${phone}</a></div>` : ''}
        ${email ? `<div><span style="color: #94a3b8;">Email :</span> <a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none;">${email}</a></div>` : ''}
        ${website ? `<div><span style="color: #94a3b8;">Web :</span> <a href="${website}" style="color: ${primaryColor}; text-decoration: none;">${website.replace(/^https?:\/\//, '')}</a></div>` : ''}
      </div>
      ${socialsHtml}
    </td>
  </tr>
</table>`.trim();
    }

    if (template === 'corporate') {
      return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #334155; line-height: 1.4; max-width: 520px;">
  <tr>
    <td colspan="2" style="border-bottom: 2px solid ${primaryColor}; padding-bottom: 8px; margin-bottom: 8px;">
      <span style="font-size: 17px; font-weight: bold; color: #0f172a;">${fullName}</span>
      <span style="font-size: 13px; color: #64748b; margin-left: 8px;">| ${jobTitle}</span>
    </td>
  </tr>
  <tr>
    <td style="padding-top: 10px; vertical-align: top;">
      <div style="font-weight: bold; color: ${primaryColor}; font-size: 12px;">${company}</div>
      ${phone ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">${phone}</div>` : ''}
      ${email ? `<div style="font-size: 12px; margin-top: 2px;"><a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none;">${email}</a></div>` : ''}
    </td>
    <td style="padding-top: 10px; vertical-align: top; text-align: right;">
      ${website ? `<div style="font-size: 12px;"><a href="${website}" style="color: #334155; text-decoration: none;">${website.replace(/^https?:\/\//, '')}</a></div>` : ''}
      ${address ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${address}</div>` : ''}
      ${socialsHtml}
    </td>
  </tr>
</table>`.trim();
    }

    // Default: Modern Layout
    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #334155; line-height: 1.4; max-width: 500px;">
  <tr>
    ${avatarHtml}
    <td style="vertical-align: middle; padding-left: 14px; border-left: 2px solid #e2e8f0;">
      <div style="font-size: 16px; font-weight: bold; color: #0f172a;">${fullName}</div>
      <div style="font-size: 12px; color: ${primaryColor}; font-weight: 600;">${jobTitle}</div>
      <div style="font-size: 12px; color: #475569; font-weight: 500;">${company}</div>
      <div style="margin-top: 6px; font-size: 12px;">
        ${phone ? `<span style="color: #64748b;">${phone}</span> <span style="color: #cbd5e1;">•</span> ` : ''}
        ${email ? `<a href="mailto:${email}" style="color: ${primaryColor}; text-decoration: none;">${email}</a>` : ''}
      </div>
      ${website ? `<div style="font-size: 11px; margin-top: 2px;"><a href="${website}" style="color: #64748b; text-decoration: none;">${website.replace(/^https?:\/\//, '')}</a></div>` : ''}
      ${socialsHtml}
    </td>
  </tr>
</table>`.trim();
  };

  // Copy Rich HTML into clipboard (so user can directly Paste in Gmail / Outlook)
  const copyRichSignature = async () => {
    const html = generateSignatureHtml();
    try {
      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([`${fullName} - ${jobTitle} at ${company}`], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        }),
      ]);
      setCopiedRich(true);
      setTimeout(() => setCopiedRich(false), 2000);
    } catch {
      // Fallback
      navigator.clipboard.writeText(html);
      setCopiedRich(true);
      setTimeout(() => setCopiedRich(false), 2000);
    }
  };

  const copyRawHtml = () => {
    navigator.clipboard.writeText(generateSignatureHtml());
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {isFr ? 'Générateur de Signature Email Professionnelle' : 'Professional Email Signature Generator'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {isFr
              ? 'Créez une signature HTML élégante avec photo et réseaux sociaux • Compatible Gmail, Outlook & Apple Mail'
              : 'Create beautiful HTML signatures with avatar & socials • 1-click copy for Gmail, Outlook & Apple Mail'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 7 Cols */}
        <div className="lg:col-span-7 space-y-4 text-xs">
          {/* Template & Color Selector */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-300">{isFr ? 'Modèle :' : 'Template:'}</span>
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                {[
                  { id: 'modern' as TemplateStyle, label: 'Moderne' },
                  { id: 'bordered' as TemplateStyle, label: 'Bordure' },
                  { id: 'corporate' as TemplateStyle, label: 'Corporate' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      template === t.id ? 'bg-blue-500 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-300">{isFr ? 'Couleur :' : 'Color:'}</span>
              {['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#0f172a'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPrimaryColor(c)}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    primaryColor === c ? 'scale-110 ring-2 ring-white border-transparent' : 'border-white/20'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Personal & Pro Info */}
          <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-3">
            <span className="font-bold text-sm text-white block">
              {isFr ? 'Informations professionnelles :' : 'Professional details:'}
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 mb-1">{isFr ? 'Nom & Prénom :' : 'Full Name:'}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">{isFr ? 'Poste / Fonction :' : 'Job Title:'}</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 mb-1">{isFr ? 'Entreprise :' : 'Company:'}</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">{isFr ? 'Téléphone :' : 'Phone:'}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 mb-1">{isFr ? 'Email :' : 'Email:'}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">{isFr ? 'Site Web :' : 'Website:'}</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">{isFr ? 'Photo / Logo (Lien ou Import) :' : 'Avatar / Logo:'}</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white text-[11px]"
                />
                <label className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {isFr ? 'Importer' : 'Upload'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview & 1-Click Copy: 5 Cols */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Signature Card Preview */}
          <div className="p-4 rounded-xl bg-black/60 border border-white/10">
            <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              {isFr ? 'Aperçu de votre Signature :' : 'Live Signature Preview:'}
            </span>

            <div
              className="p-5 rounded-xl bg-white shadow-2xl overflow-x-auto min-h-[140px] flex items-center justify-start"
              dangerouslySetInnerHTML={{ __html: generateSignatureHtml() }}
            />

            <p className="text-[11px] text-gray-400 mt-2">
              {isFr
                ? '💡 Cliquez sur "Copier la Signature" puis faites simplement Ctrl+V dans les paramètres Gmail ou Outlook.'
                : '💡 Click "Copy Signature" and paste directly into Gmail or Outlook settings.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={copyRichSignature}
              className="w-full py-3 px-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25"
            >
              {copiedRich ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copiedRich
                ? (isFr ? 'Signature Copiée ! Prête à coller dans Gmail/Outlook' : 'Copied! Ready to paste')
                : (isFr ? 'Copier la Signature (Pour Gmail / Outlook)' : 'Copy Signature (For Gmail/Outlook)')}
            </button>

            <button
              type="button"
              onClick={copyRawHtml}
              className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border border-white/10 transition-all"
            >
              {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedHtml ? (isFr ? 'Code HTML Copié !' : 'HTML Copied!') : (isFr ? 'Copier le Code HTML brut' : 'Copy Raw HTML')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
