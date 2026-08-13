"use client";
import React, { useState, useEffect } from 'react';

export default function StopwatchWidget({ locale }: { locale: string }) {
  const [tab, setTab] = useState<'stopwatch' | 'timer'>('stopwatch');

  // Stopwatch State
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  // Timer State
  const [tTime, setTTime] = useState(60);
  const [tInput, setTInput] = useState('60');
  const [tRunning, setTRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (swRunning) {
      interval = setInterval(() => setSwTime(prev => prev + 10), 10);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (tRunning && tTime > 0) {
      interval = setInterval(() => setTTime(prev => prev - 1), 1000);
    } else if (tTime === 0 && tRunning) {
      setTRunning(false);
      alert(locale === 'fr' ? 'Temps écoulé !' : 'Time is up!');
    }
    return () => clearInterval(interval);
  }, [tRunning, tTime, locale]);

  const formatMS = (ms: number) => {
    const min = Math.floor(ms / 60000).toString().padStart(2, '0');
    const sec = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const centi = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${min}:${sec}.${centi}`;
  };

  const formatSec = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg max-w-md mx-auto border border-[var(--border-subtle)] shadow-sm">
      <div className="flex gap-2 mb-4 border-b border-[var(--border-subtle)] pb-2">
        <button
          onClick={() => setTab('stopwatch')}
          className={`px-4 py-2 font-medium text-sm transition-all rounded-lg ${tab === 'stopwatch' ? 'bg-[var(--accent-daily)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-base)]'}`}
        >
          {locale === 'fr' ? 'Chronomètre' : 'Stopwatch'}
        </button>
        <button
          onClick={() => setTab('timer')}
          className={`px-4 py-2 font-medium text-sm transition-all rounded-lg ${tab === 'timer' ? 'bg-[var(--accent-daily)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-base)]'}`}
        >
          {locale === 'fr' ? 'Minuteur' : 'Timer'}
        </button>
      </div>

      {tab === 'stopwatch' && (
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl font-mono text-[var(--text-primary)] my-6">
            {formatMS(swTime)}
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => setSwRunning(!swRunning)} className="flex-1 px-4 py-3 rounded-lg font-medium text-white bg-[var(--accent-daily)] hover:opacity-90">
              {swRunning ? (locale === 'fr' ? 'Pause' : 'Pause') : (locale === 'fr' ? 'Démarrer' : 'Start')}
            </button>
            <button onClick={() => setLaps([...laps, swTime])} disabled={!swRunning} className="flex-1 px-4 py-3 rounded-lg font-medium text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-base)] disabled:opacity-50">
              Tour / Lap
            </button>
            <button onClick={() => { setSwRunning(false); setSwTime(0); setLaps([]); }} className="px-4 py-3 rounded-lg font-medium text-white bg-red-500/80 hover:bg-red-500">
              Reset
            </button>
          </div>
          {laps.length > 0 && (
            <div className="w-full mt-4 max-h-48 overflow-y-auto border-t border-[var(--border-subtle)] pt-4 space-y-2">
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between py-2 px-3 bg-[var(--bg-base)] rounded text-sm text-[var(--text-muted)]">
                  <span>Lap {i + 1}</span>
                  <span className="font-mono text-[var(--text-primary)]">{formatMS(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'timer' && (
        <div className="flex flex-col items-center gap-4">
          {!tRunning && tTime === Number(tInput) ? (
            <input
              type="number"
              value={tInput}
              onChange={(e) => { setTInput(e.target.value); setTTime(Number(e.target.value) || 0); }}
              className="text-center text-4xl w-32 bg-transparent border-b-2 border-[var(--border-subtle)] focus:border-[var(--accent-daily)] focus:outline-none text-[var(--text-primary)] my-6"
            />
          ) : (
            <div className="text-5xl font-mono text-[var(--text-primary)] my-6">
              {formatSec(tTime)}
            </div>
          )}
          
          <div className="flex gap-3 w-full">
            <button onClick={() => setTRunning(!tRunning)} className="flex-1 px-4 py-3 rounded-lg font-medium text-white bg-[var(--accent-daily)] hover:opacity-90">
              {tRunning ? (locale === 'fr' ? 'Pause' : 'Pause') : (locale === 'fr' ? 'Démarrer' : 'Start')}
            </button>
            <button onClick={() => { setTRunning(false); setTTime(Number(tInput)); }} className="px-4 py-3 rounded-lg font-medium text-white bg-red-500/80 hover:bg-red-500">
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
