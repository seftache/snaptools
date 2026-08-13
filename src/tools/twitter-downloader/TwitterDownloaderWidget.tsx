"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function TwitterDownloaderWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tweetId, setTweetId] = useState<string | null>(null);

  const extractTweetId = (inputUrl: string): string | null => {
    const match = inputUrl.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/);
    return match ? match[3] : null;
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setTweetId(null);

    const id = extractTweetId(url.trim());
    if (!id) {
      setError(
        isFr
          ? 'Lien Twitter/X non valide. Exemple valide : https://x.com/user/status/123456789'
          : 'Invalid Twitter/X URL. Example: https://x.com/user/status/123456789'
      );
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setTweetId(id);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-blue-500/10 opacity-50 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400">
            <XIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {isFr ? 'Téléchargeur Vidéo Twitter / X' : 'Twitter / X Video Downloader'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {isFr ? 'Téléchargement HD MP4 • Sans filigrane • 100% Gratuit' : 'HD MP4 Download • No watermark • 100% Free'}
            </p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {isFr ? 'Collez le lien du post Twitter / X :' : 'Paste Twitter / X Post URL:'}
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://x.com/user/status/..."
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl py-3.5 px-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all placeholder:text-[var(--text-muted)] text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-sky-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isFr ? 'Détection de la vidéo...' : 'Extracting video...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {isFr ? 'Obtenir la Vidéo HD' : 'Get HD Video'}
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

          {tweetId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 p-5 rounded-xl bg-black/40 border border-white/10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400">
                  <XIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full">
                    Post X / Twitter
                  </span>
                  <h3 className="text-sm font-semibold text-white mt-1">
                    {isFr ? `Vidéo prête au téléchargement (ID: ${tweetId})` : `Video ready for download (ID: ${tweetId})`}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <a
                  href={`https://twitsave.com/info?url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-sky-500/20"
                >
                  <Download className="w-4 h-4" />
                  {isFr ? 'Télécharger la Vidéo (HD)' : 'Download Video (HD)'}
                </a>

                <a
                  href={`https://ssstwitter.com/en?url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all border border-white/10"
                >
                  <ExternalLink className="w-4 h-4 text-sky-400" />
                  {isFr ? 'Serveur Alternatif HD' : 'Alternative Server HD'}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
