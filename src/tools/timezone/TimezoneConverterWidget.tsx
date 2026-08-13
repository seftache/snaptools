"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Clock, ArrowRightLeft, Plus, Trash2, Search, Check } from 'lucide-react';

interface CityItem {
  name: string;
  flag: string;
  tz: string;
}

const POPULAR_ZONES: CityItem[] = [
  { name: 'Abidjan 🇨🇮', flag: '🇨🇮', tz: 'Africa/Abidjan' },
  { name: 'Paris 🇫🇷', flag: '🇫🇷', tz: 'Europe/Paris' },
  { name: 'New York 🇺🇸', flag: '🇺🇸', tz: 'America/New_York' },
  { name: 'Londres 🇬🇧', flag: '🇬🇧', tz: 'Europe/London' },
  { name: 'Dubaï 🇦🇪', flag: '🇦🇪', tz: 'Asia/Dubai' },
  { name: 'Tokyo 🇯🇵', flag: '🇯🇵', tz: 'Asia/Tokyo' },
  { name: 'Montréal 🇨🇦', flag: '🇨🇦', tz: 'America/Toronto' },
];

export default function TimezoneConverterWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [baseDate, setBaseDate] = useState<string>('');
  const [baseTime, setBaseTime] = useState<string>('12:00');
  const [baseTz, setBaseTz] = useState<string>('Africa/Abidjan');
  const [targetZones, setTargetZones] = useState<string[]>([
    'Africa/Abidjan',
    'Europe/Paris',
    'America/New_York',
    'Europe/London',
    'Asia/Dubai',
    'Asia/Tokyo',
  ]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setBaseDate(today);
  }, []);

  const getConvertedTime = (tz: string) => {
    if (!baseDate || !baseTime) return { time: '--:--', date: '', offset: '' };
    try {
      // Build ISO string in UTC or source
      const combined = `${baseDate}T${baseTime}:00`;
      const date = new Date(combined);

      const timeFormatted = new Intl.DateTimeFormat(isFr ? 'fr-FR' : 'en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(date);

      const dateFormatted = new Intl.DateTimeFormat(isFr ? 'fr-FR' : 'en-US', {
        timeZone: tz,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(date);

      const offsetFormatted = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'shortOffset',
      })
        .formatToParts(date)
        .find((p) => p.type === 'timeZoneName')?.value || 'UTC';

      return { time: timeFormatted, date: dateFormatted, offset: offsetFormatted };
    } catch {
      return { time: '--:--', date: '', offset: '' };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {isFr ? 'Convertisseur de Fuseaux Horaires' : 'Timezone Converter'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {isFr
              ? 'Convertissez instantanément une heure entre Abidjan, Paris, New York, Londres et le monde entier'
              : 'Instantly convert time across international timezones'}
          </p>
        </div>
      </div>

      {/* Base Time Input Bar */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            {isFr ? 'Date de référence :' : 'Base Date:'}
          </label>
          <input
            type="date"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            {isFr ? 'Heure de départ :' : 'Base Time:'}
          </label>
          <input
            type="time"
            value={baseTime}
            onChange={(e) => setBaseTime(e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            {isFr ? 'Fuseau de départ :' : 'Base Timezone:'}
          </label>
          <select
            value={baseTz}
            onChange={(e) => setBaseTz(e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white text-xs font-medium"
          >
            {POPULAR_ZONES.map((item) => (
              <option key={item.tz} value={item.tz} className="bg-zinc-900 text-white">
                {item.name} ({item.tz})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Converted Timezone Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {targetZones.map((tz) => {
          const { time, date, offset } = getConvertedTime(tz);
          const parts = tz.split('/');
          const cityName = (parts[1] || parts[0]).replace(/_/g, ' ');

          return (
            <motion.div
              key={tz}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white text-sm">{cityName}</span>
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {offset}
                </span>
              </div>
              <div className="text-2xl font-mono font-bold text-white">{time}</div>
              <div className="text-xs text-gray-400 mt-1">{date}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
