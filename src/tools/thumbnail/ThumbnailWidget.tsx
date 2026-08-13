"use client";

import React, { useState, useEffect, useMemo } from "react";

interface ThumbnailQuality {
  id: string;
  name: { en: string; fr: string };
  resolution: string;
  badge: string;
  badgeColor: string;
  filename: string;
}

const QUALITIES: ThumbnailQuality[] = [
  {
    id: 'maxres',
    name: { en: 'Maximum Resolution (HD)', fr: 'Résolution Maximale (HD)' },
    resolution: '1280 × 720',
    badge: '1080p / 720p HD',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    filename: 'maxresdefault.jpg',
  },
  {
    id: 'sd',
    name: { en: 'Standard Definition (SD)', fr: 'Définition Standard (SD)' },
    resolution: '640 × 480',
    badge: '480p SD',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    filename: 'sddefault.jpg',
  },
  {
    id: 'hq',
    name: { en: 'High Quality (HQ)', fr: 'Haute Qualité (HQ)' },
    resolution: '480 × 360',
    badge: 'HQ',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    filename: 'hqdefault.jpg',
  },
  {
    id: 'mq',
    name: { en: 'Medium Quality (MQ)', fr: 'Qualité Moyenne (MQ)' },
    resolution: '320 × 180',
    badge: 'MQ',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    filename: 'mqdefault.jpg',
  },
  {
    id: 'default',
    name: { en: 'Default Thumbnail', fr: 'Miniature par Défaut' },
    resolution: '120 × 90',
    badge: 'Mini',
    badgeColor: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
    filename: 'default.jpg',
  },
];

const SAMPLE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

// Extract YouTube Video ID from any URL format
function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If directly 11-char alphanumeric ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common YouTube URL regex
  const regExp = /(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);

  return match ? match[1] : null;
}

export default function ThumbnailWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [inputUrl, setInputUrl] = useState(SAMPLE_URL);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const videoId = useMemo(() => extractYouTubeId(inputUrl), [inputUrl]);

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const handleDownload = async (url: string, qualityId: string) => {
    if (!videoId) return;
    setDownloadingKey(qualityId);
    const filename = `youtube-${videoId}-${qualityId}.jpg`;

    try {
      // Try direct blob fetch
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback via Image & Canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
          } else {
            window.open(url, '_blank');
          }
        });
      };
      img.onerror = () => {
        window.open(url, '_blank');
      };
      img.src = url;
    } finally {
      setTimeout(() => setDownloadingKey(null), 1000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Input Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder={isFr ? 'Collez un lien YouTube (ex: https://youtu.be/...)' : 'Paste YouTube URL (e.g. https://www.youtube.com/watch?v=...)'}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-devsec)] transition-all font-mono"
            />
            {inputUrl && (
              <button
                onClick={() => setInputUrl('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputUrl(SAMPLE_URL)}
              className="px-4 py-3.5 rounded-xl text-xs font-semibold bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
            >
              {isFr ? 'Exemple' : 'Try Sample'}
            </button>
          </div>
        </div>

        {/* Video ID & Status Bar */}
        {videoId ? (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓ {isFr ? 'Vidéo détectée :' : 'Video Detected:'}</span>
              <span className="font-mono bg-[var(--bg-base)] px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-300">
                ID: {videoId}
              </span>
            </div>

            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>{isFr ? 'Ouvrir sur YouTube' : 'Open on YouTube'}</span>
              <span>↗</span>
            </a>
          </div>
        ) : inputUrl ? (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{isFr ? 'Lien YouTube non reconnu. Vérifiez le format de l\'URL.' : 'Invalid YouTube URL or ID. Please check the format.'}</span>
          </div>
        ) : null}
      </div>

      {/* Thumbnails Display Grid */}
      {videoId ? (
        <div className="space-y-4 pt-2">
          <div className="text-xs text-[var(--text-secondary)] font-medium">
            {isFr ? 'Miniatures disponibles en téléchargement :' : 'Available Thumbnail Resolutions:'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUALITIES.map((q) => {
              const imgUrl = `https://img.youtube.com/vi/${videoId}/${q.filename}`;
              const isCopied = copiedKey === q.id;
              const isDownloading = downloadingKey === q.id;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden flex flex-col group hover:border-[var(--glass-border)] transition-all shadow-md"
                >
                  {/* Image Preview Container */}
                  <div className="relative aspect-video w-full bg-black/40 flex items-center justify-center overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={`${q.name[isFr ? 'fr' : 'en']} - ${videoId}`}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Quality Badge Overlay */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border backdrop-blur-md shadow-sm ${q.badgeColor}`}>
                        {q.badge}
                      </span>
                    </div>

                    {/* Resolution Tag */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-white/90">
                      {q.resolution}
                    </div>
                  </div>

                  {/* Details and Actions */}
                  <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                        {q.name[isFr ? 'fr' : 'en']}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                        {q.filename} • {q.resolution}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(imgUrl, q.id)}
                        disabled={isDownloading}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[var(--accent-devsec)] text-black hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            <span>{isFr ? 'Téléchargement...' : 'Downloading...'}</span>
                          </>
                        ) : (
                          <>
                            <span>💾</span>
                            <span>{isFr ? 'Télécharger' : 'Download'}</span>
                          </>
                        )}
                      </button>

                      {/* Copy Link Button */}
                      <button
                        onClick={() => handleCopyUrl(imgUrl, q.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                          isCopied
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-[var(--bg-base)] border-[var(--border-subtle)] hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <span>✓</span>
                            <span>{isFr ? 'Copié' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <span>📋</span>
                            <span>{isFr ? 'Lien' : 'Link'}</span>
                          </>
                        )}
                      </button>

                      {/* Open in New Tab */}
                      <a
                        href={imgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-xs font-medium bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        title={isFr ? 'Ouvrir l\'image dans un nouvel onglet' : 'Open image in new tab'}
                      >
                        ↗
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-2">
          <div className="text-4xl">🎬</div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {isFr ? 'Entrez un lien YouTube pour prévisualiser les miniatures' : 'Enter a YouTube link above to preview all thumbnail resolutions'}
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            {isFr
              ? 'Prend en charge les vidéos standard, YouTube Shorts, YouTube Live et les identifiants vidéo.'
              : 'Supports standard videos, YouTube Shorts, YouTube Live, and video IDs.'}
          </p>
        </div>
      )}
    </div>
  );
}
