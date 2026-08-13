'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, RotateCcw } from 'lucide-react';

export default function BpmTapperWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.bpm');
  const [taps, setTaps] = useState<number[]>([]);
  const [bpm, setBpm] = useState<number>(0);
  const [isTapping, setIsTapping] = useState(false);

  const handleTap = useCallback(() => {
    const now = Date.now();
    setTaps(prev => {
      // Keep only taps from the last 3 seconds to ensure real-time accuracy
      const recentTaps = prev.filter(time => now - time < 3000);
      const newTaps = [...recentTaps, now];
      
      if (newTaps.length > 1) {
        const intervals = [];
        for (let i = 1; i < newTaps.length; i++) {
          intervals.push(newTaps[i] - newTaps[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        setBpm(Math.round(60000 / avgInterval));
      }
      
      return newTaps;
    });

    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 100);
  }, []);

  const reset = () => {
    setTaps([]);
    setBpm(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTap]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
      
      {/* Display */}
      <div style={{ position: 'relative', width: '100%', background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '24px', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', overflow: 'hidden' }}>
        
        {/* Animated Glow */}
        <AnimatePresence>
          {isTapping && (
            <motion.div
              initial={{ opacity: 0.5, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', background: '#c9a96e', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }}
            />
          )}
        </AnimatePresence>

        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: '#8a8a9a', fontSize: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Activity size={18} color={bpm > 0 ? '#10b981' : '#8a8a9a'} />
            {t('bpmValue')}
          </div>
          <div style={{ color: bpm > 0 ? '#c9a96e' : '#55556a', fontSize: '80px', fontWeight: 800, lineHeight: 1, fontFamily: 'monospace' }}>
            {bpm > 0 ? bpm : '000'}
          </div>
        </div>

        <button
          onClick={reset}
          disabled={taps.length === 0}
          style={{ zIndex: 1, position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: taps.length > 0 ? '#8a8a9a' : '#333344', cursor: taps.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', transition: 'color 0.2s' }}
        >
          <RotateCcw size={14} /> {t('resetBtn')}
        </button>
      </div>

      {/* Tap Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleTap}
        style={{ width: '100%', maxWidth: '300px', height: '120px', background: '#c9a96e', border: 'none', borderRadius: '24px', color: '#000', fontSize: '24px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 32px rgba(201, 169, 110, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {t('tapBtn')}
      </motion.button>

      <div style={{ color: '#55556a', fontSize: '14px', textAlign: 'center' }}>
        {t('instruction')}
      </div>

    </div>
  );
}
