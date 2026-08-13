"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Type, Loader2 } from 'lucide-react';

export default function GrammarCheckerWidget({ locale }: { locale: string }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const checkGrammar = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://api.languagetoolplus.com/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: text,
          language: locale === 'fr' ? 'fr' : 'en-US',
        }),
      });
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to check grammar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 backdrop-blur-xl">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Type className="w-6 h-6 text-blue-400" />
          Grammar Checker
        </h2>
        
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-48 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
            placeholder="Type or paste your text here..."
          />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">
              {text.length} characters | {text.split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              onClick={checkGrammar}
              disabled={loading || !text.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Check Text
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {results && results.matches && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4"
          >
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              {results.matches.length} {results.matches.length === 1 ? 'Issue' : 'Issues'} Found
            </h3>
            
            {results.matches.length === 0 ? (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                No grammar issues found! Your text looks great.
              </div>
            ) : (
              <div className="space-y-3">
                {results.matches.map((match: any, index: number) => (
                  <div key={index} className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">{match.message}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          "{match.context.text.substring(match.context.offset, match.context.offset + match.context.length)}"
                        </p>
                        {match.replacements.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="text-sm text-gray-500 py-1">Suggestions:</span>
                            {match.replacements.slice(0, 3).map((rep: any, i: number) => (
                              <button
                                key={i}
                                className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
                                onClick={() => {
                                  const newText = text.substring(0, match.offset) + rep.value + text.substring(match.offset + match.length);
                                  setText(newText);
                                  setResults(null);
                                }}
                              >
                                {rep.value}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
