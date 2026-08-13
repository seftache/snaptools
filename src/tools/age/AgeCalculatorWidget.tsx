'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, ChevronRight } from 'lucide-react';

export default function AgeCalculatorWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.age');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<{ years: number; months: number; days: number } | null>(null);

  const calculateAge = (dateString: string) => {
    setDob(dateString);
    if (!dateString) {
      setResult(null);
      return;
    }

    const birthDate = new Date(dateString);
    const today = new Date();

    if (birthDate > today || isNaN(birthDate.getTime())) {
      setResult(null);
      return;
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    setResult({ years, months, days });
  };

  const ResultBox = ({ value, label, color }: { value: number, label: string, color: string }) => (
    <div style={{ background: '#0a0a0f', border: `1px solid ${color}33`, borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '120px' }}>
      <div style={{ fontSize: '48px', fontWeight: 700, color: color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '14px', color: '#8a8a9a', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Input Section */}
      <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f0f0f5', fontSize: '18px', fontWeight: 500 }}>
          <Calendar color="#c9a96e" size={24} />
          {t('dobLabel')}
        </div>
        <input
          type="date"
          value={dob}
          onChange={(e) => calculateAge(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '16px 24px', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f0f0f5', fontSize: '20px', outline: 'none', textAlign: 'center', cursor: 'pointer' }}
        />
      </div>

      {/* Result Section */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#c9a96e', fontSize: '20px', fontWeight: 600 }}>
            <User size={24} />
            {t('summary')}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', width: '100%' }}>
            <ResultBox value={result.years} label={t('resultYears')} color="#c9a96e" />
            <ResultBox value={result.months} label={t('resultMonths')} color="#10b981" />
            <ResultBox value={result.days} label={t('resultDays')} color="#3b82f6" />
          </div>

        </motion.div>
      )}

    </div>
  );
}
