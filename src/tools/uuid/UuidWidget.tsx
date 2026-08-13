"use client";
import React, { useState } from 'react';

export default function UuidWidget({ locale }: { locale: string }) {
  const [count, setCount] = useState<number>(1);
  const [uuids, setUuids] = useState<string[]>([]);

  const handleGenerate = () => {
    const num = Math.min(Math.max(count, 1), 100);
    const generated = Array.from({ length: num }, () => 
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      })
    );
    setUuids(generated);
  };

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg max-w-lg mx-auto border border-[var(--border-subtle)] shadow-sm">
      <div className="flex items-end space-x-3 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-[var(--text-muted)]">Count (1-100)</label>
          <input type="number" min="1" max="100" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded bg-[var(--bg-base)] focus:outline-none focus:border-[var(--accent-devsec)]" />
        </div>
        <button onClick={handleGenerate} className="px-4 py-2 bg-[var(--accent-devsec)] text-white rounded font-medium hover:opacity-90 transition-opacity">Generate</button>
      </div>
      {uuids.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Generated UUIDs</span>
            <button onClick={() => navigator.clipboard.writeText(uuids.join('\n'))} className="text-xs px-3 py-1.5 rounded bg-[var(--border-subtle)] hover:bg-[var(--accent-devsec)] hover:text-white transition-colors">Copy All</button>
          </div>
          <textarea readOnly value={uuids.join('\n')} rows={Math.min(10, uuids.length)} className="w-full text-sm font-mono p-3 border border-[var(--border-subtle)] rounded bg-[var(--bg-base)] resize-none focus:outline-none" />
        </div>
      )}
    </div>
  );
}
