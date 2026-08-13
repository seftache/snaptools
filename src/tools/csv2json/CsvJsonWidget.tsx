"use client";

import React, { useState, useEffect, useCallback } from "react";

// --- RFC 4180 Compliant CSV Parser ---
function parseCSV(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i++;
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip \n in CRLF
      }
      currentRow.push(currentCell);
      currentCell = '';
      if (currentRow.some(c => c.trim() !== '') || rows.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  // Push last cell & row if not empty
  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

// Convert JSON array of objects or arrays to CSV string
function jsonToCSV(data: any, delimiter: string, includeHeaders: boolean): string {
  if (!Array.isArray(data)) {
    if (typeof data === 'object' && data !== null) {
      data = [data];
    } else {
      throw new Error('Input must be a JSON array of objects or a JSON object.');
    }
  }

  if (data.length === 0) return '';

  const escapeCSVCell = (val: any): string => {
    if (val === null || val === undefined) return '';
    let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  // Check if array of arrays
  if (Array.isArray(data[0])) {
    return data.map((row: any[]) => row.map(escapeCSVCell).join(delimiter)).join('\n');
  }

  // Array of objects: extract all unique headers
  const headers: string[] = Array.from(
    new Set<string>(data.flatMap((item: any) => (typeof item === 'object' && item !== null ? Object.keys(item) : [])))
  );

  const lines: string[] = [];
  if (includeHeaders) {
    lines.push(headers.map(escapeCSVCell).join(delimiter));
  }

  for (const item of data) {
    const record = (item && typeof item === 'object') ? (item as Record<string, unknown>) : {};
    const row = headers.map(h => escapeCSVCell(record[h]));
    lines.push(row.join(delimiter));
  }

  return lines.join('\n');
}

const SAMPLE_CSV = `id,name,role,department,active,salary
101,Alice Johnson,Software Engineer,Engineering,true,95000
102,Bob Smith,Product Designer,Design,true,88000
103,Charlie Brown,Marketing Lead,Marketing,false,72000
104,Diana Prince,DevOps Specialist,Engineering,true,105000`;

const SAMPLE_JSON = `[
  {
    "id": 101,
    "name": "Alice Johnson",
    "role": "Software Engineer",
    "department": "Engineering",
    "active": true,
    "salary": 95000
  },
  {
    "id": 102,
    "name": "Bob Smith",
    "role": "Product Designer",
    "department": "Design",
    "active": true,
    "salary": 88000
  },
  {
    "id": 103,
    "name": "Charlie Brown",
    "role": "Marketing Lead",
    "department": "Marketing",
    "active": false,
    "salary": 72000
  }
]`;

export default function CsvJsonWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [mode, setMode] = useState<'csv2json' | 'json2csv'>('csv2json');
  const [input, setInput] = useState(SAMPLE_CSV);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [separator, setSeparator] = useState<',' | ';' | '\t' | '|'>(',');
  const [indent, setIndent] = useState<number>(2);
  const [hasHeaders, setHasHeaders] = useState(true);
  const [parseTypes, setParseTypes] = useState(true);
  const [copied, setCopied] = useState(false);

  // Auto-convert logic
  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    setError('');
    try {
      if (mode === 'csv2json') {
        const rows = parseCSV(input, separator);
        if (rows.length === 0) {
          setOutput('[]');
          return;
        }

        if (hasHeaders && rows.length > 0) {
          const headers = rows[0].map(h => h.trim());
          const records: Record<string, any>[] = [];

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const obj: Record<string, any> = {};
            for (let j = 0; j < headers.length; j++) {
              let rawVal = row[j] ?? '';
              if (parseTypes) {
                const trimmed = rawVal.trim();
                if (trimmed === 'true') {
                  obj[headers[j]] = true;
                } else if (trimmed === 'false') {
                  obj[headers[j]] = false;
                } else if (trimmed === 'null') {
                  obj[headers[j]] = null;
                } else if (trimmed !== '' && !isNaN(Number(trimmed))) {
                  obj[headers[j]] = Number(trimmed);
                } else {
                  obj[headers[j]] = rawVal;
                }
              } else {
                obj[headers[j]] = rawVal;
              }
            }
            records.push(obj);
          }

          setOutput(JSON.stringify(records, null, indent));
        } else {
          // Array of arrays
          const parsedRows = rows.map(r =>
            parseTypes
              ? r.map(c => {
                  const trimmed = c.trim();
                  if (trimmed === 'true') return true;
                  if (trimmed === 'false') return false;
                  if (trimmed === 'null') return null;
                  if (trimmed !== '' && !isNaN(Number(trimmed))) return Number(trimmed);
                  return c;
                })
              : r
          );
          setOutput(JSON.stringify(parsedRows, null, indent));
        }
      } else {
        // JSON to CSV
        const parsed = JSON.parse(input);
        const csvRes = jsonToCSV(parsed, separator, hasHeaders);
        setOutput(csvRes);
      }
    } catch (err: any) {
      setError(
        mode === 'csv2json'
          ? (isFr ? `Erreur d'analyse CSV : ${err.message}` : `CSV Parsing Error: ${err.message}`)
          : (isFr ? `Erreur de syntaxe JSON : ${err.message}` : `JSON Syntax Error: ${err.message}`)
      );
      setOutput('');
    }
  }, [input, mode, separator, indent, hasHeaders, parseTypes, isFr]);

  // Run conversion when input or options change
  useEffect(() => {
    handleConvert();
  }, [handleConvert]);

  const handleSwitchMode = (newMode: 'csv2json' | 'json2csv') => {
    if (newMode === mode) return;
    setMode(newMode);
    setInput(newMode === 'csv2json' ? SAMPLE_CSV : SAMPLE_JSON);
    setOutput('');
    setError('');
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!output) return;
    const extension = mode === 'csv2json' ? 'json' : 'csv';
    const mimeType = mode === 'csv2json' ? 'application/json' : 'text/csv';
    const blob = new Blob([output], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted_${Date.now()}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleMinifyJSON = () => {
    if (mode === 'csv2json' && output) {
      try {
        const parsed = JSON.parse(output);
        setIndent(0);
        setOutput(JSON.stringify(parsed));
      } catch {}
    }
  };

  const handleFormatJSON = () => {
    if (mode === 'csv2json' && output) {
      try {
        const parsed = JSON.parse(output);
        setIndent(2);
        setOutput(JSON.stringify(parsed, null, 2));
      } catch {}
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setInput(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header: Mode Switcher & Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
        {/* Mode Tabs */}
        <div className="flex items-center bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border-subtle)]">
          <button
            onClick={() => handleSwitchMode('csv2json')}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              mode === 'csv2json'
                ? 'bg-[var(--accent-devsec)] text-black shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isFr ? 'CSV vers JSON' : 'CSV to JSON'}
          </button>
          <button
            onClick={() => handleSwitchMode('json2csv')}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              mode === 'json2csv'
                ? 'bg-[var(--accent-devsec)] text-black shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isFr ? 'JSON vers CSV' : 'JSON to CSV'}
          </button>
        </div>

        {/* Configurations Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Separator Select */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs">
            <span className="text-[var(--text-muted)]">{isFr ? 'Séparateur :' : 'Delimiter:'}</span>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value as any)}
              className="bg-transparent text-[var(--text-primary)] focus:outline-none cursor-pointer font-mono"
            >
              <option value="," className="bg-[var(--bg-elevated)]">Virgule ( , )</option>
              <option value=";" className="bg-[var(--bg-elevated)]">Point-virgule ( ; )</option>
              <option value="&#9;" className="bg-[var(--bg-elevated)]">Tabulation ( \t )</option>
              <option value="|" className="bg-[var(--bg-elevated)]">Pipe ( | )</option>
            </select>
          </div>

          {/* Indentation for JSON */}
          {mode === 'csv2json' && (
            <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs">
              <span className="text-[var(--text-muted)]">JSON :</span>
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="bg-transparent text-[var(--text-primary)] focus:outline-none cursor-pointer font-mono"
              >
                <option value={2} className="bg-[var(--bg-elevated)]">2 Espaces</option>
                <option value={4} className="bg-[var(--bg-elevated)]">4 Espaces</option>
                <option value={0} className="bg-[var(--bg-elevated)]">Minifié (0)</option>
              </select>
            </div>
          )}

          {/* Headers Checkbox */}
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--bg-elevated)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasHeaders}
              onChange={(e) => setHasHeaders(e.target.checked)}
              className="rounded border-[var(--border-subtle)] text-[var(--accent-devsec)] focus:ring-[var(--accent-devsec)] bg-[var(--bg-base)]"
            />
            <span>{isFr ? 'En-têtes' : 'Headers'}</span>
          </label>
        </div>
      </div>

      {/* Dual Pane: Left Input, Right Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Pane: Input */}
        <div className="space-y-2 flex flex-col">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-devsec)]" />
              <span>{mode === 'csv2json' ? (isFr ? 'Données CSV' : 'CSV Input') : (isFr ? 'Données JSON' : 'JSON Input')}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                📁 {isFr ? 'Importer' : 'Upload'}
                <input
                  type="file"
                  accept={mode === 'csv2json' ? '.csv,.txt' : '.json,.txt'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setInput(mode === 'csv2json' ? SAMPLE_CSV : SAMPLE_JSON)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {isFr ? 'Exemple' : 'Sample'}
              </button>
              <button
                onClick={() => setInput('')}
                className="text-[var(--text-muted)] hover:text-rose-400 transition-colors"
              >
                {isFr ? 'Effacer' : 'Clear'}
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'csv2json'
                ? (isFr ? 'Collez vos lignes CSV ici...' : 'Paste your CSV rows here...')
                : (isFr ? 'Collez votre tableau ou objet JSON ici...' : 'Paste your JSON array or object here...')
            }
            rows={14}
            className="w-full flex-1 min-h-[320px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3.5 font-mono text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-devsec)] transition-all resize-y"
          />

          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <span>{input ? input.split('\n').length : 0} {isFr ? 'lignes' : 'lines'}</span>
            <span>{new TextEncoder().encode(input).length} {isFr ? 'octets' : 'bytes'}</span>
          </div>
        </div>

        {/* Right Pane: Output */}
        <div className="space-y-2 flex flex-col">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>{mode === 'csv2json' ? (isFr ? 'Résultat JSON' : 'JSON Output') : (isFr ? 'Résultat CSV' : 'CSV Output')}</span>
            </div>

            <div className="flex items-center gap-2">
              {mode === 'csv2json' && (
                <>
                  <button
                    onClick={handleFormatJSON}
                    disabled={!output}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
                  >
                    Format
                  </button>
                  <button
                    onClick={handleMinifyJSON}
                    disabled={!output}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
                  >
                    Minify
                  </button>
                </>
              )}
              <button
                onClick={handleCopy}
                disabled={!output}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40 font-semibold"
              >
                {copied ? (isFr ? '✓ Copié' : '✓ Copied') : (isFr ? '📋 Copier' : '📋 Copy')}
              </button>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-40 font-semibold"
              >
                💾 {isFr ? 'Télécharger' : 'Download'}
              </button>
            </div>
          </div>

          <div className="relative flex-1 min-h-[320px]">
            {error ? (
              <div className="w-full h-full min-h-[320px] rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 font-mono text-xs text-rose-300 overflow-auto">
                <div className="font-bold flex items-center gap-2 mb-2">
                  <span>⚠️</span>
                  <span>{isFr ? 'Erreur de conversion' : 'Conversion Error'}</span>
                </div>
                <p className="whitespace-pre-wrap">{error}</p>
              </div>
            ) : (
              <textarea
                readOnly
                value={output}
                placeholder={isFr ? 'Le résultat converti apparaîtra ici...' : 'Converted result will appear here...'}
                rows={14}
                className="w-full h-full min-h-[320px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3.5 font-mono text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none select-all resize-y"
              />
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <span>{output ? output.split('\n').length : 0} {isFr ? 'lignes' : 'lines'}</span>
            <span>{output ? new TextEncoder().encode(output).length : 0} {isFr ? 'octets' : 'bytes'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
