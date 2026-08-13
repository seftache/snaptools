"use client";

import React, { useState, useEffect } from 'react';
import { Search, Fingerprint, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HashIdentifierWidget({ locale }: { locale: string }) {
  const [hash, setHash] = useState('');
  const [results, setResults] = useState<{name: string, confidence: number}[]>([]);
  const [analysis, setAnalysis] = useState<{length: number, format: string, chars: string} | null>(null);

  useEffect(() => {
    identifyHash(hash);
  }, [hash]);

  const identifyHash = (input: string) => {
    const cleanHash = input.trim();
    if (!cleanHash) {
      setResults([]);
      setAnalysis(null);
      return;
    }

    const length = cleanHash.length;
    const isHex = /^[a-fA-F0-9]+$/.test(cleanHash);
    const isNumeric = /^[0-9]+$/.test(cleanHash);
    const isAlphaNum = /^[a-zA-Z0-9]+$/.test(cleanHash);
    
    let format = 'Unknown';
    if (isNumeric) format = 'Numeric';
    else if (isHex) format = 'Hexadecimal';
    else if (isAlphaNum) format = 'Alphanumeric';
    else format = 'Special/Custom';

    setAnalysis({
      length,
      format,
      chars: isHex ? '0-9, a-f' : isNumeric ? '0-9' : 'Mixed'
    });

    const matches: {name: string, confidence: number}[] = [];

    if (cleanHash.startsWith('$2a$') || cleanHash.startsWith('$2b$') || cleanHash.startsWith('$2y$')) {
      matches.push({ name: 'bcrypt', confidence: 99 });
    } else if (cleanHash.startsWith('$argon2')) {
      matches.push({ name: 'Argon2', confidence: 99 });
    } else if (cleanHash.startsWith('$1$')) {
      matches.push({ name: 'MD5 Crypt', confidence: 95 });
    } else if (cleanHash.startsWith('$6$')) {
      matches.push({ name: 'SHA-512 Crypt', confidence: 95 });
    } else if (cleanHash.startsWith('$5$')) {
      matches.push({ name: 'SHA-256 Crypt', confidence: 95 });
    } else if (isHex) {
      switch (length) {
        case 32:
          matches.push({ name: 'MD5', confidence: 90 });
          matches.push({ name: 'MD4', confidence: 70 });
          matches.push({ name: 'NTLM', confidence: 60 });
          break;
        case 40:
          matches.push({ name: 'SHA-1', confidence: 90 });
          matches.push({ name: 'MySQL5', confidence: 70 });
          break;
        case 56:
          matches.push({ name: 'SHA-224', confidence: 90 });
          matches.push({ name: 'SHA3-224', confidence: 80 });
          break;
        case 64:
          matches.push({ name: 'SHA-256', confidence: 95 });
          matches.push({ name: 'SHA3-256', confidence: 80 });
          matches.push({ name: 'BLAKE2s', confidence: 70 });
          break;
        case 96:
          matches.push({ name: 'SHA-384', confidence: 95 });
          matches.push({ name: 'SHA3-384', confidence: 80 });
          break;
        case 128:
          matches.push({ name: 'SHA-512', confidence: 95 });
          matches.push({ name: 'SHA3-512', confidence: 80 });
          matches.push({ name: 'Whirlpool', confidence: 70 });
          matches.push({ name: 'BLAKE2b', confidence: 60 });
          break;
        default:
          matches.push({ name: 'Unknown Hex Hash', confidence: 0 });
      }
    } else {
      matches.push({ name: 'Unknown Format', confidence: 0 });
    }

    setResults(matches.sort((a, b) => b.confidence - a.confidence));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '1rem', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Fingerprint size={24} style={{ color: 'var(--text-primary)' }} />
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600 }}>Hash Identifier</h2>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder="Paste hash string here..."
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontFamily: 'monospace'
          }}
        />
      </div>

      <AnimatePresence>
        {hash && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Activity size={24} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Length</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.125rem' }}>{analysis.length} chars</div>
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={24} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Format & Charset</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.125rem' }}>{analysis.format}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', margin: '0 0 1rem 0' }}>Possible Hash Types</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {results.length > 0 && results[0].confidence > 0 ? (
                  results.map((result, i) => (
                    <div key={i} style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '1.125rem' }}>{result.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '100px', height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${result.confidence}%`, height: '100%', background: result.confidence > 80 ? '#10b981' : result.confidence > 50 ? '#f59e0b' : '#ef4444', borderRadius: '3px' }} />
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', minWidth: '40px', textAlign: 'right' }}>{result.confidence}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', borderRadius: '0.5rem', border: '1px dashed var(--border-subtle)' }}>
                    No standard hash types identified for this input.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
