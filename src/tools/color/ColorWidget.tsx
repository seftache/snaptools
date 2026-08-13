"use client";
import React, { useState } from 'react';

export default function ColorWidget({ locale }: { locale: string }) {
  const [hex, setHex] = useState('#6366f1');
  const [rgb, setRgb] = useState('rgb(99, 102, 241)');
  const [hsl, setHsl] = useState('hsl(239, 84%, 67%)');

  const updateColors = (newHex: string) => {
    setHex(newHex);
    let r = 0, g = 0, b = 0;
    if (newHex.length === 7) {
      r = parseInt(newHex.slice(1, 3), 16);
      g = parseInt(newHex.slice(3, 5), 16);
      b = parseInt(newHex.slice(5, 7), 16);
    }
    setRgb(`rgb(${r}, ${g}, ${b})`);

    let rRatio = r / 255, gRatio = g / 255, bRatio = b / 255;
    let max = Math.max(rRatio, gRatio, bRatio), min = Math.min(rRatio, gRatio, bRatio);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rRatio: h = (gRatio - bRatio) / d + (gRatio < bRatio ? 6 : 0); break;
        case gRatio: h = (bRatio - rRatio) / d + 2; break;
        case bRatio: h = (rRatio - gRatio) / d + 4; break;
      }
      h /= 6;
    }
    setHsl(`hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`);
  };

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg max-w-md mx-auto border border-[var(--border-subtle)] shadow-sm">
      <div className="flex items-center space-x-4 mb-6">
        <input type="color" value={hex} onChange={(e) => updateColors(e.target.value)} className="w-16 h-16 rounded cursor-pointer border border-[var(--border-subtle)] bg-transparent" />
        <div className="flex-1">
          <label className="text-xs text-[var(--text-muted)] font-semibold uppercase">Preview</label>
          <div className="text-xl font-medium">{hex.toUpperCase()}</div>
        </div>
      </div>
      <div className="space-y-3">
        {[{ label: 'HEX', value: hex.toUpperCase() }, { label: 'RGB', value: rgb }, { label: 'HSL', value: hsl }].map(fmt => (
          <div key={fmt.label} className="flex items-center justify-between p-3 border border-[var(--border-subtle)] rounded-md bg-[var(--bg-base)]">
            <div><span className="text-xs text-[var(--text-muted)] w-12 inline-block font-medium">{fmt.label}</span><span className="font-mono text-sm">{fmt.value}</span></div>
            <button onClick={() => navigator.clipboard.writeText(fmt.value)} className="text-xs px-3 py-1.5 rounded bg-[var(--border-subtle)] hover:bg-[var(--accent-devsec)] hover:text-white transition-colors">Copy</button>
          </div>
        ))}
      </div>
    </div>
  );
}
