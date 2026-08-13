"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, AlertCircle, Sparkles, User, Eye, Music } from 'lucide-react';

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 6.27 6.36 6.34 6.34 0 0 0 6.27-6.36v-9.4a8.61 8.61 0 0 0 3.77 1.83z"/>
  </svg>
);

interface VideoData {
  title: string;
  cover: string;
  play: string;
  hdplay?: string;
  music: string;
  author: {
    nickname: string;
  };
  play_count?: number;
}

export default function TiktokDownloaderWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoData | null>(null);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();

      if (data.code === 0 && data.data) {
        setResult({
          title: data.data.title || (isFr ? 'Vidéo TikTok' : 'TikTok Video'),
          cover: data.data.cover || data.data.origin_cover,
          play: data.data.play,
          hdplay: data.data.hdplay,
          music: data.data.music,
          author: {
            nickname: data.data.author?.nickname || '@user',
          },
          play_count: data.data.play_count,
        });
      } else {
        throw new Error(data.msg || (isFr ? 'Lien TikTok invalide ou vidéo privée/supprimée.' : 'Invalid TikTok link or video is private.'));
      }
    } catch (err: any) {
      setError(err.message || (isFr ? 'Impossible de récupérer cette vidéo. Vérifiez le lien.' : 'Could not fetch video. Check the link.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-pink-500/10 opacity-50 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-pink-500/20 text-[var(--text-primary)]">
            <TiktokIcon className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {isFr ? 'Téléchargeur TikTok Sans Filigrane' : 'TikTok Downloader Without Watermark'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {isFr ? 'Qualité HD 1080p directe • 100% Gratuit & Rapide' : 'Direct 1080p HD Quality • 100% Free & Fast'}
            </p>
          </div>
        </div>

        <form onSubmit={handleDownload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {isFr ? 'Collez le lien de la vidéo TikTok :' : 'Paste TikTok video URL:'}
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@user/video/..."
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl py-3.5 px-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder:text-[var(--text-muted)] text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-pink-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isFr ? 'Extraction de la vidéo en cours...' : 'Extracting video...'}
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
              <AlertCircle className="w-5 h-5 shrink-0" />
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
              <div className="flex gap-4 items-start">
                {result.cover && (
                  <img
                    src={result.cover}
                    alt="Cover"
                    className="w-24 h-32 object-cover rounded-lg border border-white/10 shadow-md flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-pink-400 font-medium mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{result.author.nickname}</span>
                    {result.play_count !== undefined && (
                      <span className="text-gray-400 flex items-center gap-1 ml-auto">
                        <Eye className="w-3 h-3" /> {result.play_count.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">
                    {result.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isFr ? 'Prêt au téléchargement HD' : 'Ready for HD download'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <a
                  href={result.hdplay || result.play}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="tiktok_video_hd.mp4"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Download className="w-4 h-4" />
                  {isFr ? 'Télécharger Vidéo (Sans Logo)' : 'Download Video (No Watermark)'}
                </a>

                {result.music && (
                  <a
                    href={result.music}
                    target="_blank"
                    rel="noopener noreferrer"
                    download="tiktok_audio.mp3"
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all border border-white/10"
                  >
                    <Music className="w-4 h-4 text-cyan-400" />
                    {isFr ? 'Télécharger Audio (MP3)' : 'Download Audio (MP3)'}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
