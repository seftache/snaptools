"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PomodoroWidgetProps {
  locale: string;
}

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // sessions before long break
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

export default function PomodoroWidget({ locale }: PomodoroWidgetProps) {
  const isFr = locale === 'fr';

  // Settings State
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    autoStartBreaks: false,
    autoStartWork: false,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [flashAlert, setFlashAlert] = useState(false);

  // Time remaining in seconds
  const [timeLeft, setTimeLeft] = useState<number>(settings.workDuration * 60);

  // Audio helper using Web Audio API synthesized harmonic chime
  const playChime = useCallback(() => {
    if (!settings.soundEnabled || typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C Major chord (C5, E5, G5, C6)
      const now = ctx.currentTime;

      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);

        gain.gain.setValueAtTime(0.001, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.3, now + index * 0.1 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 1.3);
      });
    } catch {
      // AudioContext could be blocked by autoplay policies
    }
  }, [settings.soundEnabled]);

  // Switch modes helper
  const switchMode = useCallback(
    (newMode: PomodoroMode, autoStart: boolean = false) => {
      setMode(newMode);
      setIsRunning(autoStart);
      let durationMinutes = settings.workDuration;
      if (newMode === 'shortBreak') durationMinutes = settings.shortBreakDuration;
      if (newMode === 'longBreak') durationMinutes = settings.longBreakDuration;
      setTimeLeft(durationMinutes * 60);
    },
    [settings]
  );

  // Reset current timer
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    let durationMinutes = settings.workDuration;
    if (mode === 'shortBreak') durationMinutes = settings.shortBreakDuration;
    if (mode === 'longBreak') durationMinutes = settings.longBreakDuration;
    setTimeLeft(durationMinutes * 60);
  }, [mode, settings]);

  // Handle timer completion
  const handleTimerCompletion = useCallback(() => {
    setIsRunning(false);
    playChime();
    setFlashAlert(true);
    setTimeout(() => setFlashAlert(false), 3000);

    if (mode === 'work') {
      const nextCompleted = completedSessions + 1;
      setCompletedSessions(nextCompleted);

      // Check if long break interval reached
      if (nextCompleted % settings.longBreakInterval === 0) {
        switchMode('longBreak', settings.autoStartBreaks);
      } else {
        switchMode('shortBreak', settings.autoStartBreaks);
      }
    } else {
      switchMode('work', settings.autoStartWork);
    }
  }, [
    mode,
    completedSessions,
    settings,
    playChime,
    switchMode,
  ]);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleTimerCompletion();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, handleTimerCompletion]);

  // Update document title with live countdown
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    const label = mode === 'work' ? (isFr ? 'Focus' : 'Focus') : isFr ? 'Pause' : 'Break';
    if (isRunning) {
      document.title = `(${minutes}:${seconds}) ${label} - Pomodoro`;
    }
  }, [timeLeft, mode, isRunning, isFr]);

  // Keyboard shortcut: Space to toggle start/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Time calculations
  const totalDurationSeconds =
    (mode === 'work'
      ? settings.workDuration
      : mode === 'shortBreak'
      ? settings.shortBreakDuration
      : settings.longBreakDuration) * 60;

  const progressPercent =
    totalDurationSeconds > 0
      ? ((totalDurationSeconds - timeLeft) / totalDurationSeconds) * 100
      : 0;

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  // SVG Circular progress radius
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Add extra time helper
  const addExtraMinutes = (min: number) => {
    setTimeLeft((prev) => prev + min * 60);
  };

  const totalFocusMinutes = completedSessions * settings.workDuration;
  const focusHours = Math.floor(totalFocusMinutes / 60);
  const remainingFocusMins = totalFocusMinutes % 60;

  return (
    <div
      className={`flex flex-col items-center gap-6 w-full max-w-xl mx-auto p-6 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] shadow-lg relative overflow-hidden transition-all duration-500 ${
        flashAlert ? 'ring-4 ring-[var(--accent-productivity)] bg-[var(--accent-productivity)]/10' : ''
      }`}
    >
      {/* Top Bar: Mode Tabs + Settings Trigger */}
      <div className="flex items-center justify-between w-full gap-2">
        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-subtle)]">
          <button
            onClick={() => switchMode('work')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'work'
                ? 'bg-[var(--accent-productivity)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            🎯 {isFr ? 'Travail (25m)' : 'Work (25m)'}
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'shortBreak'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            ☕ {isFr ? 'Courte Pause' : 'Short Break'}
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'longBreak'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            🌴 {isFr ? 'Longue Pause' : 'Long Break'}
          </button>
        </div>

        {/* Settings Toggle Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-xl border text-xs transition-all ${
            showSettings
              ? 'bg-[var(--accent-productivity)] text-white border-[var(--accent-productivity)]'
              : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          title={isFr ? 'Paramètres du minuteur' : 'Timer settings'}
        >
          ⚙️
        </button>
      </div>

      {/* Settings Modal / Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] text-xs space-y-4 overflow-hidden"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border-subtle)] font-bold text-[var(--text-primary)]">
              <span>{isFr ? 'Configuration du Minuteur' : 'Timer Customization'}</span>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[var(--text-secondary)] block mb-1">
                  {isFr ? 'Travail (min)' : 'Work (min)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={settings.workDuration}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    setSettings({ ...settings, workDuration: val });
                    if (mode === 'work' && !isRunning) setTimeLeft(val * 60);
                  }}
                  className="w-full p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-center font-mono text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="text-[var(--text-secondary)] block mb-1">
                  {isFr ? 'Pause (min)' : 'Short (min)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakDuration}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    setSettings({ ...settings, shortBreakDuration: val });
                    if (mode === 'shortBreak' && !isRunning) setTimeLeft(val * 60);
                  }}
                  className="w-full p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-center font-mono text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="text-[var(--text-secondary)] block mb-1">
                  {isFr ? 'L. Pause (min)' : 'Long (min)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    setSettings({ ...settings, longBreakDuration: val });
                    if (mode === 'longBreak' && !isRunning) setTimeLeft(val * 60);
                  }}
                  className="w-full p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-center font-mono text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                  className="rounded accent-[var(--accent-productivity)]"
                />
                <span>{isFr ? 'Sonnerie sonore (Carillon)' : 'Audio chime on finish'}</span>
              </label>

              <button
                onClick={playChime}
                className="px-2.5 py-1 bg-[var(--bg-elevated)] hover:bg-[var(--glass-bg)] border border-[var(--border-subtle)] rounded text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                🔔 {isFr ? 'Tester le son' : 'Test Sound'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Input (What are you working on?) */}
      <div className="w-full">
        <input
          type="text"
          value={currentTask}
          onChange={(e) => setCurrentTask(e.target.value)}
          placeholder={
            isFr
              ? '📝 Sur quoi travaillez-vous ? (ex. Rédiger le rapport, Déboguer le composant...)'
              : '📝 What are you focusing on? (e.g. Write report, code feature...)'
          }
          className="w-full px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-productivity)] text-center font-medium"
        />
      </div>

      {/* Circular Timer Visual Display */}
      <div className="relative w-64 h-64 flex items-center justify-center my-2 select-none">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 260 260">
          {/* Background Track */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-[var(--bg-surface)]"
            fill="transparent"
          />
          {/* Active Progress Stroke */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-500 ${
              mode === 'work'
                ? 'text-[var(--accent-productivity)]'
                : mode === 'shortBreak'
                ? 'text-cyan-400'
                : 'text-indigo-400'
            }`}
            fill="transparent"
          />
        </svg>

        {/* Center Digital Clock & Status */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">
            {mode === 'work'
              ? isFr
                ? '🎯 Session Focus'
                : '🎯 Focus Session'
              : mode === 'shortBreak'
              ? isFr
                ? '☕ Pause Courte'
                : '☕ Short Break'
              : isFr
              ? '🌴 Longue Pause'
              : '🌴 Long Break'}
          </span>
          <span className="text-5xl font-mono font-extrabold tracking-tight text-[var(--text-primary)] drop-shadow-md">
            {minutes}:{seconds}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">
            {isRunning ? (isFr ? 'En cours...' : 'In Progress...') : (isFr ? 'En pause' : 'Paused')}
          </span>
        </div>
      </div>

      {/* Quick extension pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => addExtraMinutes(1)}
          className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--glass-bg)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
        >
          +1 min
        </button>
        <button
          onClick={() => addExtraMinutes(5)}
          className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--glass-bg)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
        >
          +5 min
        </button>
      </div>

      {/* Action Controls: Start / Pause / Reset / Skip */}
      <div className="flex items-center gap-3 w-full max-w-sm">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              : 'bg-[var(--accent-productivity)] hover:opacity-90 text-white'
          }`}
        >
          {isRunning ? (
            <>
              <span>⏸</span>
              <span>{isFr ? 'Mettre en Pause' : 'Pause (Space)'}</span>
            </>
          ) : (
            <>
              <span>▶</span>
              <span>{isFr ? 'Démarrer' : 'Start (Space)'}</span>
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="p-3.5 bg-[var(--bg-surface)] hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl text-sm transition-all"
          title={isFr ? 'Réinitialiser le tour' : 'Reset session'}
        >
          ↺
        </button>

        <button
          onClick={handleTimerCompletion}
          className="p-3.5 bg-[var(--bg-surface)] hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl text-sm transition-all"
          title={isFr ? 'Passer au suivant' : 'Skip to next'}
        >
          ⏭
        </button>
      </div>

      {/* Pomodoro Streak & Daily Session Tracker */}
      <div className="w-full pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Cycle Dots (4 Pomodoros before long break) */}
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-secondary)] font-medium">
            {isFr ? 'Cycle :' : 'Cycle:'}
          </span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((idx) => {
              const currentInCycle = completedSessions % settings.longBreakInterval;
              const isFilled = idx < currentInCycle;
              return (
                <span
                  key={idx}
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-all ${
                    isFilled
                      ? 'bg-[var(--accent-productivity)] text-white shadow-sm'
                      : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  🍅
                </span>
              );
            })}
          </div>
        </div>

        {/* Total stats */}
        <div className="flex items-center gap-4 text-[var(--text-secondary)]">
          <div>
            {isFr ? 'Total sessions :' : 'Completed:'}{' '}
            <strong className="text-[var(--text-primary)] font-mono">{completedSessions}</strong>
          </div>
          <span>•</span>
          <div>
            {isFr ? 'Temps Focus :' : 'Focus Time:'}{' '}
            <strong className="text-[var(--accent-productivity)] font-mono">
              {focusHours > 0 ? `${focusHours}h ` : ''}
              {remainingFocusMins}m
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
