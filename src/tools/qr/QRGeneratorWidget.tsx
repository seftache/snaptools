"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, Link as LinkIcon, Wifi, User, Mail, 
  MessageSquare, Phone, Coins, Download, Printer, 
  Copy, Check, Sparkles, Sliders, Image as ImageIcon 
} from 'lucide-react';
import QRCode from 'qrcode';

type QRType = 'url' | 'text' | 'wifi' | 'vcard' | 'whatsapp' | 'email' | 'sms' | 'crypto';

export default function QRGeneratorWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [activeType, setActiveType] = useState<QRType>('url');

  // Form Fields
  const [urlInput, setUrlInput] = useState('https://snaptools.store');
  const [textInput, setTextInput] = useState('Bienvenue sur SnapTools !');
  
  // WiFi
  const [wifiSsid, setWifiSsid] = useState('Mon_Reseau_WiFi');
  const [wifiPassword, setWifiPassword] = useState('MotDePasse123');
  const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard
  const [vcardFirst, setVcardFirst] = useState('Jean');
  const [vcardLast, setVcardLast] = useState('Dupont');
  const [vcardPhone, setVcardPhone] = useState('+33 6 12 34 56 78');
  const [vcardEmail, setVcardEmail] = useState('jean.dupont@email.com');
  const [vcardOrg, setVcardOrg] = useState('Entreprise SAS');
  const [vcardTitle, setVcardTitle] = useState('Directeur');
  const [vcardUrl, setVcardUrl] = useState('https://monsite.com');

  // WhatsApp
  const [waPhone, setWaPhone] = useState('2250700000000');
  const [waMessage, setWaMessage] = useState('Bonjour ! Je vous contacte depuis votre QR Code.');

  // Email
  const [emailTo, setEmailTo] = useState('contact@snaptools.store');
  const [emailSubject, setEmailSubject] = useState('Demande de renseignements');
  const [emailBody, setEmailBody] = useState('Bonjour, je souhaite obtenir des informations.');

  // SMS
  const [smsPhone, setSmsPhone] = useState('+33612345678');
  const [smsMessage, setSmsMessage] = useState('Bonjour');

  // Crypto
  const [cryptoType, setCryptoType] = useState<'bitcoin' | 'ethereum' | 'usdt'>('bitcoin');
  const [cryptoAddress, setCryptoAddress] = useState('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq');
  const [cryptoAmount, setCryptoAmount] = useState('');

  // Styles & Options
  const [size, setSize] = useState(320);
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [margin, setMargin] = useState(2);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute final QR payload based on active type
  const getQrPayload = (): string => {
    switch (activeType) {
      case 'url':
        return urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
      case 'text':
        return textInput;
      case 'wifi':
        return `WIFI:T:${wifiType};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardLast};${vcardFirst};;;\nFN:${vcardFirst} ${vcardLast}\nORG:${vcardOrg}\nTITLE:${vcardTitle}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nURL:${vcardUrl}\nEND:VCARD`;
      case 'whatsapp':
        return `https://wa.me/${waPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMessage)}`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'sms':
        return `smsto:${smsPhone}:${smsMessage}`;
      case 'crypto':
        return `${cryptoType}:${cryptoAddress}${cryptoAmount ? `?amount=${cryptoAmount}` : ''}`;
      default:
        return urlInput;
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const payload = getQrPayload();
    if (!payload) return;

    QRCode.toCanvas(
      canvasRef.current,
      payload,
      {
        width: size,
        margin: margin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: level,
      },
      (err) => {
        if (err) console.warn('QR Code generation error:', err);
      }
    );
  }, [
    activeType,
    urlInput,
    textInput,
    wifiSsid,
    wifiPassword,
    wifiType,
    wifiHidden,
    vcardFirst,
    vcardLast,
    vcardPhone,
    vcardEmail,
    vcardOrg,
    vcardTitle,
    vcardUrl,
    waPhone,
    waMessage,
    emailTo,
    emailSubject,
    emailBody,
    smsPhone,
    smsMessage,
    cryptoType,
    cryptoAddress,
    cryptoAmount,
    size,
    level,
    fgColor,
    bgColor,
    margin,
  ]);

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcode-${activeType}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const printQR = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head><title>Impression QR Code - SnapTools</title></head>
          <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <img src="${dataUrl}" style="max-width:80%;max-height:80vh;" onload="window.print();" />
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  const copyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      });
    } catch {}
  };

  const TYPE_TABS = [
    { id: 'url' as QRType, labelFr: 'Lien URL', labelEn: 'URL', icon: LinkIcon },
    { id: 'text' as QRType, labelFr: 'Texte Libre', labelEn: 'Text', icon: MessageSquare },
    { id: 'wifi' as QRType, labelFr: 'Réseau WiFi', labelEn: 'WiFi', icon: Wifi },
    { id: 'vcard' as QRType, labelFr: 'Carte vCard', labelEn: 'vCard Contact', icon: User },
    { id: 'whatsapp' as QRType, labelFr: 'WhatsApp', labelEn: 'WhatsApp', icon: Phone },
    { id: 'email' as QRType, labelFr: 'Email', labelEn: 'Email', icon: Mail },
    { id: 'sms' as QRType, labelFr: 'SMS', labelEn: 'SMS', icon: MessageSquare },
    { id: 'crypto' as QRType, labelFr: 'Crypto', labelEn: 'Crypto', icon: Coins },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
          <QrCode className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {isFr ? 'Générateur de QR Code Personnalisé Pro' : 'Pro Custom QR Code Generator'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {isFr
              ? 'Créez des QR Codes pour URL, WiFi, Carte de visite vCard, WhatsApp, Email, Crypto & SMS'
              : 'Generate custom QR codes for URLs, WiFi networks, vCard, WhatsApp, Emails & Crypto'}
          </p>
        </div>
      </div>

      {/* Type Selector Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
        {TYPE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveType(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all ${
                isActive
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {isFr ? tab.labelFr : tab.labelEn}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Form Inputs & Customization */}
        <div className="md:col-span-2 space-y-4">
          {/* Dynamic Content Inputs */}
          <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-3 text-xs">
            <span className="font-bold text-sm text-white block mb-1">
              {isFr ? 'Contenu du QR Code :' : 'QR Code Content:'}
            </span>

            {/* URL */}
            {activeType === 'url' && (
              <div>
                <label className="block text-gray-300 mb-1">{isFr ? 'Lien du site web :' : 'Website URL:'}</label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://votresite.com"
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white"
                />
              </div>
            )}

            {/* Text */}
            {activeType === 'text' && (
              <div>
                <label className="block text-gray-300 mb-1">{isFr ? 'Texte à encoder :' : 'Text content:'}</label>
                <textarea
                  rows={3}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white"
                />
              </div>
            )}

            {/* WiFi */}
            {activeType === 'wifi' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-300 mb-1">{isFr ? 'Nom du réseau (SSID) :' : 'Network Name (SSID):'}</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1">{isFr ? 'Mot de passe :' : 'Password:'}</label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">{isFr ? 'Sécurité :' : 'Security:'}</label>
                    <select
                      value={wifiType}
                      onChange={(e) => setWifiType(e.target.value as any)}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white font-medium"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">{isFr ? 'Aucun mot de passe' : 'No password'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* vCard */}
            {activeType === 'vcard' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1">{isFr ? 'Prénom :' : 'First Name:'}</label>
                    <input
                      type="text"
                      value={vcardFirst}
                      onChange={(e) => setVcardFirst(e.target.value)}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">{isFr ? 'Nom :' : 'Last Name:'}</label>
                    <input
                      type="text"
                      value={vcardLast}
                      onChange={(e) => setVcardLast(e.target.value)}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1">{isFr ? 'Téléphone :' : 'Phone:'}</label>
                    <input
                      type="tel"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">{isFr ? 'Email :' : 'Email:'}</label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1">{isFr ? 'Entreprise :' : 'Company:'}</label>
                    <input
                      type="text"
                      value={vcardOrg}
                      onChange={(e) => setVcardOrg(e.target.value)}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">{isFr ? 'Poste / Titre :' : 'Job Title:'}</label>
                    <input
                      type="text"
                      value={vcardTitle}
                      onChange={(e) => setVcardTitle(e.target.value)}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp */}
            {activeType === 'whatsapp' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-300 mb-1">
                    {isFr ? 'Numéro WhatsApp (avec indicatif pays, sans +) :' : 'WhatsApp Phone (with country code):'}
                  </label>
                  <input
                    type="text"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="2250700000000 ou 33612345678"
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">{isFr ? 'Message prérempli :' : 'Pre-filled Message:'}</label>
                  <textarea
                    rows={2}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            {activeType === 'email' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-300 mb-1">{isFr ? 'Adresse Email :' : 'Email Address:'}</label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">{isFr ? 'Objet du message :' : 'Subject:'}</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2 text-white"
                  />
                </div>
              </div>
            )}

            {/* Crypto */}
            {activeType === 'crypto' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1">{isFr ? 'Cryptomonnaie :' : 'Cryptocurrency:'}</label>
                    <select
                      value={cryptoType}
                      onChange={(e) => setCryptoType(e.target.value as any)}
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white font-medium"
                    >
                      <option value="bitcoin">Bitcoin (BTC)</option>
                      <option value="ethereum">Ethereum (ETH)</option>
                      <option value="usdt">Tether (USDT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">{isFr ? 'Montant (facultatif) :' : 'Amount (optional):'}</label>
                    <input
                      type="text"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value)}
                      placeholder="0.05"
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">{isFr ? 'Adresse du portefeuille :' : 'Wallet Address:'}</label>
                  <input
                    type="text"
                    value={cryptoAddress}
                    onChange={(e) => setCryptoAddress(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Design & Colors Toolbar */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-300 mb-1">{isFr ? 'Couleur QR :' : 'QR Color:'}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-white/20 cursor-pointer bg-transparent"
                />
                <span className="font-mono text-gray-400">{fgColor}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-300 mb-1">{isFr ? 'Couleur Fond :' : 'Background:'}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-white/20 cursor-pointer bg-transparent"
                />
                <span className="font-mono text-gray-400">{bgColor}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-300 mb-1">{isFr ? 'Correction :' : 'Error Level:'}</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-2 text-white font-medium"
              >
                <option value="L">L (7% - Rapide)</option>
                <option value="M">M (15% - Standard)</option>
                <option value="Q">Q (25% - Élevée)</option>
                <option value="H">H (30% - Haute qualité)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-300 mb-1">{isFr ? 'Marge blanche :' : 'Margin:'}</label>
              <input
                type="range"
                min="0"
                max="6"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-purple-500 mt-2"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Live QR Preview & Actions */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/60 border border-white/10 space-y-4">
          <span className="text-xs font-semibold text-gray-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            {isFr ? 'Aperçu en Direct' : 'Live Preview'}
          </span>

          <div className="p-3 rounded-2xl bg-white shadow-2xl flex items-center justify-center">
            <canvas ref={canvasRef} className="rounded-lg max-w-full" />
          </div>

          <div className="w-full space-y-2 pt-2">
            <button
              type="button"
              onClick={downloadPNG}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-500/25"
            >
              <Download className="w-3.5 h-3.5" />
              {isFr ? 'Télécharger le QR Code PNG' : 'Download PNG'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={printQR}
                className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1 border border-white/10 transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-purple-400" />
                {isFr ? 'Imprimer' : 'Print'}
              </button>

              <button
                type="button"
                onClick={copyImage}
                className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1 border border-white/10 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? (isFr ? 'Copié !' : 'Copied!') : (isFr ? 'Copier' : 'Copy')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
