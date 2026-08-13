"use client";
import React, { useState, useEffect } from 'react';

export default function HolidaysWidget({ locale }: { locale: string }) {
  const [countries, setCountries] = useState<any[]>([]);
  const [countryCode, setCountryCode] = useState('US');
  const [year, setYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('https://date.nager.at/api/v3/AvailableCountries')
      .then(res => res.json())
      .then(setCountries)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (countryCode && year) {
      setLoading(true);
      fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`)
        .then(res => res.json())
        .then(data => setHolidays(Array.isArray(data) ? data : []))
        .catch(() => setHolidays([]))
        .finally(() => setLoading(false));
    }
  }, [countryCode, year]);

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">
            {locale === 'fr' ? 'Pays' : 'Country'}
          </label>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-devsec)] w-full"
          >
            {countries.map(c => (
              <option key={c.countryCode} value={c.countryCode}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">
            {locale === 'fr' ? 'Année' : 'Year'}
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-devsec)] w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">{locale === 'fr' ? 'Chargement...' : 'Loading...'}</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {holidays.map((h, i) => {
            const isToday = h.date === new Date().toISOString().split('T')[0];
            return (
              <div key={i} className={`p-3 border rounded-lg ${isToday ? 'border-[var(--accent-devsec)] bg-[var(--accent-devsec)]/10' : 'border-[var(--border-subtle)]'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{h.localName}</div>
                    {h.name !== h.localName && <div className="text-sm text-[var(--text-muted)]">{h.name}</div>}
                  </div>
                  <div className="text-sm whitespace-nowrap bg-[var(--bg-elevated)] px-2 py-1 rounded border border-[var(--border-subtle)]">
                    {h.date}
                  </div>
                </div>
              </div>
            );
          })}
          {holidays.length === 0 && <div className="text-center py-4 text-[var(--text-muted)]">No holidays found</div>}
        </div>
      )}
    </div>
  );
}
