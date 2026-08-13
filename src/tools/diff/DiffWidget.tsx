"use client";

import React, { useState, useMemo } from "react";

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  origLineNum?: number;
  modLineNum?: number;
}

interface SplitDiffRow {
  left?: { lineNum: number; text: string; type: 'removed' | 'unchanged' | 'empty' };
  right?: { lineNum: number; text: string; type: 'added' | 'unchanged' | 'empty' };
}

// LCS Diff algorithm implementation
function computeLineDiff(
  originalText: string,
  modifiedText: string,
  options: { ignoreCase: boolean; ignoreWhitespace: boolean }
): DiffLine[] {
  if (!originalText && !modifiedText) return [];

  const origLines = originalText === '' ? [] : originalText.split('\n');
  const modLines = modifiedText === '' ? [] : modifiedText.split('\n');

  const normalize = (line: string) => {
    let res = line;
    if (options.ignoreCase) res = res.toLowerCase();
    if (options.ignoreWhitespace) res = res.trim().replace(/\s+/g, ' ');
    return res;
  };

  const m = origLines.length;
  const n = modLines.length;

  // Build DP table for LCS
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (normalize(origLines[i - 1]) === normalize(modLines[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to construct diff
  let i = m;
  let j = n;
  const rawDiff: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normalize(origLines[i - 1]) === normalize(modLines[j - 1])) {
      rawDiff.push({
        type: 'unchanged',
        text: origLines[i - 1],
        origLineNum: i,
        modLineNum: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawDiff.push({
        type: 'added',
        text: modLines[j - 1],
        modLineNum: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawDiff.push({
        type: 'removed',
        text: origLines[i - 1],
        origLineNum: i,
      });
      i--;
    }
  }

  return rawDiff.reverse();
}

const SAMPLE_ORIGINAL = `function calculateTotal(items, discount) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  if (discount > 0) {
    total -= discount;
  }
  return total;
}`;

const SAMPLE_MODIFIED = `function calculateTotal(items = [], discount = 0, taxRate = 0.05) {
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const discounted = Math.max(0, subtotal - discount);
  const totalWithTax = discounted * (1 + taxRate);
  
  return Number(totalWithTax.toFixed(2));
}`;

export default function DiffWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [originalText, setOriginalText] = useState(SAMPLE_ORIGINAL);
  const [modifiedText, setModifiedText] = useState(SAMPLE_MODIFIED);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [copied, setCopied] = useState(false);

  // Compute diffs
  const diffLines = useMemo(() => {
    return computeLineDiff(originalText, modifiedText, {
      ignoreCase,
      ignoreWhitespace,
    });
  }, [originalText, modifiedText, ignoreCase, ignoreWhitespace]);

  // Statistics
  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let unchanged = 0;
    for (const line of diffLines) {
      if (line.type === 'added') added++;
      else if (line.type === 'removed') removed++;
      else unchanged++;
    }
    return { added, removed, unchanged };
  }, [diffLines]);

  // Split view rows
  const splitRows = useMemo(() => {
    const rows: SplitDiffRow[] = [];
    let i = 0;
    while (i < diffLines.length) {
      const line = diffLines[i];
      if (line.type === 'unchanged') {
        rows.push({
          left: { lineNum: line.origLineNum!, text: line.text, type: 'unchanged' },
          right: { lineNum: line.modLineNum!, text: line.text, type: 'unchanged' },
        });
        i++;
      } else if (line.type === 'removed') {
        // Look ahead for matching added
        if (i + 1 < diffLines.length && diffLines[i + 1].type === 'added') {
          rows.push({
            left: { lineNum: line.origLineNum!, text: line.text, type: 'removed' },
            right: { lineNum: diffLines[i + 1].modLineNum!, text: diffLines[i + 1].text, type: 'added' },
          });
          i += 2;
        } else {
          rows.push({
            left: { lineNum: line.origLineNum!, text: line.text, type: 'removed' },
            right: undefined,
          });
          i++;
        }
      } else if (line.type === 'added') {
        rows.push({
          left: undefined,
          right: { lineNum: line.modLineNum!, text: line.text, type: 'added' },
        });
        i++;
      }
    }
    return rows;
  }, [diffLines]);

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
  };

  const handleClear = () => {
    setOriginalText('');
    setModifiedText('');
  };

  const handleLoadSample = () => {
    setOriginalText(SAMPLE_ORIGINAL);
    setModifiedText(SAMPLE_MODIFIED);
  };

  const handleCopyDiff = () => {
    const textOutput = diffLines
      .map((d) => {
        const prefix = d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  ';
        return prefix + d.text;
      })
      .join('\n');

    navigator.clipboard.writeText(textOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Controls & View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border-subtle)]">
            <button
              onClick={() => setViewMode('unified')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'unified'
                  ? 'bg-[var(--accent-devsec)] text-black shadow-sm font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isFr ? 'Vue Unifiée' : 'Unified Diff'}
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'split'
                  ? 'bg-[var(--accent-devsec)] text-black shadow-sm font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isFr ? 'Côte à côte' : 'Split Diff'}
            </button>
          </div>
        </div>

        {/* Options & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="rounded border-[var(--border-subtle)] text-[var(--accent-devsec)] focus:ring-[var(--accent-devsec)] bg-[var(--bg-elevated)]"
            />
            <span>{isFr ? 'Ignorer la casse' : 'Ignore Case'}</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="rounded border-[var(--border-subtle)] text-[var(--accent-devsec)] focus:ring-[var(--accent-devsec)] bg-[var(--bg-elevated)]"
            />
            <span>{isFr ? 'Ignorer les espaces' : 'Ignore Whitespace'}</span>
          </label>

          <button
            onClick={handleSwap}
            title={isFr ? 'Intervertir les deux textes' : 'Swap Original & Modified'}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ⇄ {isFr ? 'Inverser' : 'Swap'}
          </button>

          <button
            onClick={handleLoadSample}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {isFr ? 'Exemple' : 'Sample'}
          </button>

          <button
            onClick={handleClear}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-rose-400 transition-colors"
          >
            {isFr ? 'Effacer' : 'Clear'}
          </button>
        </div>
      </div>

      {/* Inputs Section: Side-by-side or stacked textareas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original Text Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {isFr ? 'Texte original' : 'Original Text'}
            </span>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              {originalText ? originalText.split('\n').length : 0} {isFr ? 'lignes' : 'lines'}
            </span>
          </div>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder={isFr ? 'Collez le texte initial ici...' : 'Paste original text here...'}
            rows={7}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3 font-mono text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-devsec)] resize-y"
          />
        </div>

        {/* Modified Text Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {isFr ? 'Texte modifié' : 'Modified Text'}
            </span>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              {modifiedText ? modifiedText.split('\n').length : 0} {isFr ? 'lignes' : 'lines'}
            </span>
          </div>
          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            placeholder={isFr ? 'Collez le texte modifié ici...' : 'Paste modified text here...'}
            rows={7}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3 font-mono text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-devsec)] resize-y"
          />
        </div>
      </div>

      {/* Diff Output & Stats Header */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Diff Stats Badges */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
              +{stats.added} {isFr ? 'ajout(s)' : 'added'}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
              -{stats.removed} {isFr ? 'suppression(s)' : 'removed'}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              {stats.unchanged} {isFr ? 'identique(s)' : 'unchanged'}
            </span>
          </div>

          {/* Copy Output Button */}
          <button
            onClick={handleCopyDiff}
            disabled={diffLines.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] disabled:opacity-40'
            }`}
          >
            {copied ? (
              <>
                <span>✓</span>
                <span>{isFr ? 'Diff copié !' : 'Diff Copied!'}</span>
              </>
            ) : (
              <>
                <span>📋</span>
                <span>{isFr ? 'Copier le Diff' : 'Copy Diff'}</span>
              </>
            )}
          </button>
        </div>

        {/* Diff Viewer Card */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden shadow-inner font-mono text-xs">
          {diffLines.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] italic">
              {isFr ? 'Entrez du texte ci-dessus pour comparer les différences.' : 'Enter text above to compute and visualize differences.'}
            </div>
          ) : viewMode === 'unified' ? (
            /* --- UNIFIED VIEW --- */
            <div className="overflow-x-auto divide-y divide-[var(--border-subtle)]/40 max-h-[500px]">
              {diffLines.map((line, idx) => {
                let rowBg = 'hover:bg-white/[0.02]';
                let indicator = ' ';
                let lineStyle = 'text-[var(--text-secondary)]';

                if (line.type === 'added') {
                  rowBg = 'bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-500';
                  indicator = '+';
                  lineStyle = 'text-emerald-200 font-medium';
                } else if (line.type === 'removed') {
                  rowBg = 'bg-rose-500/20 text-rose-300 border-l-2 border-rose-500';
                  indicator = '-';
                  lineStyle = 'text-rose-200 font-medium';
                }

                return (
                  <div
                    key={idx}
                    className={`flex items-start py-1 px-2.5 transition-colors ${rowBg}`}
                  >
                    {/* Line numbers gutter */}
                    <div className="w-10 shrink-0 text-right pr-2 select-none text-[11px] text-[var(--text-muted)]">
                      {line.origLineNum ?? ''}
                    </div>
                    <div className="w-10 shrink-0 text-right pr-3 select-none text-[11px] text-[var(--text-muted)] border-r border-[var(--border-subtle)]">
                      {line.modLineNum ?? ''}
                    </div>

                    {/* Prefix indicator (+ / - / space) */}
                    <div className="w-6 shrink-0 text-center select-none font-bold text-xs opacity-75">
                      {indicator}
                    </div>

                    {/* Line content */}
                    <div className={`flex-1 whitespace-pre-wrap break-all ${lineStyle}`}>
                      {line.text || ' '}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* --- SPLIT VIEW (Side-by-side) --- */
            <div className="overflow-x-auto max-h-[500px]">
              <div className="grid grid-cols-2 divide-x divide-[var(--border-subtle)] min-w-[640px]">
                {splitRows.map((row, idx) => (
                  <React.Fragment key={idx}>
                    {/* Left Column (Original) */}
                    <div
                      className={`flex items-start py-1 px-2 ${
                        row.left?.type === 'removed'
                          ? 'bg-rose-500/20 text-rose-300 border-l-2 border-rose-500'
                          : row.left
                          ? 'text-[var(--text-secondary)] hover:bg-white/[0.02]'
                          : 'bg-black/20 text-transparent select-none'
                      }`}
                    >
                      <div className="w-8 shrink-0 text-right pr-2 select-none text-[11px] text-[var(--text-muted)]">
                        {row.left?.lineNum ?? ''}
                      </div>
                      <div className="w-4 shrink-0 text-center select-none font-bold text-[11px] opacity-70">
                        {row.left?.type === 'removed' ? '-' : ''}
                      </div>
                      <div className="flex-1 whitespace-pre-wrap break-all text-xs">
                        {row.left?.text || (row.left ? ' ' : ' ')}
                      </div>
                    </div>

                    {/* Right Column (Modified) */}
                    <div
                      className={`flex items-start py-1 px-2 ${
                        row.right?.type === 'added'
                          ? 'bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-500'
                          : row.right
                          ? 'text-[var(--text-secondary)] hover:bg-white/[0.02]'
                          : 'bg-black/20 text-transparent select-none'
                      }`}
                    >
                      <div className="w-8 shrink-0 text-right pr-2 select-none text-[11px] text-[var(--text-muted)]">
                        {row.right?.lineNum ?? ''}
                      </div>
                      <div className="w-4 shrink-0 text-center select-none font-bold text-[11px] opacity-70">
                        {row.right?.type === 'added' ? '+' : ''}
                      </div>
                      <div className="flex-1 whitespace-pre-wrap break-all text-xs">
                        {row.right?.text || (row.right ? ' ' : ' ')}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
