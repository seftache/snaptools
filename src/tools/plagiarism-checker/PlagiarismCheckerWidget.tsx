"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, Loader2, FileText } from 'lucide-react';

export default function PlagiarismCheckerWidget({ locale }: { locale: string }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [score, setScore] = useState(0);

  const checkPlagiarism = () => {
    if (!text.trim()) return;
    setLoading(true);
    setResults(null);
    
    // Mocking the checking process
    setTimeout(() => {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const mockResults = sentences.map(sentence => {
        const isPlagiarized = Math.random() > 0.7; // 30% chance of being flagged
        return {
          text: sentence.trim(),
          isPlagiarized,
          sources: isPlagiarized ? [
            "https://en.wikipedia.org/wiki/Special:Random",
            "https://example.com/article"
          ] : []
        };
      });
      
      const flaggedCount = mockResults.filter(r => r.isPlagiarized).length;
      const uniqueness = Math.round(((mockResults.length - flaggedCount) / mockResults.length) * 100);
      
      setScore(uniqueness);
      setResults(mockResults);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 backdrop-blur-xl">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Search className="w-6 h-6 text-orange-400" />
          Plagiarism Checker
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-64 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none"
              placeholder="Paste text here to check for plagiarism (minimum 20 words recommended)..."
            />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {text.split(/\s+/).filter(Boolean).length} words
              </span>
              <button
                onClick={checkPlagiarism}
                disabled={loading || text.length < 10}
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Check Plagiarism
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-1 border border-[var(--border-subtle)] bg-[var(--bg-elevated)] rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden">
            {results ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center w-full"
              >
                <div className="relative inline-flex items-center justify-center mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      className="text-[var(--border-subtle)]"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className={score > 80 ? "text-green-500" : score > 50 ? "text-yellow-500" : "text-red-500"}
                      strokeWidth="8"
                      strokeDasharray={364}
                      strokeDashoffset={364 - (364 * score) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                  </svg>
                  <span className="absolute text-3xl font-bold text-[var(--text-primary)]">{score}%</span>
                </div>
                <h3 className="text-xl font-medium text-[var(--text-primary)] mb-1">Unique Content</h3>
                <p className="text-sm text-gray-400">
                  {100 - score}% plagiarized text detected
                </p>
              </motion.div>
            ) : (
              <div className="text-center text-gray-500 space-y-4">
                <FileText className="w-16 h-16 mx-auto opacity-20" />
                <p>Run the checker to see your uniqueness score</p>
              </div>
            )}
          </div>
        </div>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 pt-8 border-t border-[var(--border-subtle)] space-y-4"
          >
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Detailed Results</h3>
            <div className="space-y-4">
              {results.map((res, i) => (
                <div key={i} className={`p-4 rounded-xl border ${res.isPlagiarized ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'}`}>
                  <div className="flex items-start gap-3">
                    {res.isPlagiarized ? (
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-[var(--text-primary)] ${res.isPlagiarized ? 'bg-red-500/20 px-1 rounded' : ''}`}>
                        {res.text}
                      </p>
                      {res.isPlagiarized && (
                        <div className="mt-2 text-sm text-gray-400">
                          <span className="font-medium">Potential sources: </span>
                          <a href={res.sources[0]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            Source 1
                          </a>,{' '}
                          <a href={res.sources[1]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            Source 2
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
