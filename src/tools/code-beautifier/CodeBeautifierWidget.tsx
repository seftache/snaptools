"use client";
import React, { useState } from 'react';

export default function CodeBeautifierWidget({ locale }: { locale: string }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'json' | 'html'>('json');
  const [error, setError] = useState('');

  const formatCode = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }

    if (mode === 'json') {
      try {
        const parsed = JSON.parse(input);
        setOutput(JSON.stringify(parsed, null, 2));
      } catch (err: any) {
        setError('Invalid JSON: ' + err.message);
      }
    } else {
      // Very basic HTML indentation logic
      let formatted = '';
      let indent = 0;
      const lines = input.replace(/>\s*</g, '>\n<').split('\n');
      lines.forEach((line) => {
        let currentLine = line.trim();
        if (currentLine.match(/^<\/[^>]+>$/)) {
          indent = Math.max(0, indent - 1);
        }
        formatted += '  '.repeat(indent) + currentLine + '\n';
        if (currentLine.match(/^<[^/!][^>]*>$/) && !currentLine.match(/<\/[^>]+>$/) && !currentLine.endsWith('/>')) {
          indent += 1;
        }
      });
      setOutput(formatted.trim());
    }
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-xl max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Code Beautifier</h2>
        <div className="flex gap-2 bg-black/30 p-1 rounded-lg">
          <button
            onClick={() => setMode('json')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${mode === 'json' ? 'bg-blue-500/50 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            JSON
          </button>
          <button
            onClick={() => setMode('html')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${mode === 'html' ? 'bg-blue-500/50 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            HTML
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-80 bg-black/30 border border-white/10 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-blue-500/50"
            placeholder={`Paste your ${mode.toUpperCase()} here...`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Output</label>
          <textarea
            readOnly
            value={output}
            className={`w-full h-80 bg-black/40 border rounded-lg p-4 font-mono text-sm focus:outline-none ${error ? 'border-red-500/50 text-red-300' : 'border-blue-500/30 text-blue-200'}`}
            placeholder="Formatted code will appear here..."
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={formatCode}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20"
        >
          Format Code
        </button>
      </div>
    </div>
  );
}
