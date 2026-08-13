"use client";
import React, { useState, useEffect } from 'react';

export default function EncoderWidget({ locale }: { locale: string }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'base64'|'url'|'html'>('base64');
  const [action, setAction] = useState<'encode'|'decode'>('encode');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setError('');
      if (!input) {
        setOutput('');
        return;
      }
      
      if (mode === 'base64') {
        setOutput(action === 'encode' ? btoa(input) : atob(input));
      } else if (mode === 'url') {
        setOutput(action === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input));
      } else if (mode === 'html') {
        if (action === 'encode') {
          const div = document.createElement('div');
          div.textContent = input;
          setOutput(div.innerHTML);
        } else {
          const txt = document.createElement('textarea');
          txt.innerHTML = input;
          setOutput(txt.value);
        }
      }
    } catch (e: any) {
      setError(locale === 'fr' ? 'Entrée invalide pour ce format' : 'Invalid input for this format');
      setOutput('');
    }
  }, [input, mode, action, locale]);

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg">
      <div className="flex gap-2 mb-4 border-b border-[var(--border-subtle)] pb-2">
        {['base64', 'url', 'html'].map(m => (
          <button 
            key={m} 
            onClick={() => setMode(m as any)}
            className={`px-3 py-1.5 rounded-md text-sm capitalize ${mode === m ? 'bg-[var(--accent-devsec)] text-white' : 'hover:bg-[var(--border-subtle)]'}`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" checked={action === 'encode'} onChange={() => setAction('encode')} className="text-[var(--accent-devsec)]" /> Encode
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" checked={action === 'decode'} onChange={() => setAction('decode')} className="text-[var(--accent-devsec)]" /> Decode
        </label>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={locale === 'fr' ? 'Saisir le texte ici...' : 'Enter text here...'}
          className="flex-1 min-h-[150px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-devsec)]"
        />
        <div className="flex-1 relative">
          <textarea
            readOnly
            value={error || output}
            className={`w-full h-full min-h-[150px] bg-[var(--bg-elevated)] border rounded-lg p-3 text-sm focus:outline-none ${error ? 'border-red-500 text-red-500' : 'border-[var(--border-subtle)]'}`}
          />
          {!error && output && (
            <button 
              onClick={() => navigator.clipboard.writeText(output).catch(() => {})}
              className="absolute top-2 right-2 px-2 py-1 bg-[var(--border-subtle)] rounded text-xs hover:bg-[var(--accent-devsec)] hover:text-white transition-colors"
            >
              Copy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
