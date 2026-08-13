"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TipCalculatorWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.tip');
  
  const [bill, setBill] = useState('50');
  const [tipPct, setTipPct] = useState('15');
  const [split, setSplit] = useState('1');
  
  const [results, setResults] = useState({ tipAmount: 0, totalBill: 0, perPerson: 0 });

  useEffect(() => {
    const b = Number(bill) || 0;
    const tPct = Number(tipPct) || 0;
    const s = Number(split) || 1;
    
    const tipAmount = b * (tPct / 100);
    const totalBill = b + tipAmount;
    const perPerson = s > 0 ? totalBill / s : totalBill;

    setResults({ tipAmount, totalBill, perPerson });
  }, [bill, tipPct, split]);

  return (
    <div className="w-full max-w-[800px] mx-auto p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--accent-daily)' }}>
        <Calculator /> {t('title') || 'Tip Calculator'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block mb-2 text-sm text-gray-300">Bill Amount</label>
          <input type="number" className="w-full p-2 bg-black/30 rounded border border-white/10" value={bill} onChange={e => setBill(e.target.value)} />
        </div>
        <div>
          <label className="block mb-2 text-sm text-gray-300">Tip %</label>
          <input type="number" className="w-full p-2 bg-black/30 rounded border border-white/10" value={tipPct} onChange={e => setTipPct(e.target.value)} />
        </div>
        <div>
          <label className="block mb-2 text-sm text-gray-300">Split (Persons)</label>
          <input type="number" className="w-full p-2 bg-black/30 rounded border border-white/10" value={split} onChange={e => setSplit(e.target.value)} min="1" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
          <div className="text-gray-400 text-sm">Tip Amount</div>
          <div className="text-xl font-bold text-yellow-400">${results.tipAmount.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
          <div className="text-gray-400 text-sm">Total Bill</div>
          <div className="text-xl font-bold text-white">${results.totalBill.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
          <div className="text-gray-400 text-sm">Per Person</div>
          <div className="text-2xl font-bold text-green-400">${results.perPerson.toFixed(2)}</div>
        </div>
      </motion.div>
    </div>
  );
}
