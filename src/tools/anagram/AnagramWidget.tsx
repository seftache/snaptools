"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EN_DICTIONARY, FR_DICTIONARY } from './wordlists';

interface AnagramWidgetProps {
  locale: string;
}

type SolverMode = 'all_subwords' | 'exact_only';
type SortOption = 'points_desc' | 'length_desc' | 'alpha_asc';

// Scrabble Point Values
const EN_SCORES: Record<string, number> = {
  a: 1, e: 1, i: 1, o: 1, u: 1, l: 1, n: 1, s: 1, t: 1, r: 1,
  d: 2, g: 2,
  b: 3, c: 3, m: 3, p: 3,
  f: 4, h: 4, v: 4, w: 4, y: 4,
  k: 5,
  j: 8, x: 8,
  q: 10, z: 10,
};

const FR_SCORES: Record<string, number> = {
  e: 1, a: 1, i: 1, n: 1, o: 1, r: 1, s: 1, t: 1, u: 1, l: 1,
  d: 2, m: 2, g: 2,
  b: 3, c: 3, p: 3,
  f: 4, h: 4, v: 4,
  j: 8, q: 8,
  k: 10, w: 10, x: 10, y: 10, z: 10,
};

function calculateWordScore(word: string, isFr: boolean): number {
  const scores = isFr ? FR_SCORES : EN_SCORES;
  const clean = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let sum = 0;
  for (const char of clean) {
    sum += scores[char] || 1;
  }
  return sum;
}

export default function AnagramWidget({ locale }: AnagramWidgetProps) {
  const isFr = locale === 'fr';

  // State
  const [inputLetters, setInputLetters] = useState<string>('listen');
  const [dictLang, setDictLang] = useState<'en' | 'fr'>(isFr ? 'fr' : 'en');
  const [mode, setMode] = useState<SolverMode>('all_subwords');
  const [minLength, setMinLength] = useState<number>(2);
  const [startsWith, setStartsWith] = useState<string>('');
  const [contains, setContains] = useState<string>('');
  const [endsWith, setEndsWith] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('length_desc');
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [copiedGroup, setCopiedGroup] = useState<number | null>(null);

  // Quick Preset Samples
  const PRESETS = [
    { label: 'listen', lang: 'en' },
    { label: 'cinema', lang: 'en' },
    { label: 'creative', lang: 'en' },
    { label: 'algorithm', lang: 'en' },
    { label: 'maison', lang: 'fr' },
    { label: 'paris', lang: 'fr' },
    { label: 'artisan', lang: 'fr' },
    { label: 'voyage', lang: 'fr' },
  ];

  // Solver Algorithm
  const results = useMemo(() => {
    const rawInput = inputLetters.toLowerCase().trim().replace(/[^a-z?*]/g, '');
    if (!rawInput) return [];

    const dictionary = dictLang === 'fr' ? FR_DICTIONARY : EN_DICTIONARY;
    const isTargetFr = dictLang === 'fr';

    // Count available letters and wildcards
    const availableCounts: Record<string, number> = {};
    let wildcards = 0;

    for (const char of rawInput) {
      if (char === '?' || char === '*') {
        wildcards++;
      } else {
        availableCounts[char] = (availableCounts[char] || 0) + 1;
      }
    }

    const inputLen = rawInput.length;
    const matchedWords: Array<{ word: string; length: number; points: number }> = [];

    const startsFilter = startsWith.toLowerCase().trim();
    const containsFilter = contains.toLowerCase().trim();
    const endsFilter = endsWith.toLowerCase().trim();

    for (const candidate of dictionary) {
      const candidateNorm = candidate.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const candLen = candidateNorm.length;

      // Length rules
      if (mode === 'exact_only' && candLen !== inputLen) continue;
      if (candLen < minLength || candLen > inputLen) continue;

      // Prefix / Contains / Suffix filters
      if (startsFilter && !candidateNorm.startsWith(startsFilter)) continue;
      if (containsFilter && !candidateNorm.includes(containsFilter)) continue;
      if (endsFilter && !candidateNorm.endsWith(endsFilter)) continue;

      // Check letter availability
      const neededCounts: Record<string, number> = {};
      for (const ch of candidateNorm) {
        neededCounts[ch] = (neededCounts[ch] || 0) + 1;
      }

      let missingLetters = 0;
      let possible = true;

      for (const ch in neededCounts) {
        const needed = neededCounts[ch];
        const have = availableCounts[ch] || 0;
        if (have < needed) {
          missingLetters += needed - have;
          if (missingLetters > wildcards) {
            possible = false;
            break;
          }
        }
      }

      if (possible) {
        matchedWords.push({
          word: candidate,
          length: candLen,
          points: calculateWordScore(candidate, isTargetFr),
        });
      }
    }

    // Sort results
    matchedWords.sort((a, b) => {
      if (sortBy === 'points_desc') {
        return b.points - a.points || b.length - a.length || a.word.localeCompare(b.word);
      }
      if (sortBy === 'length_desc') {
        return b.length - a.length || b.points - a.points || a.word.localeCompare(b.word);
      }
      return a.word.localeCompare(b.word);
    });

    return matchedWords;
  }, [inputLetters, dictLang, mode, minLength, startsWith, contains, endsWith, sortBy]);

  // Group matched words by length
  const groupedResults = useMemo(() => {
    const map = new Map<number, Array<{ word: string; length: number; points: number }>>();
    for (const item of results) {
      if (!map.has(item.length)) {
        map.set(item.length, []);
      }
      map.get(item.length)!.push(item);
    }
    // Sort keys descending
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [results]);

  // Copy helpers
  const handleCopyWord = async (word: string) => {
    try {
      await navigator.clipboard.writeText(word);
      setCopiedWord(word);
      setTimeout(() => setCopiedWord(null), 1500);
    } catch {
      // Fallback
    }
  };

  const handleCopyGroup = async (length: number, words: string[]) => {
    try {
      await navigator.clipboard.writeText(words.join(', '));
      setCopiedGroup(length);
      setTimeout(() => setCopiedGroup(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Input & Mode Settings Card */}
      <div className="p-5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex flex-col gap-4 shadow-sm">
        {/* Presets & Language Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {isFr ? 'Exemples rapides :' : 'Quick Presets:'}
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setInputLetters(p.label);
                  setDictLang(p.lang as 'en' | 'fr');
                }}
                className="px-2 py-1 text-xs font-mono rounded bg-[var(--bg-surface)] hover:bg-[var(--glass-bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-all hover:border-[var(--accent-lifestyle)]/40"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Dictionary Language Switch */}
          <div className="flex items-center bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-subtle)]">
            <button
              onClick={() => setDictLang('en')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                dictLang === 'en'
                  ? 'bg-[var(--accent-lifestyle)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => setDictLang('fr')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                dictLang === 'fr'
                  ? 'bg-[var(--accent-lifestyle)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              🇫🇷 Français
            </button>
          </div>
        </div>

        {/* Main Letters Input */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 flex justify-between">
            <span>{isFr ? 'Lettres / Mot à Déchiffrer :' : 'Letters / Scrambled Word:'}</span>
            <span className="text-[var(--text-muted)] text-[11px]">
              {isFr ? 'Astuce : utilisez ? ou * pour les jokers / tuiles blanches' : 'Tip: use ? or * for wildcard blank tiles'}
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputLetters}
              onChange={(e) => setInputLetters(e.target.value)}
              placeholder={isFr ? 'Tapez vos lettres (ex: listen, maison, a?cde)...' : 'Type letters or word (e.g. listen, creative, a?cde)...'}
              className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-lg font-mono tracking-wider text-[var(--text-primary)] uppercase focus:outline-none focus:ring-2 focus:ring-[var(--accent-lifestyle)] placeholder:text-[var(--text-muted)] placeholder:normal-case"
            />
            {inputLetters && (
              <button
                onClick={() => setInputLetters('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filters & Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Mode Selector */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
              {isFr ? 'Mode de Recherche :' : 'Search Mode:'}
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as SolverMode)}
              className="w-full p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-lifestyle)]"
            >
              <option value="all_subwords">
                {isFr ? 'Tous les sous-mots (Scrabble)' : 'All Sub-words (Scrabble)'}
              </option>
              <option value="exact_only">
                {isFr ? 'Anagrammes exacts uniquement' : 'Exact Anagrams Only'}
              </option>
            </select>
          </div>

          {/* Min Length */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
              {isFr ? 'Longueur minimale :' : 'Minimum Length:'}
            </label>
            <select
              value={minLength}
              onChange={(e) => setMinLength(Number(e.target.value))}
              className="w-full p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-lifestyle)]"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}+ {isFr ? 'lettres' : 'letters'}
                </option>
              ))}
            </select>
          </div>

          {/* Starts With Filter */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
              {isFr ? 'Commence par :' : 'Starts with:'}
            </label>
            <input
              type="text"
              maxLength={4}
              value={startsWith}
              onChange={(e) => setStartsWith(e.target.value)}
              placeholder="ex: re, un..."
              className="w-full p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono text-[var(--text-primary)] uppercase focus:outline-none focus:ring-1 focus:ring-[var(--accent-lifestyle)] placeholder:normal-case"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
              {isFr ? 'Trier par :' : 'Sort by:'}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-lifestyle)]"
            >
              <option value="length_desc">
                {isFr ? 'Longueur (plus long en premier)' : 'Length (longest first)'}
              </option>
              <option value="points_desc">
                {isFr ? 'Points Scrabble (plus élevé)' : 'Scrabble Points (highest)'}
              </option>
              <option value="alpha_asc">
                {isFr ? 'Ordre Alphabétique (A-Z)' : 'Alphabetical (A-Z)'}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-semibold text-[var(--text-primary)]">
          {isFr
            ? `${results.length} mot(s) trouvé(s) pour "${inputLetters.toUpperCase()}"`
            : `${results.length} word(s) found for "${inputLetters.toUpperCase()}"`}
        </span>
        <span className="text-[var(--text-muted)]">
          {isFr ? 'Dictionnaire officiel ' : 'Lexicon: '}
          <strong>{dictLang === 'fr' ? 'ODS Français' : 'CSW / TWL English'}</strong>
        </span>
      </div>

      {/* Results Grouped by Word Length */}
      {groupedResults.length > 0 ? (
        <div className="flex flex-col gap-4">
          {groupedResults.map(([wordLen, words]) => (
            <div
              key={wordLen}
              className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex flex-col gap-3 shadow-sm"
            >
              {/* Group Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[var(--accent-lifestyle)]/15 text-[var(--accent-lifestyle)] font-bold text-xs font-mono">
                    {wordLen} {isFr ? 'Lettres' : 'Letters'}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    ({words.length} {isFr ? 'mots' : 'words'})
                  </span>
                </div>

                <button
                  onClick={() => handleCopyGroup(wordLen, words.map((w) => w.word))}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-lifestyle)] flex items-center gap-1 transition-colors"
                >
                  {copiedGroup === wordLen
                    ? isFr
                      ? '✓ Groupe copié !'
                      : '✓ Group copied!'
                    : isFr
                    ? '📋 Copier tout le groupe'
                    : '📋 Copy all in group'}
                </button>
              </div>

              {/* Words Badges Grid */}
              <div className="flex flex-wrap gap-2 pt-1">
                {words.map((item) => {
                  const isCopied = copiedWord === item.word;
                  const lookupUrl =
                    dictLang === 'fr'
                      ? `https://fr.wiktionary.org/wiki/${encodeURIComponent(item.word.toLowerCase())}`
                      : `https://en.wiktionary.org/wiki/${encodeURIComponent(item.word.toLowerCase())}`;

                  return (
                    <div
                      key={item.word}
                      className="group relative flex items-center bg-[var(--bg-surface)] hover:bg-[var(--glass-bg)] border border-[var(--border-subtle)] hover:border-[var(--accent-lifestyle)]/50 rounded-lg p-1.5 pl-2.5 gap-2 transition-all"
                    >
                      {/* Word text */}
                      <button
                        onClick={() => handleCopyWord(item.word)}
                        className="font-mono font-bold text-xs text-[var(--text-primary)] hover:text-white uppercase tracking-wider transition-colors"
                        title={isFr ? 'Cliquer pour copier' : 'Click to copy'}
                      >
                        {item.word}
                      </button>

                      {/* Scrabble points badge */}
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-amber-400 border border-[var(--border-subtle)] select-none">
                        {item.points} pts
                      </span>

                      {/* Dictionary Link */}
                      <a
                        href={lookupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-lifestyle)] transition-opacity"
                        title={isFr ? 'Voir la définition sur Wiktionnaire' : 'Lookup definition on Wiktionary'}
                      >
                        📖
                      </a>

                      {/* Copy feedback tooltip */}
                      {isCopied && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded shadow select-none">
                          {isFr ? 'Copié !' : 'Copied!'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] space-y-2">
          <p className="text-2xl">🔍</p>
          <p className="text-sm font-medium">
            {isFr
              ? 'Aucun mot trouvé avec ces lettres et filtres.'
              : 'No words found with these letters and filters.'}
          </p>
          <p className="text-xs">
            {isFr
              ? 'Essayez de réduire la longueur minimale ou d\'ajouter des jokers (?)'
              : 'Try reducing the minimum length or adding wildcards (?)'}
          </p>
        </div>
      )}
    </div>
  );
}
