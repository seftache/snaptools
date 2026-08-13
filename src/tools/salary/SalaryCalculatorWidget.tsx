"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Banknote } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SalaryCalculatorWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.salary');
  
  const [rate, setRate] = useState('20');
  const [hours, setHours] = useState('40');
  const [days, setDays] = useState('5');
  
  const [results, setResults] = useState({ hourly: 0, daily: 0, weekly: 0, monthly: 0, yearly: 0 });

  useEffect(() => {
    const r = Number(rate) || 0;
    const h = Number(hours) || 0;
    const d = Number(days) || 0;
    
    const hourly = r;
    const daily = r * (h / d); // average hours per day
    const weekly = r * h;
    const yearly = weekly * 52;
    const monthly = yearly / 12;

    setResults({ hourly, daily, weekly, monthly, yearly });
  }, [rate, hours, days]);

  return (
    <div className="w-full max-w-[800px] mx-auto p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--accent-daily)' }}>
        <Banknote /> {t('title') || 'Salary Calculator'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block mb-2 text-sm text-gray-300">Hourly Rate ($)</label>
          <input type="number" className="w-full p-2 bg-black/30 rounded border border-white/10" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
        <div>
          <label className="block mb-2 text-sm text-gray-300">Hours per week</label>
          <input type="number" className="w-full p-2 bg-black/30 rounded border border-white/10" value={hours} onChange={e => setHours(e.target.value)} />
        </div>
        <div>
          <label className="block mb-2 text-sm text-gray-300">Days per week</label>
          <input type="number" className="w-full p-2 bg-black/30 rounded border border-white/10" value={days} onChange={e => setDays(e.target.value)} />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
          <div className="text-gray-400 text-sm">Daily</div>
          <div className="text-xl font-bold text-white">${results.daily.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
          <div className="text-gray-400 text-sm">Weekly</div>
          <div className="text-xl font-bold text-white">${results.weekly.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
          <div className="text-gray-400 text-sm">Monthly</div>
          <div className="text-xl font-bold text-white">${results.monthly.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
          <div className="text-gray-400 text-sm">Yearly</div>
          <div className="text-xl font-bold text-green-400">${results.yearly.toFixed(2)}</div>
        </div>
      </motion.div>
    </div>
  );
}
