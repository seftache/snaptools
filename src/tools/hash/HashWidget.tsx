"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

// --- Standalone MD5 Implementation (RFC 1321) for Uint8Array ---
function safeAdd(x: number, y: number): number {
  const lsw = (x & 0xffff) + (y & 0xffff);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xffff);
}

function bitRotateLeft(num: number, cnt: number): number {
  return (num << cnt) | (num >>> (32 - cnt));
}

function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}

function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return md5cmn((b & c) | (~b & d), a, b, x, s, t);
}

function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
}

function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}

function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}

function calculateMD5(bytes: Uint8Array): string {
  const len = bytes.length;
  // Pad the message
  const paddedLen = (((len + 8) >>> 6) + 1) << 4;
  const x = new Int32Array(paddedLen);

  for (let i = 0; i < len; i++) {
    x[i >> 2] |= (bytes[i] & 0xff) << ((i % 4) * 8);
  }
  x[len >> 2] |= 0x80 << ((len % 4) * 8);
  x[paddedLen - 2] = (len * 8) & 0xffffffff;
  x[paddedLen - 1] = Math.floor((len * 8) / 0x100000000);

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5ff(a, b, c, d, x[i + 0], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i + 0], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i + 0], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

    a = md5ii(a, b, c, d, x[i + 0], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const hexChars = "0123456789abcdef";
  let output = "";
  const values = [a, b, c, d];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const byte = (values[i] >>> (j * 8)) & 0xff;
      output += hexChars.charAt((byte >>> 4) & 0x0f) + hexChars.charAt(byte & 0x0f);
    }
  }
  return output;
}

interface HashResult {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

const ALGORITHMS = [
  { key: 'md5', name: 'MD5', bits: 128, color: 'text-amber-400', border: 'border-amber-500/30' },
  { key: 'sha1', name: 'SHA-1', bits: 160, color: 'text-cyan-400', border: 'border-cyan-500/30' },
  { key: 'sha256', name: 'SHA-256', bits: 256, color: 'text-emerald-400', border: 'border-emerald-500/30' },
  { key: 'sha512', name: 'SHA-512', bits: 512, color: 'text-purple-400', border: 'border-purple-500/30' },
] as const;

export default function HashWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState('Hello, World!');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [isUpperCase, setIsUpperCase] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hashes, setHashes] = useState<HashResult>({
    md5: '',
    sha1: '',
    sha256: '',
    sha512: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute hashes for an ArrayBuffer / Uint8Array
  const computeHashesFromBuffer = useCallback(async (buffer: ArrayBuffer) => {
    setIsProcessing(true);
    try {
      const uint8 = new Uint8Array(buffer);
      // 1. MD5
      const md5Hash = calculateMD5(uint8);

      // 2. Web Crypto API for SHA family
      const [sha1Buffer, sha256Buffer, sha512Buffer] = await Promise.all([
        crypto.subtle.digest('SHA-1', buffer),
        crypto.subtle.digest('SHA-256', buffer),
        crypto.subtle.digest('SHA-512', buffer),
      ]);

      const bufferToHex = (buf: ArrayBuffer) =>
        Array.from(new Uint8Array(buf))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

      setHashes({
        md5: md5Hash,
        sha1: bufferToHex(sha1Buffer),
        sha256: bufferToHex(sha256Buffer),
        sha512: bufferToHex(sha512Buffer),
      });
    } catch (err) {
      console.error('Hash calculation error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Compute for text
  useEffect(() => {
    if (inputMode === 'text') {
      if (inputText === '') {
        setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
        return;
      }
      const encoder = new TextEncoder();
      const buffer = encoder.encode(inputText).buffer;
      computeHashesFromBuffer(buffer as ArrayBuffer);
    }
  }, [inputText, inputMode, computeHashesFromBuffer]);

  // Handle file select
  const handleFile = (file: File) => {
    setFileInfo({ name: file.name, size: file.size });
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        computeHashesFromBuffer(reader.result);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setInputMode('file');
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const formatHash = (hash: string) => {
    if (!hash) return '';
    return isUpperCase ? hash.toUpperCase() : hash.toLowerCase();
  };

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const copyAllHashes = () => {
    const lines = ALGORITHMS.map(
      algo => `${algo.name}: ${formatHash(hashes[algo.key as keyof HashResult])}`
    ).join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Controls: Mode Switch & Settings */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border-subtle)]">
          <button
            onClick={() => setInputMode('text')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              inputMode === 'text'
                ? 'bg-[var(--accent-devsec)] text-black shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isFr ? 'Texte' : 'Text Input'}
          </button>
          <button
            onClick={() => setInputMode('file')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              inputMode === 'file'
                ? 'bg-[var(--accent-devsec)] text-black shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isFr ? 'Fichier' : 'File Hash'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Case Toggle */}
          <button
            onClick={() => setIsUpperCase(!isUpperCase)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--glass-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title={isFr ? 'Basculer majuscules / minuscules' : 'Toggle Uppercase / Lowercase'}
          >
            <span className="font-bold text-[var(--text-primary)]">
              {isUpperCase ? 'UPPERCASE' : 'lowercase'}
            </span>
          </button>

          {/* Copy All Button */}
          <button
            onClick={copyAllHashes}
            disabled={!hashes.md5}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] disabled:opacity-40 transition-colors"
          >
            {allCopied ? (
              <>
                <span className="text-emerald-400">✓</span>
                <span className="text-emerald-400">{isFr ? 'Tous copiés !' : 'All Copied!'}</span>
              </>
            ) : (
              <>
                <span>📋</span>
                <span>{isFr ? 'Copier tout' : 'Copy All'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Input Section */}
      {inputMode === 'text' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <label htmlFor="hash-text-input" className="font-medium">
              {isFr ? 'Texte à hacher' : 'Input Text to Hash'}
            </label>
            <div className="flex items-center gap-3">
              <span>
                {new TextEncoder().encode(inputText).length} {isFr ? 'octets' : 'bytes'} • {inputText.length} {isFr ? 'caractères' : 'chars'}
              </span>
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {isFr ? 'Effacer' : 'Clear'}
                </button>
              )}
            </div>
          </div>
          <textarea
            id="hash-text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isFr ? 'Entrez votre texte ici pour calculer les sommes de contrôle...' : 'Enter text here to generate hashes...'}
            rows={4}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3.5 font-mono text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-devsec)] transition-all resize-y"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-[var(--accent-devsec)] bg-[var(--accent-devsec)]/10 scale-[1.01]'
                : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--text-muted)]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-[var(--border-subtle)] flex items-center justify-center text-2xl">
                📁
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {isFr ? 'Glissez-déposez un fichier ici ou cliquez pour parcourir' : 'Drag & drop any file here, or click to browse'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {isFr ? 'Calcul 100% sécurisé et local dans votre navigateur' : 'Processed 100% locally in your browser'}
              </p>
            </div>
          </div>

          {fileInfo && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="text-emerald-400">📄</span>
                <span className="font-mono text-[var(--text-primary)] truncate">{fileInfo.name}</span>
                <span className="text-[var(--text-muted)]">({formatFileSize(fileInfo.size)})</span>
              </div>
              <button
                onClick={() => {
                  setFileInfo(null);
                  setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
                }}
                className="text-[var(--text-muted)] hover:text-rose-400 transition-colors ml-2"
              >
                {isFr ? 'Supprimer' : 'Remove'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hashes Output Cards */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
          <span>{isFr ? 'Empreintes cryptographiques générées' : 'Calculated Cryptographic Hashes'}</span>
          {isProcessing && (
            <span className="text-amber-400 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {isFr ? 'Calcul en cours...' : 'Computing...'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {ALGORITHMS.map((algo) => {
            const rawHash = hashes[algo.key as keyof HashResult];
            const displayHash = formatHash(rawHash);
            const isCopied = copiedKey === algo.key;

            return (
              <div
                key={algo.key}
                className="group relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 transition-all hover:border-[var(--glass-border)]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold tracking-wider ${algo.color}`}>
                      {algo.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {algo.bits} bits ({rawHash ? rawHash.length : 0} hex)
                    </span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(displayHash, algo.key)}
                    disabled={!displayHash}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      isCopied
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[var(--border-subtle)] hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <span>✓</span>
                        <span>{isFr ? 'Copié' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <span>📋</span>
                        <span>{isFr ? 'Copier' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={displayHash || (isProcessing ? '...' : '')}
                    placeholder={isFr ? 'En attente de texte ou de fichier...' : 'Waiting for input...'}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 font-mono text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none select-all"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
