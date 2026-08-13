"use client";
import React, { useState } from 'react';

const SYNONYMS: Record<string, string[]> = {
  good: ['excellent', 'great', 'superb'],
  bad: ['terrible', 'awful', 'poor'],
  happy: ['joyful', 'cheerful', 'content'],
  sad: ['sorrowful', 'unhappy', 'depressed'],
  big: ['large', 'huge', 'gigantic'],
  small: ['tiny', 'little', 'minute'],
  fast: ['quick', 'rapid', 'swift'],
  slow: ['sluggish', 'leisurely', 'unhurried'],
  important: ['crucial', 'essential', 'significant'],
  use: ['utilize', 'employ', 'apply']
};

export default function ParaphraseWidget({ locale }: { locale: string }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const paraphrase = () => {
    let result = input;
    const words = input.match(/\b\w+\b/g) || [];
    let count = 0;
    
    words.forEach(word => {
      const lower = word.toLowerCase();
      if (SYNONYMS[lower]) {
        const options = SYNONYMS[lower];
        const replacement = options[Math.floor(Math.random() * options.length)];
        const isCapitalized = word[0] === word[0].toUpperCase();
        const finalReplacement = isCapitalized ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement;
        
        result = result.replace(new RegExp(`\\b${word}\\b`), finalReplacement);
        count++;
      }
    });

    setOutput(result);
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-xl max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Paraphrase Tool</h2>
        <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-full text-xs font-medium">
          Premium AI Coming Soon
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mb-6">Basic synonym replacement is currently active. Our advanced AI paraphrase engine is in development.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-64 bg-black/30 border border-white/10 rounded-lg p-4 focus:outline-none focus:border-purple-500/50"
          placeholder="Enter text to paraphrase..."
        />
        <textarea
          readOnly
          value={output}
          className="w-full h-64 bg-black/40 border border-purple-500/30 rounded-lg p-4 focus:outline-none text-purple-100"
          placeholder="Paraphrased text will appear here..."
        />
      </div>

      <div className="text-center">
        <button
          onClick={paraphrase}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
        >
          Paraphrase Text
        </button>
      </div>
    </div>
  );
}
