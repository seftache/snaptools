"use client";
import React, { useState, useEffect, useCallback } from 'react';

export default function PasswordGenWidget({ locale }: { locale: string }) {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });

  const generate = useCallback(() => {
    const chars = {
      upper: options.excludeAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lower: options.excludeAmbiguous ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz',
      numbers: options.excludeAmbiguous ? '23456789' : '0123456789',
      symbols: options.excludeAmbiguous ? '!@#$%^&*-_+=?' : '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    let pool = '';
    if (options.upper) pool += chars.upper;
    if (options.lower) pool += chars.lower;
    if (options.numbers) pool += chars.numbers;
    if (options.symbols) pool += chars.symbols;

    if (!pool) {
      setPassword('');
      return;
    }

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += pool[array[i] % pool.length];
    }
    setPassword(result);
  }, [length, options]);

  useEffect(() => {
    generate();
  }, [generate]);

  const copy = () => navigator.clipboard.writeText(password).catch(() => {});

  const getStrength = () => {
    let score = 0;
    if (length > 8) score++;
    if (length > 12) score++;
    if (options.upper) score++;
    if (options.numbers) score++;
    if (options.symbols) score++;
    return score;
  };

  const strength = getStrength();
  const strengthColor = ['bg-red-500', 'bg-red-400', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-500'][strength];
  const strengthLabels = locale === 'fr' 
    ? ['Très faible', 'Faible', 'Moyen', 'Bon', 'Fort', 'Très fort'] 
    : ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg max-w-md mx-auto">
      <div className="flex mb-4">
        <input 
          type="text" 
          readOnly 
          value={password}
          className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-l-lg px-4 py-3 font-mono text-[var(--text-primary)] focus:outline-none"
        />
        <button onClick={copy} className="bg-[var(--accent-devsec)] text-white px-4 py-3 rounded-r-lg hover:opacity-90 transition-opacity">
          {locale === 'fr' ? 'Copier' : 'Copy'}
        </button>
      </div>

      <div className="mb-4">
        <div className="flex gap-1 h-1.5 w-full mb-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex-1 rounded-full ${i < strength ? strengthColor : 'bg-[var(--border-subtle)]'}`} />
          ))}
        </div>
        <div className="text-xs text-right font-medium text-[var(--text-secondary)]">{strengthLabels[strength]}</div>
      </div>

      <div className="mb-4">
        <label className="flex justify-between text-sm font-medium text-[var(--text-secondary)] mb-2">
          <span>{locale === 'fr' ? 'Longueur' : 'Length'}</span>
          <span>{length}</span>
        </label>
        <input 
          type="range" min="8" max="128" value={length} 
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-[var(--accent-devsec)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {Object.entries({
          upper: locale === 'fr' ? 'Majuscules' : 'Uppercase',
          lower: locale === 'fr' ? 'Minuscules' : 'Lowercase',
          numbers: locale === 'fr' ? 'Chiffres' : 'Numbers',
          symbols: locale === 'fr' ? 'Symboles' : 'Symbols',
          excludeAmbiguous: locale === 'fr' ? 'Sans ambigus' : 'No ambiguous'
        }).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
            <input 
              type="checkbox" 
              checked={options[key as keyof typeof options]}
              onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
              className="rounded border-[var(--border-subtle)] text-[var(--accent-devsec)] focus:ring-[var(--accent-devsec)] bg-[var(--bg-elevated)] cursor-pointer"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <button onClick={generate} className="w-full py-3 bg-[var(--border-subtle)] hover:bg-[var(--border-subtle)]/80 text-[var(--text-primary)] rounded-lg font-medium transition-colors">
        {locale === 'fr' ? 'Générer un nouveau mot de passe' : 'Generate New Password'}
      </button>
    </div>
  );
}
