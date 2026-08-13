"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowRight, Loader2, Copy } from 'lucide-react';

const SYNONYM_MAP: Record<string, string[]> = {
  "important": ["crucial", "essential", "significant", "vital"],
  "good": ["excellent", "superb", "great", "fine"],
  "bad": ["awful", "terrible", "poor", "inferior"],
  "happy": ["joyful", "cheerful", "delighted", "content"],
  "sad": ["unhappy", "depressed", "sorrowful", "miserable"],
  "big": ["large", "huge", "gigantic", "massive"],
  "small": ["tiny", "little", "miniature", "compact"],
  "fast": ["quick", "rapid", "swift", "speedy"],
  "slow": ["sluggish", "leisurely", "gradual", "unhurried"],
  "smart": ["intelligent", "clever", "brilliant", "sharp"],
  "dumb": ["stupid", "foolish", "ignorant", "unwise"],
  "beautiful": ["gorgeous", "stunning", "pretty", "attractive"],
  "ugly": ["hideous", "unattractive", "unsightly", "plain"],
  "make": ["create", "build", "construct", "produce"],
  "use": ["utilize", "employ", "apply", "operate"],
  "help": ["assist", "aid", "support", "guide"],
  "change": ["modify", "alter", "transform", "adjust"],
  "show": ["display", "exhibit", "reveal", "demonstrate"],
};

export default function ArticleSpinnerWidget({ locale }: { locale: string }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const spinArticle = () => {
    if (!text.trim()) return;
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      let spunText = text;
      const words = text.split(/(\b[a-zA-Z]+\b)/); // Keep delimiters
      
      const newWords = words.map(word => {
        const lowerWord = word.toLowerCase();
        if (SYNONYM_MAP[lowerWord] && Math.random() > 0.3) { // 70% chance to replace
          const synonyms = SYNONYM_MAP[lowerWord];
          const replacement = synonyms[Math.floor(Math.random() * synonyms.length)];
          // Maintain capitalization
          if (word[0] === word[0].toUpperCase()) {
            return replacement.charAt(0).toUpperCase() + replacement.slice(1);
          }
          return replacement;
        }
        return word;
      });
      
      setResult(newWords.join(''));
      setLoading(false);
    }, 800);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 backdrop-blur-xl">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-purple-400" />
          Article Spinner
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">Original Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-64 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
              placeholder="Paste your article here..."
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {text.length} characters
              </span>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center opacity-50">
            <ArrowRight className="w-8 h-8 text-[var(--text-primary)] mb-8" />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300 flex justify-between">
              Spun Text
              {result && (
                <button onClick={copyToClipboard} className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </label>
            <div className={`w-full h-64 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 text-[var(--text-primary)] overflow-y-auto ${loading ? 'opacity-50' : ''}`}>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-purple-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p>Spinning article...</p>
                </div>
              ) : result ? (
                <p className="whitespace-pre-wrap">{result}</p>
              ) : (
                <p className="text-gray-500 italic flex items-center justify-center h-full">
                  Your rewritten article will appear here...
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={spinArticle}
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Spin Article
          </button>
        </div>
      </div>
    </div>
  );
}
