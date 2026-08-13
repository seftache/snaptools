"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Search, Plus, Trash2, Globe, MapPin, 
  Sun, Moon, Compass, Sparkles, RefreshCw, Check 
} from 'lucide-react';

interface CityTimezone {
  nameFr: string;
  nameEn: string;
  countryFr: string;
  countryEn: string;
  flag: string;
  timezone: string;
  aliases: string[];
}

const WORLD_CITIES: CityTimezone[] = [
  // Afrique
  { nameFr: 'Abidjan', nameEn: 'Abidjan', countryFr: 'Côte d\'Ivoire', countryEn: 'Ivory Coast', flag: '🇨🇮', timezone: 'Africa/Abidjan', aliases: ['abidjan', 'cote d\'ivoire', 'ivory coast', 'côte d\'ivoire'] },
  { nameFr: 'Dakar', nameEn: 'Dakar', countryFr: 'Sénégal', countryEn: 'Senegal', flag: '🇸🇳', timezone: 'Africa/Dakar', aliases: ['dakar', 'senegal', 'sénégal'] },
  { nameFr: 'Casablanca', nameEn: 'Casablanca', countryFr: 'Maroc', countryEn: 'Morocco', flag: '🇲🇦', timezone: 'Africa/Casablanca', aliases: ['casablanca', 'rabat', 'maroc', 'morocco'] },
  { nameFr: 'Alger', nameEn: 'Algiers', countryFr: 'Algérie', countryEn: 'Algeria', flag: '🇩🇿', timezone: 'Africa/Algiers', aliases: ['alger', 'algiers', 'algerie', 'algérie', 'algeria'] },
  { nameFr: 'Tunis', nameEn: 'Tunis', countryFr: 'Tunisie', countryEn: 'Tunisia', flag: '🇹🇳', timezone: 'Africa/Tunis', aliases: ['tunis', 'tunisie', 'tunisia'] },
  { nameFr: 'Le Caire', nameEn: 'Cairo', countryFr: 'Égypte', countryEn: 'Egypt', flag: '🇪🇬', timezone: 'Africa/Cairo', aliases: ['cairo', 'le caire', 'egypte', 'egypt'] },
  { nameFr: 'Lomé', nameEn: 'Lome', countryFr: 'Togo', countryEn: 'Togo', flag: '🇹🇬', timezone: 'Africa/Lome', aliases: ['lome', 'lomé', 'togo'] },
  { nameFr: 'Cotonou', nameEn: 'Cotonou', countryFr: 'Bénin', countryEn: 'Benin', flag: '🇧🇯', timezone: 'Africa/Porto-Novo', aliases: ['cotonou', 'porto-novo', 'benin', 'bénin'] },
  { nameFr: 'Bamako', nameEn: 'Bamako', countryFr: 'Mali', countryEn: 'Mali', flag: '🇲🇱', timezone: 'Africa/Bamako', aliases: ['bamako', 'mali'] },
  { nameFr: 'Conakry', nameEn: 'Conakry', countryFr: 'Guinée', countryEn: 'Guinea', flag: '🇬🇳', timezone: 'Africa/Conakry', aliases: ['conakry', 'guinee', 'guinée', 'guinea'] },
  { nameFr: 'Ouagadougou', nameEn: 'Ouagadougou', countryFr: 'Burkina Faso', countryEn: 'Burkina Faso', flag: '🇧🇫', timezone: 'Africa/Ouagadougou', aliases: ['ouaga', 'ouagadougou', 'burkina', 'burkina faso'] },
  { nameFr: 'Niamey', nameEn: 'Niamey', countryFr: 'Niger', countryEn: 'Niger', flag: '🇳🇪', timezone: 'Africa/Niamey', aliases: ['niamey', 'niger'] },
  { nameFr: 'Douala / Yaoundé', nameEn: 'Douala / Yaounde', countryFr: 'Cameroun', countryEn: 'Cameroon', flag: '🇨🇲', timezone: 'Africa/Douala', aliases: ['douala', 'yaounde', 'yaoundé', 'cameroun', 'cameroon'] },
  { nameFr: 'Kinshasa', nameEn: 'Kinshasa', countryFr: 'RD Congo', countryEn: 'DR Congo', flag: '🇨🇩', timezone: 'Africa/Kinshasa', aliases: ['kinshasa', 'rdc', 'congo', 'dr congo'] },
  { nameFr: 'Brazzaville', nameEn: 'Brazzaville', countryFr: 'Congo', countryEn: 'Congo', flag: '🇨🇬', timezone: 'Africa/Brazzaville', aliases: ['brazzaville', 'congo brazza'] },
  { nameFr: 'Libreville', nameEn: 'Libreville', countryFr: 'Gabon', countryEn: 'Gabon', flag: '🇬🇦', timezone: 'Africa/Libreville', aliases: ['libreville', 'gabon'] },
  { nameFr: 'Lagos', nameEn: 'Lagos', countryFr: 'Nigéria', countryEn: 'Nigeria', flag: '🇳🇬', timezone: 'Africa/Lagos', aliases: ['lagos', 'abuja', 'nigeria', 'nigéria'] },
  { nameFr: 'Johannesburg', nameEn: 'Johannesburg', countryFr: 'Afrique du Sud', countryEn: 'South Africa', flag: '🇿🇦', timezone: 'Africa/Johannesburg', aliases: ['johannesburg', 'cape town', 'afrique du sud', 'south africa'] },
  { nameFr: 'Nairobi', nameEn: 'Nairobi', countryFr: 'Kenya', countryEn: 'Kenya', flag: '🇰🇪', timezone: 'Africa/Nairobi', aliases: ['nairobi', 'kenya'] },

  // Europe
  { nameFr: 'Paris', nameEn: 'Paris', countryFr: 'France', countryEn: 'France', flag: '🇫🇷', timezone: 'Europe/Paris', aliases: ['paris', 'france', 'lyon', 'marseille'] },
  { nameFr: 'Londres', nameEn: 'London', countryFr: 'Royaume-Uni', countryEn: 'United Kingdom', flag: '🇬🇧', timezone: 'Europe/London', aliases: ['london', 'londres', 'uk', 'royaume-uni', 'england'] },
  { nameFr: 'Bruxelles', nameEn: 'Brussels', countryFr: 'Belgique', countryEn: 'Belgium', flag: '🇧🇪', timezone: 'Europe/Brussels', aliases: ['bruxelles', 'brussels', 'belgique', 'belgium'] },
  { nameFr: 'Genève / Zurich', nameEn: 'Geneva / Zurich', countryFr: 'Suisse', countryEn: 'Switzerland', flag: '🇨🇭', timezone: 'Europe/Zurich', aliases: ['geneve', 'genève', 'zurich', 'suisse', 'switzerland'] },
  { nameFr: 'Madrid', nameEn: 'Madrid', countryFr: 'Espagne', countryEn: 'Spain', flag: '🇪🇸', timezone: 'Europe/Madrid', aliases: ['madrid', 'barcelone', 'espagne', 'spain'] },
  { nameFr: 'Rome', nameEn: 'Rome', countryFr: 'Italie', countryEn: 'Italy', flag: '🇮🇹', timezone: 'Europe/Rome', aliases: ['rome', 'italie', 'italy', 'milan'] },
  { nameFr: 'Berlin', nameEn: 'Berlin', countryFr: 'Allemagne', countryEn: 'Germany', flag: '🇩🇪', timezone: 'Europe/Berlin', aliases: ['berlin', 'allemagne', 'germany', 'munich', 'francfort'] },
  { nameFr: 'Amsterdam', nameEn: 'Amsterdam', countryFr: 'Pays-Bas', countryEn: 'Netherlands', flag: '🇳🇱', timezone: 'Europe/Amsterdam', aliases: ['amsterdam', 'pays-bas', 'netherlands', 'hollande'] },
  { nameFr: 'Moscou', nameEn: 'Moscow', countryFr: 'Russie', countryEn: 'Russia', flag: '🇷🇺', timezone: 'Europe/Moscow', aliases: ['moscou', 'moscow', 'russie', 'russia'] },

  // Amériques
  { nameFr: 'New York', nameEn: 'New York', countryFr: 'États-Unis (Est)', countryEn: 'USA (Eastern)', flag: '🇺🇸', timezone: 'America/New_York', aliases: ['new york', 'nyc', 'ny', 'etats-unis', 'usa', 'miami', 'boston', 'washington'] },
  { nameFr: 'Los Angeles', nameEn: 'Los Angeles', countryFr: 'États-Unis (Pacifique)', countryEn: 'USA (Pacific)', flag: '🇺🇸', timezone: 'America/Los_Angeles', aliases: ['los angeles', 'la', 'california', 'san francisco', 'seattle'] },
  { nameFr: 'Chicago', nameEn: 'Chicago', countryFr: 'États-Unis (Central)', countryEn: 'USA (Central)', flag: '🇺🇸', timezone: 'America/Chicago', aliases: ['chicago', 'texas', 'houston', 'dallas'] },
  { nameFr: 'Montréal / Toronto', nameEn: 'Montreal / Toronto', countryFr: 'Canada (Est)', countryEn: 'Canada (Eastern)', flag: '🇨🇦', timezone: 'America/Toronto', aliases: ['montreal', 'montréal', 'toronto', 'canada', 'quebec', 'québec', 'ottawa'] },
  { nameFr: 'Vancouver', nameEn: 'Vancouver', countryFr: 'Canada (Ouest)', countryEn: 'Canada (Western)', flag: '🇨🇦', timezone: 'America/Vancouver', aliases: ['vancouver', 'bc'] },
  { nameFr: 'São Paulo', nameEn: 'Sao Paulo', countryFr: 'Brésil', countryEn: 'Brazil', flag: '🇧🇷', timezone: 'America/Sao_Paulo', aliases: ['sao paulo', 'são paulo', 'rio', 'bresil', 'brazil'] },

  // Asie & Océanie & Moyen-Orient
  { nameFr: 'Dubaï', nameEn: 'Dubai', countryFr: 'Émirats Arabes Unis', countryEn: 'UAE', flag: '🇦🇪', timezone: 'Asia/Dubai', aliases: ['dubai', 'dubaï', 'uae', 'abu dhabi', 'emirats'] },
  { nameFr: 'Tokyo', nameEn: 'Tokyo', countryFr: 'Japon', countryEn: 'Japan', flag: '🇯🇵', timezone: 'Asia/Tokyo', aliases: ['tokyo', 'japon', 'japan', 'osaka'] },
  { nameFr: 'Pékin / Shanghai', nameEn: 'Beijing / Shanghai', countryFr: 'Chine', countryEn: 'China', flag: '🇨🇳', timezone: 'Asia/Shanghai', aliases: ['pekin', 'pékin', 'beijing', 'shanghai', 'chine', 'china', 'hong kong'] },
  { nameFr: 'Singapour', nameEn: 'Singapore', countryFr: 'Singapour', countryEn: 'Singapore', flag: '🇸🇬', timezone: 'Asia/Singapore', aliases: ['singapour', 'singapore'] },
  { nameFr: 'Bangkok', nameEn: 'Bangkok', countryFr: 'Thaïlande', countryEn: 'Thailand', flag: '🇹🇭', timezone: 'Asia/Bangkok', aliases: ['bangkok', 'thailande', 'thailand'] },
  { nameFr: 'Mumbai / New Delhi', nameEn: 'Mumbai / New Delhi', countryFr: 'Inde', countryEn: 'India', flag: '🇮🇳', timezone: 'Asia/Kolkata', aliases: ['delhi', 'new delhi', 'mumbai', 'bombay', 'inde', 'india'] },
  { nameFr: 'Sydney', nameEn: 'Sydney', countryFr: 'Australie', countryEn: 'Australia', flag: '🇦🇺', timezone: 'Australia/Sydney', aliases: ['sydney', 'australie', 'australia', 'melbourne'] },
  { nameFr: 'UTC / GMT (Temps Universel)', nameEn: 'UTC / GMT (Universal Time)', countryFr: 'Standard International', countryEn: 'International Standard', flag: '🌐', timezone: 'UTC', aliases: ['utc', 'gmt', 'zulu'] },
];

const DEFAULT_SELECTED_ZONES = [
  'Africa/Abidjan',
  'Europe/Paris',
  'America/New_York',
  'Europe/London',
  'Asia/Dubai',
  'Asia/Tokyo',
];

export default function WorldClockWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [now, setNow] = useState(new Date());
  const [selectedZones, setSelectedZones] = useState<string[]>(DEFAULT_SELECTED_ZONES);
  const [searchQuery, setSearchQuery] = useState('');
  const [is24Hour, setIs24Hour] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter cities by search query (smart fuzzy match on city name, country, or aliases)
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return WORLD_CITIES.filter((city) => {
      return (
        city.nameFr.toLowerCase().includes(q) ||
        city.nameEn.toLowerCase().includes(q) ||
        city.countryFr.toLowerCase().includes(q) ||
        city.countryEn.toLowerCase().includes(q) ||
        city.timezone.toLowerCase().includes(q) ||
        city.aliases.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  const addCityTimezone = (tz: string) => {
    if (!selectedZones.includes(tz)) {
      setSelectedZones((prev) => [...prev, tz]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (filteredCities.length > 0) {
      addCityTimezone(filteredCities[0].timezone);
      return;
    }

    // Try finding valid IANA timezone directly or format city name
    const raw = searchQuery.trim();
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: raw }).format(new Date());
      addCityTimezone(raw);
    } catch {
      // Try resolving with Africa/ or Europe/ or America/
      const attempts = [
        `Africa/${raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()}`,
        `Europe/${raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()}`,
        `America/${raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()}`,
        `Asia/${raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()}`,
      ];

      for (const att of attempts) {
        try {
          new Intl.DateTimeFormat('en-US', { timeZone: att }).format(new Date());
          addCityTimezone(att);
          return;
        } catch {}
      }
    }
  };

  const removeZone = (tz: string) => {
    setSelectedZones((prev) => prev.filter((z) => z !== tz));
  };

  const getCityInfo = (tz: string): CityTimezone => {
    const found = WORLD_CITIES.find((c) => c.timezone === tz);
    if (found) return found;

    const parts = tz.split('/');
    const cityName = (parts[1] || parts[0]).replace(/_/g, ' ');
    return {
      nameFr: cityName,
      nameEn: cityName,
      countryFr: parts[0] || '',
      countryEn: parts[0] || '',
      flag: '🌍',
      timezone: tz,
      aliases: [cityName.toLowerCase()],
    };
  };

  const getTimeDetails = (date: Date, tz: string) => {
    try {
      const timeStr = new Intl.DateTimeFormat(isFr ? 'fr-FR' : 'en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: !is24Hour,
      }).format(date);

      const dateStr = new Intl.DateTimeFormat(isFr ? 'fr-FR' : 'en-US', {
        timeZone: tz,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(date);

      const offsetStr = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'shortOffset',
      })
        .formatToParts(date)
        .find((p) => p.type === 'timeZoneName')?.value || 'UTC';

      // Check if day or night (based on hour)
      const hourVal = parseInt(
        new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).format(date),
        10
      );
      const isNight = hourVal < 6 || hourVal >= 20;

      return { timeStr, dateStr, offsetStr, isNight, valid: true };
    } catch {
      return { timeStr: '--:--:--', dateStr: '', offsetStr: 'Invalid', isNight: false, valid: false };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {isFr ? 'Horloge Mondiale & Fuseaux Horaires' : 'World Clock & Timezones'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {isFr
                ? 'Heure exacte en direct de toutes les villes du monde (Abidjan, Paris, New York...)'
                : 'Live accurate local time for all world cities and capitals'}
            </p>
          </div>
        </div>

        {/* 12h / 24h Toggle */}
        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setIs24Hour(true)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              is24Hour ? 'bg-blue-500 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            24 Heures
          </button>
          <button
            type="button"
            onClick={() => setIs24Hour(false)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              !is24Hour ? 'bg-blue-500 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            12 Heures (AM/PM)
          </button>
        </div>
      </div>

      {/* Smart Search & Autocomplete Bar */}
      <div className="relative mb-6">
        <form onSubmit={handleManualAdd} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={
                isFr
                  ? 'Rechercher une ville (ex: Abidjan, Dakar, Paris, Montréal, Dubaï...)'
                  : 'Search a city or country (e.g. Abidjan, London, New York...)'
              }
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            {isFr ? 'Ajouter' : 'Add'}
          </button>
        </form>

        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {showDropdown && filteredCities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute left-0 right-0 top-full mt-2 bg-zinc-900 border border-white/15 rounded-xl shadow-2xl z-30 max-h-64 overflow-y-auto divide-y divide-white/5"
            >
              {filteredCities.map((city) => (
                <button
                  key={city.timezone}
                  type="button"
                  onClick={() => addCityTimezone(city.timezone)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-500/15 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{city.flag}</span>
                    <div>
                      <span className="font-semibold text-white text-sm group-hover:text-blue-300">
                        {isFr ? city.nameFr : city.nameEn}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        ({isFr ? city.countryFr : city.countryEn})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {city.timezone}
                    </span>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Add Popular City Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
        <span className="text-gray-400 font-medium">{isFr ? 'Villes populaires :' : 'Popular:'}</span>
        {[
          { name: 'Abidjan 🇨🇮', tz: 'Africa/Abidjan' },
          { name: 'Dakar 🇸🇳', tz: 'Africa/Dakar' },
          { name: 'Paris 🇫🇷', tz: 'Europe/Paris' },
          { name: 'New York 🇺🇸', tz: 'America/New_York' },
          { name: 'Londres 🇬🇧', tz: 'Europe/London' },
          { name: 'Dubaï 🇦🇪', tz: 'Asia/Dubai' },
          { name: 'Montréal 🇨🇦', tz: 'America/Toronto' },
          { name: 'Tokyo 🇯🇵', tz: 'Asia/Tokyo' },
        ].map((item) => (
          <button
            key={item.tz}
            type="button"
            onClick={() => addCityTimezone(item.tz)}
            className={`px-3 py-1 rounded-lg border transition-all flex items-center gap-1 ${
              selectedZones.includes(item.tz)
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-medium'
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {item.name}
            {selectedZones.includes(item.tz) && <Check className="w-3 h-3 text-blue-400" />}
          </button>
        ))}
      </div>

      {/* Live World Clocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedZones.map((tz) => {
          const city = getCityInfo(tz);
          const { timeStr, dateStr, offsetStr, isNight, valid } = getTimeDetails(now, tz);

          return (
            <motion.div
              key={tz}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-md hover:border-blue-500/30 transition-all relative overflow-hidden group"
            >
              {/* Day / Night ambient glow */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8 ${
                  isNight ? 'bg-indigo-600/10' : 'bg-amber-500/10'
                }`}
              />

              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{city.flag}</span>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">
                      {isFr ? city.nameFr : city.nameEn}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      {city.countryFr || tz}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="p-1 rounded-md bg-white/5 text-gray-400" title={isNight ? 'Nuit' : 'Jour'}>
                    {isNight ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeZone(tz)}
                    className="p-1 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title={isFr ? 'Retirer' : 'Remove'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Digital Time Display */}
              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-white/5 relative z-10">
                <div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wider">
                    {timeStr}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{dateStr}</div>
                </div>

                <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {offsetStr}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
