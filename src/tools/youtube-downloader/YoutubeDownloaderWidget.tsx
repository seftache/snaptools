"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Download, Loader2, AlertCircle, Music, Image as ImageIcon, Sparkles, ExternalLink } from 'lucide-react';

export default function YoutubeDownloaderWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{
    id: string;
    title: string;
    thumbnail: string;
  } | null>(null);

  const extractVideoId = (inputUrl: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = inputUrl.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setVideoInfo(null);

    const id = extractVideoId(url.trim());
    if (!id) {
      setError(isFr ? 'Lien YouTube invalide. Veuillez entrer une URL YouTube valide (ex: https://youtube.com/watch?v=...)' : 'Invalid YouTube URL.');
      setLoading(false);
      return;
    }

    try {
      // Fetch oEmbed title from YouTube's public API
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
      const data = await res.json();

      setVideoInfo({
        id,
        title: data.title || (isFr ? 'Vidéo YouTube' : 'YouTube Video'),
        thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      });
    } catch {
      setVideoInfo({
        id,
        title: isFr ? 'Vidéo YouTube HD' : 'YouTube HD Video',
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 opacity-50 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-red-500/20 text-red-500">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {isFr ? 'Téléchargeur YouTube MP4 / MP3' : 'YouTube Video & Audio Downloader'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {isFr ? 'Extraction HD 1080p, 720p, MP3 & Miniature • 100% Gratuit' : '1080p, 720p, MP3 & Thumbnail extraction • 100% Free'}
            </p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {isFr ? 'Collez le lien de la vidéo YouTube :' : 'Paste YouTube Video URL:'}
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl py-3.5 px-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-[var(--text-muted)] text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-red-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isFr ? 'Analyse de la vidéo...' : 'Analyzing video...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {isFr ? 'Analyser & Obtenir les Liens' : 'Analyze & Get Links'}
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

          {videoInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 p-5 rounded-xl bg-black/40 border border-white/10 space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg`;
                  }}
                  className="w-full sm:w-44 h-28 object-cover rounded-lg border border-white/10 shadow-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full">
                    YouTube HD
                  </span>
                  <h3 className="text-sm font-semibold text-white mt-1.5 line-clamp-2">
                    {videoInfo.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">ID: {videoInfo.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <a
                  href={`https://yt1s.com.co/en/youtube-to-mp4?url=https://www.youtube.com/watch?v=${videoInfo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-500/20"
                >
                  <Download className="w-4 h-4" />
                  {isFr ? 'Télécharger Vidéo MP4 (HD)' : 'Download MP4 Video (HD)'}
                </a>

                <a
                  href={`https://yt1s.com.co/en/youtube-to-mp3?url=https://www.youtube.com/watch?v=${videoInfo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all border border-white/10"
                >
                  <Music className="w-4 h-4 text-rose-400" />
                  {isFr ? 'Télécharger Audio MP3' : 'Download MP3 Audio'}
                </a>

                <a
                  href={videoInfo.thumbnail}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="thumbnail.jpg"
                  className="sm:col-span-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-medium transition-all border border-white/5"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />
                  {isFr ? 'Télécharger la Miniature en Haute Résolution (HD)' : 'Download HD Thumbnail'}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
