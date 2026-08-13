"use client";
import React, { useState } from 'react';

export default function JSONFormatterWidget({ locale }: { locale: string }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);

  const format = () => {
    try {
      setError('');
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };

  const minify = () => {
    try {
      setError('');
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output).catch(() => {});
  };

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {locale === 'fr' ? 'Entrée' : 'Input'}
        </label>
        <textarea
          className="flex-1 min-h-[300px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-devsec)]"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='{"example": "data"}'
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <select 
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm"
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
          </select>
          <button onClick={format} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
            {locale === 'fr' ? 'Formater' : 'Format'}
          </button>
          <button onClick={minify} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
            Minify
          </button>
          <button onClick={() => setInput('')} className="px-4 py-2 border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)] rounded-lg text-sm transition-colors">
            {locale === 'fr' ? 'Effacer' : 'Clear'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-secondary)] flex justify-between items-center">
          {locale === 'fr' ? 'Sortie' : 'Output'}
          {output && (
            <button onClick={copy} className="text-xs text-blue-500 hover:underline">
              {locale === 'fr' ? 'Copier' : 'Copy'}
            </button>
          )}
        </label>
        <div className={`flex-1 min-h-[300px] rounded-lg border p-3 overflow-auto font-mono text-sm whitespace-pre-wrap ${error ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'}`}>
          {error || output}
        </div>
      </div>
    </div>
  );
}
