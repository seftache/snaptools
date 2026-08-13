"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UsernameWidgetProps {
  locale: string;
}

type VibeCategory = 'gaming' | 'aesthetic' | 'short' | 'cyber' | 'fantasy' | 'minimal';
type CaseStyle = 'CamelCase' | 'lowercase' | 'UPPERCASE' | 'snake_case' | 'kebab_case';

interface VibeOption {
  id: VibeCategory;
  labelEn: string;
  labelFr: string;
  emoji: string;
  color: string;
}

const VIBES: VibeOption[] = [
  { id: 'gaming', labelEn: 'Gaming / Tech', labelFr: 'Gaming / Tech', emoji: '🎮', color: 'from-purple-500/20 to-indigo-500/20' },
  { id: 'aesthetic', labelEn: 'Creative / Aesthetic', labelFr: 'Créatif & Esthétique', emoji: '🌸', color: 'from-pink-500/20 to-rose-500/20' },
  { id: 'short', labelEn: 'Short & Catchy', labelFr: 'Court & Percutant', emoji: '⚡', color: 'from-amber-500/20 to-orange-500/20' },
  { id: 'cyber', labelEn: 'Cyber / Hacker', labelFr: 'Cyber / Hacker', emoji: '👾', color: 'from-emerald-500/20 to-teal-500/20' },
  { id: 'fantasy', labelEn: 'Fantasy / Mythic', labelFr: 'Fantastique / Mythe', emoji: '🐉', color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'minimal', labelEn: 'Minimal / Pro', labelFr: 'Minimaliste & Pro', emoji: '✨', color: 'from-slate-500/20 to-zinc-500/20' },
];

const WORDBANKS: Record<VibeCategory, { prefixes: string[]; suffixes: string[]; keywords: string[] }> = {
  gaming: {
    prefixes: ['Apex', 'Shadow', 'Vortex', 'Phantom', 'Nova', 'Pixel', 'Venom', 'Hydra', 'Rogue', 'Viper', 'Titan', 'Blitz', 'Ghost', 'Strike', 'Slayer', 'Havoc', 'Raptor', 'Onyx', 'Fury', 'Echo', 'Chaos', 'Reaper', 'Zenith', 'Hyper'],
    suffixes: ['Sniper', 'Plays', 'GG', 'Vibe', 'Ops', 'Aim', 'God', 'Knight', 'Wolf', 'Storm', 'Blade', 'Pulse', 'King', 'Zone', 'Mode', 'Core', 'Craft', 'Legend', 'Master', 'X', 'Force', 'Shot'],
    keywords: ['frag', 'clutch', 'rush', 'pixel', 'turbo', 'ace', 'spawn', 'shield', 'rift', 'nexus']
  },
  aesthetic: {
    prefixes: ['Velvet', 'Moon', 'Cosmic', 'Pastel', 'Solstice', 'Aura', 'Loom', 'Drift', 'Haze', 'Petal', 'Cloud', 'Bloom', 'Lumina', 'Silk', 'Breeze', 'Dawn', 'Muse', 'Haven', 'Vesper', 'Flora', 'Clover', 'Glow', 'Amber', 'Starlight'],
    suffixes: ['Garden', 'Whisper', 'Tears', 'Dream', 'Chime', 'Song', 'Skies', 'Loom', 'Mirage', 'Echo', 'Soul', 'Gleam', 'Serene', 'Meadow', 'Mist', 'Wave', 'Sprout', 'Breeze'],
    keywords: ['luna', 'bliss', 'sol', 'flora', 'petal', 'zen', 'aura', 'mist', 'haze', 'echo']
  },
  short: {
    prefixes: ['Zyn', 'Kir', 'Vex', 'Nox', 'Lum', 'Kyr', 'Vyl', 'Zev', 'Xen', 'Jnx', 'Aer', 'Riz', 'Flx', 'Vib', 'Tek', 'Mav', 'Dex', 'Zor', 'Kae', 'Ori', 'Sol', 'Nyx', 'Koz', 'Bly'],
    suffixes: ['o', 'x', 'a', 'y', 'or', 'ix', 'on', 'el', 'ex', 'is', 'us', 'ar', 'iq', 'ax', 'in'],
    keywords: ['lux', 'neo', 'zen', 'dex', 'vox', 'fox', 'lyn', 'max', 'sky', 'ray']
  },
  cyber: {
    prefixes: ['Byte', 'Null', 'Quantum', 'Root', 'Cipher', 'Zero', 'Kernel', 'Vector', 'Glitch', 'Matrix', 'Crypt', 'Socket', 'Packet', 'Daemon', 'Buffer', 'Hex', 'Logic', 'Terminal', 'Proxy', 'Node', 'Ping', 'Stack', 'Cyber', 'Data'],
    suffixes: ['Sec', 'Dev', 'Net', 'Exe', 'Hash', 'Code', 'Loop', 'Gate', 'Dump', 'Flow', 'Trace', 'Script', 'Byte', 'Sync', 'Vault', 'Bit', 'Port', 'Thread', 'Shell', 'Host'],
    keywords: ['root', 'algo', 'auth', 'grep', 'sudo', 'ping', 'bash', 'sync', 'hack', 'fork']
  },
  fantasy: {
    prefixes: ['Arcane', 'Valkyrie', 'Elden', 'Frost', 'Draken', 'Mythic', 'Sage', 'Rune', 'Celestial', 'Astral', 'Gryphon', 'Fae', 'Shadowleaf', 'Stormborn', 'Obsidian', 'Silver', 'Phoenix', 'Oracle', 'Solarian', 'Dragon', 'Dusk'],
    suffixes: ['Heart', 'Weaver', 'Bane', 'Crown', 'Song', 'Warden', 'Walker', 'Blade', 'Sorcerer', 'Mage', 'Keeper', 'Rider', 'Shield', 'Spell', 'Claw', 'Fang', 'Flame'],
    keywords: ['mana', 'elf', 'spell', 'rune', 'wyrm', 'lore', 'dusk', 'star', 'helm', 'isle']
  },
  minimal: {
    prefixes: ['Studio', 'Lab', 'Craft', 'Pure', 'Mono', 'Base', 'Grid', 'Core', 'Form', 'Flow', 'Space', 'Prime', 'Shift', 'Unit', 'Sync', 'Line', 'Type', 'Node', 'Works', 'Arch', 'Atelier'],
    suffixes: ['Co', 'Design', 'HQ', 'Tech', 'App', 'Lab', 'Box', 'Base', 'Desk', 'Zone', 'Club', 'Group', 'Work', 'View', 'Mark', 'Hub', 'Direct'],
    keywords: ['pure', 'bold', 'neat', 'lean', 'flat', 'true', 'icon', 'raw', 'fine', 'form']
  }
};

const NUMBERS_POOL = ['07', '99', '404', '777', '2026', '007', '88', '01', '360', '9', '24', '13'];
const SEPARATORS = ['_', '.', '-', 'x_', 'i_am_', 'the_', '_official', '_hq'];

export default function UsernameWidget({ locale }: UsernameWidgetProps) {
  const isFr = locale === 'fr';

  // Controls State
  const [selectedVibe, setSelectedVibe] = useState<VibeCategory>('gaming');
  const [keyword, setKeyword] = useState<string>('');
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(false);
  const [includeSeparators, setIncludeSeparators] = useState<boolean>(false);
  const [caseStyle, setCaseStyle] = useState<CaseStyle>('CamelCase');
  const [count, setCount] = useState<number>(10);

  // Generated results & favorites
  const [usernames, setUsernames] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Generator engine
  const generateUsernames = useCallback(() => {
    const bank = WORDBANKS[selectedVibe];
    const generated = new Set<string>();
    const cleanKeyword = keyword.trim().replace(/[^a-zA-Z0-9]/g, '');

    let attempts = 0;
    while (generated.size < count && attempts < 100) {
      attempts++;
      let rawName = '';

      const pickPrefix = bank.prefixes[Math.floor(Math.random() * bank.prefixes.length)];
      const pickSuffix = bank.suffixes[Math.floor(Math.random() * bank.suffixes.length)];
      const pickKw = bank.keywords[Math.floor(Math.random() * bank.keywords.length)];

      if (cleanKeyword) {
        // Integrate keyword smartly
        const formats = [
          () => `${cleanKeyword}${pickSuffix}`,
          () => `${pickPrefix}${cleanKeyword}`,
          () => `${cleanKeyword}${pickKw}`,
          () => `${pickPrefix}${cleanKeyword}${pickSuffix}`,
          () => `${cleanKeyword}${Math.floor(Math.random() * 90 + 10)}`,
        ];
        rawName = formats[Math.floor(Math.random() * formats.length)]();
      } else {
        if (selectedVibe === 'short') {
          // Construct catchy short names (3 to 6 chars)
          const p = pickPrefix;
          const s = pickSuffix;
          rawName = `${p}${s}`;
        } else {
          // Standard combo
          const pattern = Math.random();
          if (pattern > 0.4) {
            rawName = `${pickPrefix}${pickSuffix}`;
          } else if (pattern > 0.2) {
            rawName = `${pickPrefix}${pickKw}`;
          } else {
            rawName = `${pickKw}${pickSuffix}`;
          }
        }
      }

      // Add separator / special characters
      if (includeSeparators && Math.random() > 0.3) {
        const sep = SEPARATORS[Math.floor(Math.random() * SEPARATORS.length)];
        if (sep.startsWith('_') || sep.startsWith('.')) {
          rawName = `${rawName}${sep}`;
        } else if (sep.endsWith('_')) {
          rawName = `${sep}${rawName}`;
        } else {
          rawName = rawName.replace(/([a-z])([A-Z])/g, `$1${sep}$2`);
        }
      }

      // Add number suffix
      if (includeNumbers && Math.random() > 0.3) {
        const num = NUMBERS_POOL[Math.floor(Math.random() * NUMBERS_POOL.length)];
        rawName = `${rawName}${num}`;
      }

      // Apply case formatting
      let formatted = rawName;
      if (caseStyle === 'lowercase') {
        formatted = rawName.toLowerCase();
      } else if (caseStyle === 'UPPERCASE') {
        formatted = rawName.toUpperCase();
      } else if (caseStyle === 'snake_case') {
        formatted = rawName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase().replace(/[\s.-]+/g, '_');
      } else if (caseStyle === 'kebab_case') {
        formatted = rawName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/[\s._]+/g, '-');
      } else if (caseStyle === 'CamelCase') {
        formatted = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      }

      if (formatted.length >= 3 && formatted.length <= 25) {
        generated.add(formatted);
      }
    }

    setUsernames(Array.from(generated));
  }, [selectedVibe, keyword, includeNumbers, includeSeparators, caseStyle, count]);

  // Generate on initial render or vibe change
  useEffect(() => {
    generateUsernames();
  }, [generateUsernames]);

  // Copy single username
  const copyUsername = async (name: string, index: number) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Copy all generated usernames
  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(usernames.join('\n'));
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Toggle favorite
  const toggleFavorite = (name: string) => {
    if (favorites.includes(name)) {
      setFavorites(favorites.filter((f) => f !== name));
    } else {
      setFavorites([...favorites, name]);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Category / Vibe Selection Cards */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {isFr ? '1. Choisissez un Style / Ambiance (Vibe) :' : '1. Select Category / Vibe:'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {VIBES.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVibe(v.id)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                selectedVibe === v.id
                  ? 'bg-[var(--accent-lifestyle)] text-white border-transparent shadow-md scale-[1.02]'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <span className="text-xl">{v.emoji}</span>
              <span className="text-xs font-semibold leading-tight">
                {isFr ? v.labelFr : v.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Generator Controls Card */}
      <div className="p-5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex flex-col gap-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Optional Keyword Input (6 cols) */}
          <div className="md:col-span-6">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              {isFr ? 'Mot-clé ou Nom personnalisé (optionnel) :' : 'Optional Keyword or Name:'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={isFr ? 'ex: Alex, Shadow, Cyber, Pixel...' : 'e.g. Alex, Wolf, Cyber, Pixel...'}
                className="w-full px-3.5 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-lifestyle)] placeholder:text-[var(--text-muted)]"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Capitalization Style (3 cols) */}
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              {isFr ? 'Format de Casse :' : 'Case Style:'}
            </label>
            <select
              value={caseStyle}
              onChange={(e) => setCaseStyle(e.target.value as CaseStyle)}
              className="w-full px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-lifestyle)]"
            >
              <option value="CamelCase">CamelCase (NovaPixel)</option>
              <option value="lowercase">lowercase (novapixel)</option>
              <option value="UPPERCASE">UPPERCASE (NOVAPIXEL)</option>
              <option value="snake_case">snake_case (nova_pixel)</option>
              <option value="kebab_case">kebab-case (nova-pixel)</option>
            </select>
          </div>

          {/* Amount of names (3 cols) */}
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              {isFr ? 'Quantité :' : 'Batch Size:'}
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-lifestyle)]"
            >
              <option value={10}>{isFr ? '10 pseudos' : '10 usernames'}</option>
              <option value={16}>{isFr ? '16 pseudos' : '16 usernames'}</option>
              <option value={24}>{isFr ? '24 pseudos' : '24 usernames'}</option>
            </select>
          </div>
        </div>

        {/* Toggles Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--border-subtle)] text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="rounded accent-[var(--accent-lifestyle)]"
              />
              <span>{isFr ? 'Inclure des chiffres (ex: 07, 777)' : 'Include numbers (e.g. 07, 777)'}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={includeSeparators}
                onChange={(e) => setIncludeSeparators(e.target.checked)}
                className="rounded accent-[var(--accent-lifestyle)]"
              />
              <span>{isFr ? 'Préfixes / Séparateurs (ex: _, official)' : 'Prefixes / Separators (e.g. _, hq)'}</span>
            </label>
          </div>

          {/* Big Generate Button */}
          <button
            onClick={generateUsernames}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-[var(--accent-lifestyle)] hover:opacity-90 transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span>✨</span>
            <span>{isFr ? 'Générer de Nouveaux Pseudos' : 'Generate Usernames'}</span>
          </button>
        </div>
      </div>

      {/* Generated Usernames Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {isFr ? `Pseudos Générés (${usernames.length}) :` : `Generated Usernames (${usernames.length}):`}
          </span>

          <button
            onClick={copyAll}
            className="text-xs text-[var(--accent-lifestyle)] hover:underline flex items-center gap-1 font-medium"
          >
            {allCopied ? (isFr ? '✓ Tous Copiés !' : '✓ All Copied!') : (isFr ? '📋 Tout Copier' : '📋 Copy All')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence>
            {usernames.map((name, index) => {
              const isFav = favorites.includes(name);
              const isCopied = copiedIndex === index;

              return (
                <motion.div
                  key={`${name}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="group relative p-3.5 bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-lifestyle)]/50 transition-all shadow-sm flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col truncate">
                    <span className="font-mono font-bold text-sm text-[var(--text-primary)] group-hover:text-white truncate">
                      {name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {name.length} {isFr ? 'caractères' : 'chars'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(name)}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        isFav ? 'text-amber-400' : 'text-[var(--text-muted)] hover:text-amber-400'
                      }`}
                      title={isFr ? 'Enregistrer dans les favoris' : 'Save to favorites'}
                    >
                      {isFav ? '★' : '☆'}
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => copyUsername(name, index)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isCopied
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-[var(--bg-surface)] hover:bg-[var(--glass-bg)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                      title={isFr ? 'Copier le pseudo' : 'Copy username'}
                    >
                      {isCopied ? (isFr ? '✓ Copié' : '✓ Copied') : (isFr ? 'Copier' : 'Copy')}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Favorites Drawer (if any pinned) */}
      {favorites.length > 0 && (
        <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-amber-500/20 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <span>★</span>
              <span>{isFr ? `Vos Pseudos Favoris (${favorites.length})` : `Saved Favorite Usernames (${favorites.length})`}</span>
            </span>
            <button
              onClick={() => setFavorites([])}
              className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
            >
              {isFr ? 'Vider les favoris' : 'Clear all'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {favorites.map((fav) => (
              <span
                key={fav}
                onClick={() => navigator.clipboard.writeText(fav)}
                className="px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-amber-400/40 rounded-lg text-xs font-mono font-semibold text-[var(--text-primary)] cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                title={isFr ? 'Cliquer pour copier' : 'Click to copy'}
              >
                <span>{fav}</span>
                <span className="text-[10px] text-[var(--text-muted)]">📋</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
