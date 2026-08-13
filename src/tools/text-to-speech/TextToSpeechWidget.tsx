"use client";

import React, { useState, useEffect } from 'react';
import { Play, Square, Pause, Volume2 } from 'lucide-react';

export default function TextToSpeechWidget({ locale }: { locale: string }) {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        // Try to find a voice matching the locale, or default to the first one
        const defaultVoice = availableVoices.find(v => v.lang.startsWith(locale)) || availableVoices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [locale]);

  const handlePlay = () => {
    if (!text.trim()) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onpause = () => {
      setIsSpeaking(false);
      setIsPaused(true);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 backdrop-blur-xl">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Volume2 className="w-6 h-6 text-indigo-400" />
          Text to Speech
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Voice</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {voices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 flex justify-between">
              <span>Speed</span>
              <span>{rate}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 flex justify-between">
              <span>Pitch</span>
              <span>{pitch}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-48 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
            placeholder="Enter text to be spoken..."
          />
          
          <div className="flex justify-center gap-4">
            {!isSpeaking ? (
              <button
                onClick={handlePlay}
                disabled={!text.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                {isPaused ? 'Resume' : 'Play'}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl transition-colors"
              >
                <Pause className="w-5 h-5" />
                Pause
              </button>
            )}
            
            <button
              onClick={handleStop}
              disabled={!isSpeaking && !isPaused}
              className="flex items-center gap-2 px-6 py-3 bg-red-600/20 text-red-500 hover:bg-red-600/30 rounded-xl transition-colors disabled:opacity-50"
            >
              <Square className="w-5 h-5" />
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
