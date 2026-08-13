"use client";
import React, { useState } from 'react';

const LOREM = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"];

export default function LoremWidget({ locale }: { locale: string }) {
  const [type, setType] = useState<'paragraphs' | 'words'>('paragraphs');
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState('');

  const generate = () => {
    let res = [];
    if (type === 'words') {
      for (let i = 0; i < count; i++) res.push(LOREM[Math.floor(Math.random() * LOREM.length)]);
      setOutput(res.join(' ') + '.');
    } else {
      for (let p = 0; p < count; p++) {
        let para = [];
        for (let i = 0; i < 30; i++) para.push(LOREM[Math.floor(Math.random() * LOREM.length)]);
        res.push(para.join(' ') + '.');
      }
      setOutput(res.join('\n\n'));
    }
  };

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg max-w-2xl mx-auto border border-[var(--border-subtle)] shadow-sm">
      <div className="flex space-x-4 mb-4">
        <select value={type} onChange={(e) => setType(e.target.value as any)} className="px-3 py-2 border rounded bg-[var(--bg-base)] border-[var(--border-subtle)] focus:outline-none text-[var(--text-primary)]">
          <option value="paragraphs">Paragraphs</option>
          <option value="words">Words</option>
        </select>
        <input type="number" min="1" max="100" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-24 px-3 py-2 border rounded bg-[var(--bg-base)] border-[var(--border-subtle)] focus:outline-none text-[var(--text-primary)]" />
        <button onClick={generate} className="px-4 py-2 bg-[var(--accent-productivity)] text-white rounded font-medium hover:opacity-90 transition-opacity">Generate</button>
      </div>
      {output && (
        <div className="relative">
          <button onClick={() => navigator.clipboard.writeText(output)} className="absolute top-2 right-2 text-xs px-3 py-1.5 rounded bg-[var(--border-subtle)] hover:bg-[var(--accent-productivity)] hover:text-white transition-colors">Copy</button>
          <textarea readOnly value={output} rows={10} className="w-full p-4 pt-10 border rounded-lg bg-[var(--bg-base)] border-[var(--border-subtle)] resize-y focus:outline-none text-[var(--text-secondary)]" />
        </div>
      )}
    </div>
  );
}
