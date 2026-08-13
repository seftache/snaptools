'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calculator, DollarSign, Percent, Clock, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LoanCalculatorWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.loan');
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(5);
  const [result, setResult] = useState<{ monthly: number; totalInterest: number; totalAmount: number } | null>(null);

  const calculate = () => {
    const p = amount;
    const r = (rate / 100) / 12;
    const n = years * 12;

    if (p <= 0 || r <= 0 || n <= 0) {
      setResult(null);
      return;
    }

    const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = monthly * n;
    const totalInterest = totalAmount - p;

    setResult({ monthly, totalInterest, totalAmount });
  };

  const InputRow = ({ label, icon, value, onChange, type = "number", step = "1", min = "0" }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ color: '#8a8a9a', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon} {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        min={min}
        style={{
          width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', color: '#f0f0f5', fontSize: '16px', outline: 'none'
        }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      
      {/* Inputs */}
      <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <InputRow label={t('amountLabel')} icon={<DollarSign size={16} />} value={amount} onChange={setAmount} step="1000" />
        <InputRow label={t('rateLabel')} icon={<Percent size={16} />} value={rate} onChange={setRate} step="0.1" />
        <InputRow label={t('termLabel')} icon={<Clock size={16} />} value={years} onChange={setYears} step="1" />
        
        <Button variant="primary" onClick={calculate} style={{ marginTop: '8px', background: '#c9a96e', color: '#000' }}>
          <Calculator size={18} /> {t('calcBtn')}
        </Button>
      </div>

      {/* Results */}
      <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#c9a96e', fontWeight: 600, fontSize: '18px' }}>
          <PieChart size={24} />
          Payment Summary
        </div>

        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ color: '#8a8a9a', fontSize: '14px', marginBottom: '8px' }}>{t('monthlyPay')}</div>
              <div style={{ color: '#10b981', fontSize: '36px', fontWeight: 700 }}>
                ${result.monthly.toFixed(2)}
              </div>
            </div>
            
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ color: '#8a8a9a', fontSize: '13px', marginBottom: '4px' }}>Principal</div>
                <div style={{ color: '#f0f0f5', fontSize: '18px', fontWeight: 500 }}>${amount.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ color: '#8a8a9a', fontSize: '13px', marginBottom: '4px' }}>{t('totalInterest')}</div>
                <div style={{ color: '#ef4444', fontSize: '18px', fontWeight: 500 }}>${result.totalInterest.toFixed(2)}</div>
              </div>
            </div>

            <div style={{ background: '#0a0a0f', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#8a8a9a', fontSize: '14px', marginBottom: '4px' }}>{t('totalAmount')}</div>
              <div style={{ color: '#f0f0f5', fontSize: '24px', fontWeight: 600 }}>${result.totalAmount.toFixed(2)}</div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#55556a' }}>
            Enter valid numbers to see the summary
          </div>
        )}
      </div>

    </div>
  );
}
