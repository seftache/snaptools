"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Percent } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PercentageCalculatorWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.percentage');
  
  const [x1, setX1] = useState('');
  const [y1, setY1] = useState('');
  const [res1, setRes1] = useState<number | null>(null);

  const [x2, setX2] = useState('');
  const [y2, setY2] = useState('');
  const [res2, setRes2] = useState<number | null>(null);

  return (
    <div className="w-full max-w-[800px] mx-auto p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--accent-daily)' }}>
        <Percent /> {t('title') || 'Percentage Calculator'}
      </h2>

      <div className="space-y-6">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="mb-2 text-sm text-gray-300">What is X% of Y?</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400">What is</span>
            <input type="number" className="w-24 p-2 bg-black/30 rounded border border-white/10" value={x1} onChange={e => { setX1(e.target.value); setRes1((Number(e.target.value) / 100) * Number(y1 || 0)); }} />
            <span className="text-gray-400">% of</span>
            <input type="number" className="w-24 p-2 bg-black/30 rounded border border-white/10" value={y1} onChange={e => { setY1(e.target.value); setRes1((Number(x1 || 0) / 100) * Number(e.target.value)); }} />
            <span className="text-gray-400">?</span>
            {res1 !== null && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-2 font-bold text-green-400">{res1}</motion.span>}
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="mb-2 text-sm text-gray-300">X is what percent of Y?</p>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="number" className="w-24 p-2 bg-black/30 rounded border border-white/10" value={x2} onChange={e => { setX2(e.target.value); setRes2(Number(y2) ? (Number(e.target.value) / Number(y2)) * 100 : null); }} />
            <span className="text-gray-400">is what % of</span>
            <input type="number" className="w-24 p-2 bg-black/30 rounded border border-white/10" value={y2} onChange={e => { setY2(e.target.value); setRes2(Number(e.target.value) ? (Number(x2 || 0) / Number(e.target.value)) * 100 : null); }} />
            <span className="text-gray-400">?</span>
            {res2 !== null && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-2 font-bold text-blue-400">{res2.toFixed(2)}%</motion.span>}
          </div>
        </div>
      </div>
    </div>
  );
}
