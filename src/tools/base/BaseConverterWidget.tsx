"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Binary, ArrowRightLeft } from 'lucide-react';

export default function BaseConverterWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.base');
  const [values, setValues] = useState({ dec: '', hex: '', bin: '', oct: '' });
  const [error, setError] = useState('');

  const updateValues = (val: string, base: number) => {
    try {
      if (!val) {
        setValues({ dec: '', hex: '', bin: '', oct: '' });
        setError('');
        return;
      }
      
      const decimalValue = parseInt(val, base);
      if (isNaN(decimalValue)) throw new Error('Invalid input');
      
      setValues({
        dec: decimalValue.toString(10),
        hex: decimalValue.toString(16).toUpperCase(),
        bin: decimalValue.toString(2),
        oct: decimalValue.toString(8),
      });
      setError('');
    } catch (e) {
      setError(t('invalidInput') || 'Invalid input for the selected base');
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--accent-devsec)' }}>
        <Binary /> {t('title') || 'Base Converter'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm text-gray-300">Decimal (Base 10)</label>
          <input
            className="w-full p-3 bg-black/20 text-white rounded-lg border border-white/10"
            value={values.dec}
            onChange={(e) => { setValues({...values, dec: e.target.value}); updateValues(e.target.value, 10); }}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm text-gray-300">Hexadecimal (Base 16)</label>
          <input
            className="w-full p-3 bg-black/20 text-white rounded-lg border border-white/10"
            value={values.hex}
            onChange={(e) => { setValues({...values, hex: e.target.value}); updateValues(e.target.value, 16); }}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm text-gray-300">Binary (Base 2)</label>
          <input
            className="w-full p-3 bg-black/20 text-white rounded-lg border border-white/10"
            value={values.bin}
            onChange={(e) => { setValues({...values, bin: e.target.value}); updateValues(e.target.value, 2); }}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm text-gray-300">Octal (Base 8)</label>
          <input
            className="w-full p-3 bg-black/20 text-white rounded-lg border border-white/10"
            value={values.oct}
            onChange={(e) => { setValues({...values, oct: e.target.value}); updateValues(e.target.value, 8); }}
          />
        </div>
      </div>
      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-red-400">{error}</motion.div>}
    </div>
  );
}
