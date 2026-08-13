"use client";
import React, { useState, useEffect } from 'react';

export default function RegexTesterWidget({ locale }: { locale: string }) {
  const [pattern, setPattern] = useState('[A-Z]\\w+');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('Hello World, this is a Regex Test!');
  const [error, setError] = useState('');
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);

  useEffect(() => {
    try {
      setError('');
      if (!pattern) {
        setMatches([]);
        return;
      }
      const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      const found = Array.from(text.matchAll(regex));
      setMatches(found);
    } catch (e: any) {
      setError(e.message);
      setMatches([]);
    }
  }, [pattern, flags, text]);

  const toggleFlag = (f: string) => {
    if (flags.includes(f)) {
      setFlags(flags.replace(f, ''));
    } else {
      setFlags(flags + f);
    }
  };

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg">
      <div className="mb-4">
        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">
          {locale === 'fr' ? 'Expression Régulière' : 'Regular Expression'}
        </label>
        <div className="flex bg-[var(--bg-default)] border border-[var(--border-subtle)] rounded-lg focus-within:ring-2 focus-within:ring-[var(--accent-devsec)]">
          <span className="px-3 py-3 text-[var(--text-muted)] bg-[var(--bg-elevated)] rounded-l-lg border-r border-[var(--border-subtle)]">/</span>
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
            className="flex-1 bg-transparent px-3 py-3 focus:outline-none font-mono"
            placeholder="pattern"
          />
          <span className="px-3 py-3 text-[var(--text-muted)] bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)]">/</span>
          <input
            type="text"
            value={flags}
            onChange={e => setFlags(e.target.value)}
            className="w-16 bg-transparent px-3 py-3 focus:outline-none font-mono rounded-r-lg"
            placeholder="flags"
          />
        </div>
        {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      </div>

      <div className="flex gap-2 mb-4">
        {['g', 'i', 'm', 's'].map(f => (
          <button
            key={f}
            onClick={() => toggleFlag(f)}
            className={`px-3 py-1 rounded text-sm font-mono ${flags.includes(f) ? 'bg-[var(--accent-devsec)] text-white' : 'bg-[var(--border-subtle)] text-[var(--text-primary)] hover:opacity-80'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block flex justify-between">
          <span>{locale === 'fr' ? 'Texte de test' : 'Test String'}</span>
          <span>{matches.length} {locale === 'fr' ? 'correspondance(s)' : 'match(es)'}</span>
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full min-h-[120px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-devsec)] font-mono"
        />
      </div>

      <div className="bg-[var(--bg-default)] border border-[var(--border-subtle)] rounded-lg p-4 min-h-[100px]">
        <h3 className="text-sm font-semibold mb-2">{locale === 'fr' ? 'Résultats' : 'Results'}</h3>
        {matches.length > 0 ? (
          <div className="space-y-2">
            {matches.map((m, i) => (
              <div key={i} className="text-sm font-mono break-all p-2 bg-[var(--bg-elevated)] rounded">
                <span className="text-[var(--text-secondary)] mr-2">Match {i + 1}:</span>
                <span className="bg-yellow-500/30 text-yellow-500 px-1 rounded">{m[0]}</span>
                {m.length > 1 && (
                  <div className="mt-1 pl-4 text-xs">
                    {m.slice(1).map((group, j) => (
                      <div key={j}><span className="text-[var(--text-secondary)]">Group {j + 1}:</span> {group || 'undefined'}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[var(--text-muted)] text-sm italic">{locale === 'fr' ? 'Aucune correspondance' : 'No matches'}</div>
        )}
      </div>
    </div>
  );
}
