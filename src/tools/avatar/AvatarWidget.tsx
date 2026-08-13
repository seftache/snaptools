"use client";
import React, { useState } from 'react';

const STYLES = ['bottts', 'avataaars', 'identicon', 'micah', 'pixel-art', 'lorelei'];

export default function AvatarWidget({ locale }: { locale: string }) {
  const [seed, setSeed] = useState('Snappy');
  const [style, setStyle] = useState('bottts');

  const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(avatarUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${style}-${seed}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg flex flex-col gap-4 max-w-md mx-auto border border-[var(--border-subtle)] shadow-sm">
      <div className="flex justify-center bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl p-8">
        <img src={avatarUrl} alt="Avatar Preview" className="w-48 h-48 rounded-lg drop-shadow-lg" />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <label className="text-sm font-medium text-[var(--text-muted)]">{locale === 'fr' ? 'Graine (Texte)' : 'Seed (Text)'}</label>
        <input
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-media)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-muted)]">{locale === 'fr' ? 'Style' : 'Style'}</label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-media)]"
        >
          {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <button onClick={handleDownload} className="mt-4 w-full px-5 py-3 rounded-lg font-medium text-sm bg-[var(--accent-media)] text-white hover:opacity-90 transition-all">
        {locale === 'fr' ? 'Télécharger SVG' : 'Download SVG'}
      </button>
    </div>
  );
}
