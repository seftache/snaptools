"use client";
import React, { useState, useMemo } from 'react';

const STOP_WORDS = new Set(['the', 'is', 'at', 'which', 'on', 'in', 'and', 'a', 'to', 'of', 'for', 'it', 'with', 'as', 'by', 'this', 'that', 'an', 'be', 'are', 'or', 'from', 'but', 'not']);

export default function KeywordDensityWidget({ locale }: { locale: string }) {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const words = text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
    const totalWords = words.length;
    const counts: Record<string, number> = {};
    
    words.forEach(w => {
      if (!STOP_WORDS.has(w)) {
        counts[w] = (counts[w] || 0) + 1;
      }
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({
        word,
        count,
        percentage: totalWords > 0 ? ((count / totalWords) * 100).toFixed(2) : '0'
      }));

    return { totalWords, topKeywords: sorted };
  }, [text]);

  return (
    <div className="p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Keyword Density Checker</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here..."
        className="w-full bg-black/30 border border-white/10 rounded-lg p-4 h-64 focus:outline-none focus:border-teal-500/50 mb-6 transition-colors"
      />
      
      <div className="bg-black/20 rounded-lg p-4 border border-white/5">
        <div className="mb-4 text-sm text-gray-400">Total Words: <span className="text-white font-medium">{stats.totalWords}</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.topKeywords.map((kw, i) => (
            <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-md border border-white/5">
              <span className="font-medium text-teal-200">{kw.word}</span>
              <div className="text-sm">
                <span className="text-gray-400 mr-3">x{kw.count}</span>
                <span className="bg-teal-500/20 text-teal-300 px-2 py-1 rounded text-xs">{kw.percentage}%</span>
              </div>
            </div>
          ))}
          {stats.topKeywords.length === 0 && (
            <div className="text-gray-500 text-sm italic col-span-2">Enter text to see keyword density.</div>
          )}
        </div>
      </div>
    </div>
  );
}
