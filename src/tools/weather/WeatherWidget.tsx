"use client";
import React, { useState, useEffect } from 'react';

export default function WeatherWidget({ locale }: { locale: string }) {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getWeatherIcon = (code: number) => {
    if (code === 0) return '☀️';
    if (code >= 1 && code <= 3) return '⛅';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '❓';
  };

  const fetchWeather = async (lat: number, lon: number, name: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
      if (!res.ok) throw new Error('Failed to fetch weather');
      const data = await fetch(res.url).then(r => r.json());
      setWeather({ ...data, cityName: name });
    } catch (e) {
      setError(locale === 'fr' ? 'Erreur lors de la récupération' : 'Error fetching weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 2) {
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=${locale}`)
          .then(res => res.json())
          .then(data => {
            if (data.results && data.results.length > 0) {
              const { latitude, longitude, name } = data.results[0];
              fetchWeather(latitude, longitude, name);
            } else {
              setError(locale === 'fr' ? 'Ville introuvable' : 'City not found');
            }
          }).catch(() => setError(locale === 'fr' ? 'Erreur de recherche' : 'Search error'));
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query, locale]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, locale === 'fr' ? 'Position actuelle' : 'Current Location'),
        () => {}
      );
    }
  }, [locale]);

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg">
      <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">
        {locale === 'fr' ? 'Rechercher une ville' : 'Search City'}
      </label>
      <input
        type="text"
        className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-devsec)] focus:border-transparent w-full mb-4"
        placeholder={locale === 'fr' ? 'Paris...' : 'Paris...'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <div className="text-[var(--text-muted)]">{locale === 'fr' ? 'Chargement...' : 'Loading...'}</div>}
      {error && <div className="text-red-500">{error}</div>}
      {weather && !loading && !error && (
        <div>
          <h2 className="text-xl font-bold mb-2">{weather.cityName} {getWeatherIcon(weather.current.weather_code)}</h2>
          <div className="mb-4">
            <p>{locale === 'fr' ? 'Température' : 'Temperature'}: {weather.current.temperature_2m}°C</p>
            <p>{locale === 'fr' ? 'Humidité' : 'Humidity'}: {weather.current.relative_humidity_2m}%</p>
            <p>{locale === 'fr' ? 'Vent' : 'Wind'}: {weather.current.wind_speed_10m} km/h</p>
          </div>
          <h3 className="font-semibold mb-2">{locale === 'fr' ? 'Prévisions sur 5 jours' : '5-Day Forecast'}</h3>
          <div className="grid grid-cols-5 gap-2">
            {weather.daily.time.slice(0, 5).map((date: string, i: number) => (
              <div key={date} className="text-center p-2 border border-[var(--border-subtle)] rounded-lg">
                <div className="text-xs text-[var(--text-secondary)]">{new Date(date).toLocaleDateString(locale, { weekday: 'short' })}</div>
                <div className="text-xl my-1">{getWeatherIcon(weather.daily.weather_code[i])}</div>
                <div className="text-xs">
                  {weather.daily.temperature_2m_min[i]}° / {weather.daily.temperature_2m_max[i]}°
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
