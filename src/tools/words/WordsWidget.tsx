"use client";
import React, { useState } from 'react';

export default function WordsWidget({ locale }: { locale: string }) {
  const [text, setText] = useState('');
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const paraCount = text.split(/\n+/).filter(p => p.trim().length > 0).length;
  
  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg max-w-3xl mx-auto border border-[var(--border-subtle)] shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {[ { l: 'Words', v: wordCount }, { l: 'Chars', v: text.length }, { l: 'No Spaces', v: text.replace(/\s+/g, '').length }, { l: 'Paragraphs', v: paraCount }, { l: 'Read Time', v: `${Math.ceil(wordCount / 200)}m` }].map(s => (
          <div key={s.l} className="p-3 border rounded-lg bg-[var(--bg-base)] border-[var(--border-subtle)] text-center">
            <div className="text-xl font-bold text-[var(--text-primary)]">{s.v}</div>
            <div className="text-xs text-[var(--text-muted)] uppercase">{s.l}</div>
          </div>
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here..." className="w-full min-h-[300px] p-4 border rounded-lg bg-[var(--bg-base)] border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-productivity)] resize-y text-[var(--text-primary)]" />
    </div>
  );
}
