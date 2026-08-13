'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Crop, MoveHorizontal, MoveVertical } from 'lucide-react';

export default function AspectRatioWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.ratio');
  const [width, setWidth] = useState<number | string>(1920);
  const [height, setHeight] = useState<number | string>('');
  const [ratioW, setRatioW] = useState<number>(16);
  const [ratioH, setRatioH] = useState<number>(9);

  const presets = [
    { label: '1:1', w: 1, h: 1 },
    { label: '4:3', w: 4, h: 3 },
    { label: '16:9', w: 16, h: 9 },
    { label: '21:9', w: 21, h: 9 },
    { label: '9:16', w: 9, h: 16 },
  ];

  const handleRatioChange = (w: number, h: number) => {
    setRatioW(w);
    setRatioH(h);
    if (width) {
      setHeight(Math.round((Number(width) * h) / w));
    } else if (height) {
      setWidth(Math.round((Number(height) * w) / h));
    }
  };

  const handleWidthChange = (val: string) => {
    setWidth(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setHeight(Math.round((num * ratioH) / ratioW));
    } else {
      setHeight('');
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      setWidth(Math.round((num * ratioW) / ratioH));
    } else {
      setWidth('');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
        {presets.map(p => {
          const isActive = ratioW === p.w && ratioH === p.h;
          return (
            <button
              key={p.label}
              onClick={() => handleRatioChange(p.w, p.h)}
              style={{
                padding: '10px 24px', background: isActive ? 'rgba(201, 169, 110, 0.1)' : '#12121a',
                border: `1px solid ${isActive ? '#c9a96e' : 'rgba(255,255,255,0.06)'}`, borderRadius: '24px',
                color: isActive ? '#c9a96e' : '#8a8a9a', cursor: 'pointer', fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <Crop size={16} />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Visualizer & Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Dimensions */}
        <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#8a8a9a', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MoveHorizontal size={14} /> {t('width')}
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(e.target.value)}
                style={{ width: '100%', padding: '16px', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0f0f5', fontSize: '24px', outline: 'none', textAlign: 'center' }}
              />
            </div>

            <div style={{ color: '#55556a', fontSize: '24px', fontWeight: 700, paddingTop: '24px' }}>:</div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#8a8a9a', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MoveVertical size={14} /> {t('height')}
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(e.target.value)}
                style={{ width: '100%', padding: '16px', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0f0f5', fontSize: '24px', outline: 'none', textAlign: 'center' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ color: '#8a8a9a', fontSize: '12px', textTransform: 'uppercase' }}>{t('targetRatio')}</div>
            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <input
              type="number"
              value={ratioW}
              onChange={(e) => {
                const w = Number(e.target.value) || 1;
                handleRatioChange(w, ratioH);
              }}
              style={{ flex: 1, padding: '12px', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#c9a96e', fontSize: '20px', outline: 'none', textAlign: 'center' }}
            />
            <div style={{ color: '#55556a', fontSize: '24px', fontWeight: 700 }}>:</div>
            <input
              type="number"
              value={ratioH}
              onChange={(e) => {
                const h = Number(e.target.value) || 1;
                handleRatioChange(ratioW, h);
              }}
              style={{ flex: 1, padding: '12px', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#c9a96e', fontSize: '20px', outline: 'none', textAlign: 'center' }}
            />
          </div>

        </div>

        {/* Visualizer Box */}
        <div style={{ background: '#0a0a0f', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '250px' }}>
          <div
            style={{
              width: '100%',
              maxWidth: ratioW > ratioH ? '100%' : `${(ratioW / ratioH) * 100}%`,
              aspectRatio: `${ratioW}/${ratioH}`,
              background: 'rgba(201, 169, 110, 0.1)',
              border: '2px dashed #c9a96e',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ color: '#c9a96e', fontSize: '24px', fontWeight: 700, opacity: 0.5 }}>
              {ratioW}:{ratioH}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
