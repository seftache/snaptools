"use client";
import React, { useState } from 'react';

export default function PlaceholderWidget({ locale }: { locale: string }) {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [text, setText] = useState('Placeholder');
  const [bgColor, setBgColor] = useState('#1a1a25');
  const [textColor, setTextColor] = useState('#8a8a9a');

  const generateSvgStr = () => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${bgColor}" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${Math.min(width, height) / 10}" fill="${textColor}">${text || `${width}x${height}`}</text></svg>`;
  const dataUri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(generateSvgStr())}`;

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg max-w-2xl mx-auto border border-[var(--border-subtle)] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm text-[var(--text-muted)] mb-1">Width</label><input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full px-3 py-2 border rounded bg-[var(--bg-base)] border-[var(--border-subtle)] focus:outline-none" /></div>
          <div><label className="block text-sm text-[var(--text-muted)] mb-1">Height</label><input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full px-3 py-2 border rounded bg-[var(--bg-base)] border-[var(--border-subtle)] focus:outline-none" /></div>
        </div>
        <div><label className="block text-sm text-[var(--text-muted)] mb-1">Text</label><input type="text" value={text} onChange={e => setText(e.target.value)} className="w-full px-3 py-2 border rounded bg-[var(--bg-base)] border-[var(--border-subtle)] focus:outline-none" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm text-[var(--text-muted)] mb-1">Background</label><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-10 border rounded bg-transparent p-1 border-[var(--border-subtle)] cursor-pointer" /></div>
          <div><label className="block text-sm text-[var(--text-muted)] mb-1">Text Color</label><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 border rounded bg-transparent p-1 border-[var(--border-subtle)] cursor-pointer" /></div>
        </div>
        <a href={dataUri} download={`placeholder-${width}x${height}.svg`} className="inline-block w-full text-center px-4 py-2 bg-[var(--accent-devsec)] text-white rounded font-medium hover:opacity-90 transition-opacity">Download SVG</a>
      </div>
      <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-[var(--bg-base)] border-[var(--border-subtle)] overflow-hidden">
        <div className="w-full overflow-auto max-h-[300px] flex items-center justify-center border border-dashed border-[var(--border-subtle)]"><img src={dataUri} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} /></div>
      </div>
    </div>
  );
}
