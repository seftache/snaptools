"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Download, Loader2, AlertCircle, Sparkles, Image as ImageIcon, Video, ExternalLink } from 'lucide-react';

export default function InstagramDownloaderWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    shortcode: string;
    type: string;
  } | null>(null);

  const extractShortcode = (inputUrl: string): { shortcode: string; type: string } | null => {
    const reelMatch = inputUrl.match(/instagram\.com\/(?:reel|reels)\/([A-Za-z0-9_-]+)/);
    if (reelMatch) return { shortcode: reelMatch[1], type: 'Reel' };

    const postMatch = inputUrl.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/);
    if (postMatch) return { shortcode: postMatch[1], type: 'Post / Photo' };

    const storyMatch = inputUrl.match(/instagram\.com\/stories\/([A-Za-z0-9_.-]+)\/([0-9]+)/);
    if (storyMatch) return { shortcode: storyMatch[2], type: 'Story' };

    return null;
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const parsed = extractShortcode(url.trim());
    if (!parsed) {
      setError(
        isFr
          ? 'Lien Instagram non reconnu. Veuillez copier un lien de Reel, Post ou Story valide (ex: https://www.instagram.com/reel/...)'
          : 'Invalid Instagram URL. Please paste a valid Reel, Post or Story link.'
      );
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setResult(parsed);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-50 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 text-pink-500">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {isFr ? 'Téléchargeur Instagram Reels & Photos' : 'Instagram Reels & Photos Downloader'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {isFr ? 'Téléchargement HD • Sans filigrane • 100% Gratuit' : 'HD Download • No watermark • 100% Free'}
            </p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {isFr ? 'Collez le lien Instagram (Reel, Post, Story) :' : 'Paste Instagram URL (Reel, Post, Story):'}
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl py-3.5 px-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder:text-[var(--text-muted)] text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-95 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-pink-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isFr ? 'Détection du média...' : 'Analyzing media...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {isFr ? 'Télécharger le Média' : 'Get Media'}
              </>
            )}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-xl text-sm border border-red-400/20"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 p-5 rounded-xl bg-black/40 border border-white/10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-pink-500/10 text-pink-400">
                  {result.type.includes('Reel') ? <Video className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-xs font-semibold text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-full">
                    Instagram {result.type}
                  </span>
                  <h3 className="text-sm font-semibold text-white mt-1">
                    {isFr ? `Média détecté avec succès (${result.shortcode})` : `Media detected (${result.shortcode})`}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <a
                  href={`https://snapinsta.to/?url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-pink-500/20"
                >
                  <Download className="w-4 h-4" />
                  {isFr ? 'Télécharger en Haute Qualité (HD)' : 'Download in High Quality (HD)'}
                </a>

                <a
                  href={`https://saveig.app/en?url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all border border-white/10"
                >
                  <ExternalLink className="w-4 h-4 text-orange-400" />
                  {isFr ? 'Serveur de secours HD' : 'Backup Server (HD)'}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
