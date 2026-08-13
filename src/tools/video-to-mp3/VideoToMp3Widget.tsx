"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Upload, Download, Loader2, AlertCircle, Sparkles, FileAudio, Link2 } from 'lucide-react';

export default function VideoToMp3Widget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('extracted-audio.wav');
  const [extractedFromUrl, setExtractedFromUrl] = useState<{
    type: string;
    targetUrl: string;
  } | null>(null);

  // Client-side Web Audio API Video-to-Audio Extractor for local files
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setFileName(file.name.replace(/\.[^/.]+$/, '') + '.wav');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Convert AudioBuffer to WAV Blob
      const wavBlob = audioBufferToWavBlob(decodedBuffer);
      const generatedUrl = URL.createObjectURL(wavBlob);
      setAudioUrl(generatedUrl);
    } catch (err: any) {
      setError(
        isFr
          ? 'Impossible de lire la piste audio de cette vidéo. Assurez-vous que le format vidéo (MP4, WEBM, MOV) contient une piste audio valide.'
          : 'Could not extract audio from this video file. Ensure it contains an audio track.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Online URL conversion
  const handleUrlConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setExtractedFromUrl(null);

    const isTiktok = url.includes('tiktok.com');
    const isYt = url.includes('youtube.com') || url.includes('youtu.be');

    if (isTiktok) {
      try {
        const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url.trim())}`);
        const data = await res.json();
        if (data.code === 0 && data.data?.music) {
          setAudioUrl(data.data.music);
          setFileName('tiktok-audio.mp3');
          setExtractedFromUrl({ type: 'TikTok MP3', targetUrl: data.data.music });
          setLoading(false);
          return;
        }
      } catch {}
    }

    if (isYt) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
      const match = url.match(regExp);
      const id = match && match[2].length === 11 ? match[2] : null;
      if (id) {
        setExtractedFromUrl({
          type: 'YouTube Audio',
          targetUrl: `https://yt1s.com.co/en/youtube-to-mp3?url=https://www.youtube.com/watch?v=${id}`,
        });
        setLoading(false);
        return;
      }
    }

    setExtractedFromUrl({
      type: 'Audio Web',
      targetUrl: `https://snapinsta.to/?url=${encodeURIComponent(url)}`,
    });
    setLoading(false);
  };

  // Convert AudioBuffer to 16-bit PCM WAV Blob
  const audioBufferToWavBlob = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sampleRate = buffer.sampleRate;
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => {
      out.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      out.setUint32(pos, data, true);
      pos += 4;
    };

    // RIFF identifier
    out.setUint8(0, 'R'.charCodeAt(0));
    out.setUint8(1, 'I'.charCodeAt(0));
    out.setUint8(2, 'F'.charCodeAt(0));
    out.setUint8(3, 'F'.charCodeAt(0));
    pos = 4;
    setUint32(length - 8); // file length - 8
    out.setUint8(pos++, 'W'.charCodeAt(0));
    out.setUint8(pos++, 'A'.charCodeAt(0));
    out.setUint8(pos++, 'V'.charCodeAt(0));
    out.setUint8(pos++, 'E'.charCodeAt(0));
    out.setUint8(pos++, 'f'.charCodeAt(0));
    out.setUint8(pos++, 'm'.charCodeAt(0));
    out.setUint8(pos++, 't'.charCodeAt(0));
    out.setUint8(pos++, ' '.charCodeAt(0));
    setUint32(16); // subchunk1size (16 for PCM)
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample
    out.setUint8(pos++, 'd'.charCodeAt(0));
    out.setUint8(pos++, 'a'.charCodeAt(0));
    out.setUint8(pos++, 't'.charCodeAt(0));
    out.setUint8(pos++, 'a'.charCodeAt(0));
    setUint32(length - pos - 4); // subchunk2size

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (offset < buffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([out.buffer], { type: 'audio/wav' });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent opacity-50 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {isFr ? 'Convertisseur Vidéo en MP3 / Audio' : 'Video to MP3 / Audio Converter'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {isFr ? 'Extraction haute fidélité • Fichier local ou URL en ligne' : 'High quality extraction • Local file or Online URL'}
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'upload' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            {isFr ? 'Fichier Vidéo (PC / Mobile)' : 'Video File (Upload)'}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('url');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'url' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Link2 className="w-4 h-4" />
            {isFr ? 'Lien en Ligne (YouTube, TikTok...)' : 'Online Video URL'}
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-subtle)] hover:border-indigo-500/50 rounded-2xl p-10 text-center cursor-pointer transition-all bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)] group">
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileAudio className="w-7 h-7 text-indigo-400" />
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                {isFr ? 'Choisissez un fichier vidéo à convertir' : 'Choose a video file to convert'}
              </span>
              <span className="text-xs text-[var(--text-muted)]">MP4, WEBM, MOV, AVI, MKV</span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                disabled={loading}
                onChange={handleFileUpload}
              />
            </label>
          </div>
        ) : (
          <form onSubmit={handleUrlConvert} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {isFr ? 'Collez le lien de la vidéo :' : 'Paste Video URL:'}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... ou https://www.tiktok.com/..."
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl py-3.5 px-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-[var(--text-muted)] text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-indigo-500/20"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {isFr ? 'Extraire la Piste Audio' : 'Extract Audio Track'}
            </button>
          </form>
        )}

        {loading && (
          <div className="mt-6 flex items-center justify-center gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{isFr ? 'Traitement audio en cours...' : 'Processing audio...'}</span>
          </div>
        )}

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

          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 p-5 rounded-xl bg-black/40 border border-white/10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <FileAudio className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    {isFr ? 'Audio extrait avec succès' : 'Audio extracted successfully'}
                  </span>
                  <h3 className="text-sm font-semibold text-white mt-1 truncate">
                    {fileName}
                  </h3>
                </div>
              </div>

              <audio controls src={audioUrl} className="w-full rounded-lg" />

              <a
                href={audioUrl}
                download={fileName}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
              >
                <Download className="w-4 h-4" />
                {isFr ? 'Télécharger le fichier Audio' : 'Download Audio File'}
              </a>
            </motion.div>
          )}

          {extractedFromUrl && !audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 p-5 rounded-xl bg-black/40 border border-white/10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                    {extractedFromUrl.type}
                  </span>
                  <h3 className="text-sm font-semibold text-white mt-1">
                    {isFr ? 'Piste audio prête au téléchargement' : 'Audio track ready for download'}
                  </h3>
                </div>
              </div>

              <a
                href={extractedFromUrl.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
              >
                <Download className="w-4 h-4" />
                {isFr ? 'Télécharger Audio MP3 (Haute Qualité)' : 'Download MP3 Audio (High Quality)'}
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
