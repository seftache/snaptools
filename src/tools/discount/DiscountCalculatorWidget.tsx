'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Tag, DollarSign, Percent, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DiscountCalculatorWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.discount');
  const [price, setPrice] = useState(100);
  const [discount, setDiscount] = useState(20);
  const [result, setResult] = useState<{ saved: number; final: number } | null>(null);

  useEffect(() => {
    calculate();
  }, [price, discount]);

  const calculate = () => {
    if (price < 0 || discount < 0 || discount > 100) {
      setResult(null);
      return;
    }
    const saved = price * (discount / 100);
    const final = price - saved;
    setResult({ saved, final });
  };

  const PresetButton = ({ val }: { val: number }) => (
    <button
      onClick={() => setDiscount(val)}
      style={{
        flex: 1, padding: '12px 0', background: discount === val ? 'rgba(201, 169, 110, 0.1)' : '#0a0a0f',
        border: `1px solid ${discount === val ? '#c9a96e' : 'rgba(255,255,255,0.06)'}`, borderRadius: '8px',
        color: discount === val ? '#c9a96e' : '#8a8a9a', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s'
      }}
    >
      {val}%
    </button>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Visual Header */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#8a8a9a', fontSize: '14px', marginBottom: '8px', textDecoration: 'line-through' }}>{t('priceLabel')}</div>
            <div style={{ color: '#55556a', fontSize: '24px', fontWeight: 500, textDecoration: 'line-through' }}>${price.toFixed(2)}</div>
          </div>
          
          <ArrowRight style={{ color: '#c9a96e' }} size={24} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#c9a96e', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>{t('finalPrice')}</div>
            <div style={{ color: '#10b981', fontSize: '48px', fontWeight: 700 }}>${result.final.toFixed(2)}</div>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Price Input */}
        <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f0f0f5', fontWeight: 500 }}>
            <DollarSign size={18} color="#c9a96e" /> {t('priceLabel')}
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            min="0"
            step="1"
            style={{ width: '100%', padding: '16px', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0f0f5', fontSize: '24px', outline: 'none', fontWeight: 600 }}
          />
        </div>

        {/* Discount Input */}
        <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f0f0f5', fontWeight: 500 }}>
            <Percent size={18} color="#c9a96e" /> {t('discountLabel')}
          </label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
            step="1"
            style={{ width: '100%', padding: '16px', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0f0f5', fontSize: '24px', outline: 'none', fontWeight: 600 }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <PresetButton val={10} />
            <PresetButton val={15} />
            <PresetButton val={20} />
            <PresetButton val={50} />
          </div>
        </div>

      </div>

      {/* Savings summary */}
      {result && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#10b981' }}>
          <Tag size={20} />
          <span style={{ fontSize: '16px', fontWeight: 500 }}>{t('savedAmount')}: <strong>${result.saved.toFixed(2)}</strong></span>
        </div>
      )}

    </div>
  );
}
