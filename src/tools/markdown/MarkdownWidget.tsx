"use client";

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MarkdownWidgetProps {
  locale: string;
}

const TEMPLATES: Record<string, { labelEn: string; labelFr: string; content: string }> = {
  readme: {
    labelEn: 'Project README',
    labelFr: 'README de Projet',
    content: `# Project Name 🚀

> A modern, lightning-fast web tool built with Next.js & TypeScript.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-emerald.svg)](https://github.com)

## ✨ Key Features

- ⚡ **Blazing Fast**: Optimized for speed and performance.
- 🎨 **Modern Dark UI**: Sleek glassmorphic design.
- 🔒 **Client-Side Processing**: 100% private, your data stays in your browser.
- 📱 **Fully Responsive**: Flawless experience on mobile, tablet, and desktop.

## 🛠️ Installation & Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/example/my-project.git

# Navigate to project directory
cd my-project

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## 📊 Comparison Matrix

| Feature | Free Tier | Pro Tier | Enterprise |
| :--- | :---: | :---: | :---: |
| Cloud Sync | ❌ | ✅ | ✅ |
| Speed | Fast | 2x Faster | Dedicated |
| Support | Community | Email (24h) | Dedicated 24/7 |

## 🤝 Contributing

1. Fork the repo
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See \`LICENSE\` for more information.
`
  },
  notes: {
    labelEn: 'Meeting Notes',
    labelFr: 'Notes de Réunion',
    content: `# 📅 Product & Sprint Sync Notes

**Date:** ${new Date().toISOString().split('T')[0]}  
**Attendees:** Alex (Lead), Sarah (Design), Julien (Backend), Maya (Product)  
**Facilitator:** Alex  

---

## 🎯 Agenda

1. Review Sprint #14 achievements & KPIs
2. Discuss Phase 3 release schedule
3. Performance optimization bottlenecks
4. Action Items & Owners

---

## 📌 Discussion Highlights

- **User Retention:** +18% growth since launching dark mode glassmorphism UI.
- **Latency Target:** API response time reduced from 140ms to 45ms.
- **Next Milestone:** Release 5 new productivity & dev tools next Monday.

> *"Simplicity is prerequisite for reliability."* — Edsger W. Dijkstra

---

## ✅ Action Items & Tasks

- [x] Finalize Markdown live preview component
- [x] Configure SEO metadata for all 25 tools
- [ ] Conduct end-to-end load testing on staging
- [ ] Draft announcement newsletter and social assets
`
  },
  blog: {
    labelEn: 'Blog Post Draft',
    labelFr: 'Brouillon d\'Article',
    content: `# 10 Web Development Trends Shaping 2026

*Published on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • 5 min read*

The modern web is evolving at breakneck speed. From edge-first architectures to micro-frontend orchestration, developers have more powerful tools at their fingertips than ever before.

![Web Architecture Visual](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80)

## 1. Zero-Latency Edge Functions

Compute is moving closer to users. Serverless functions deployed across global CDN edge nodes allow sub-10ms response times worldwide.

### Key Benefits:
- **Instant TTFB** (Time to First Byte)
- **Reduced infrastructure costs**
- **Automatic worldwide failover**

\`\`\`typescript
export default async function handler(req: Request) {
  const { city } = req.geo || { city: 'Paris' };
  return new Response(JSON.stringify({ location: city, status: 'ok' }), {
    headers: { 'content-type': 'application/json' }
  });
}
\`\`\`

## 2. Glassmorphic Micro-Interactions

User interfaces are shifting towards tactile, glassmorphic dark-mode experiences with ambient glow and haptic-like animations.

---

### Conclusion & What's Next

Are you already adopting these patterns in your current stack? Leave your thoughts below!
`
  }
};

export default function MarkdownWidget({ locale }: MarkdownWidgetProps) {
  const isFr = locale === 'fr';
  const [markdown, setMarkdown] = useState<string>(TEMPLATES.readme.content);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Markdown parser
  const parsedHtml = useMemo(() => {
    return parseMarkdownToHtml(markdown);
  }, [markdown]);

  // Statistics calculation
  const stats = useMemo(() => {
    const textOnly = markdown.replace(/[#*`~_\[\]()>|+-]/g, ' ').trim();
    const words = textOnly ? textOnly.split(/\s+/).filter(Boolean).length : 0;
    const chars = markdown.length;
    const lines = markdown ? markdown.split('\n').length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, lines, readingTime };
  }, [markdown]);

  // Formatting helpers for toolbar
  const insertFormatting = useCallback((before: string, after: string = '', defaultText: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end);
    const textToInsert = selected || defaultText;
    const replacement = `${before}${textToInsert}${after}`;

    const newMarkdown = markdown.substring(0, start) + replacement + markdown.substring(end);
    setMarkdown(newMarkdown);

    setTimeout(() => {
      textarea.focus();
      const newCursorStart = start + before.length;
      const newCursorEnd = newCursorStart + textToInsert.length;
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    }, 0);
  }, [markdown]);

  const insertLinePrefix = useCallback((prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = markdown.indexOf('\n', end);
    const actualLineEnd = lineEnd === -1 ? markdown.length : lineEnd;

    const selectedLines = markdown.substring(lineStart, actualLineEnd).split('\n');
    const modifiedLines = selectedLines.map(line => `${prefix} ${line.replace(/^(\s*[-*+]|\s*\d+\.|\s*#+)\s*/, '')}`).join('\n');

    const newMarkdown = markdown.substring(0, lineStart) + modifiedLines + markdown.substring(actualLineEnd);
    setMarkdown(newMarkdown);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart, lineStart + modifiedLines.length);
    }, 0);
  }, [markdown]);

  const insertTable = useCallback(() => {
    const tableTemplate = `\n| Header 1 | Header 2 | Header 3 |\n| :--- | :---: | ---: |\n| Cell 1 | Cell 2 | Cell 3 |\n| Value A | Value B | Value C |\n\n`;
    insertFormatting(tableTemplate, '', '');
  }, [insertFormatting]);

  // Copy helper
  const handleCopy = async (type: 'html' | 'md') => {
    const text = type === 'html' ? parsedHtml : markdown;
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(type);
      setTimeout(() => setCopyStatus(null), 2500);
    } catch {
      // Fallback
    }
  };

  // Download markdown (.md)
  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download standalone styled HTML (.html)
  const handleDownloadHtml = () => {
    const fullHtmlDoc = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Markdown Document</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0f111a;
      --text: #e2e8f0;
      --accent: #38bdf8;
      --code-bg: #1e2233;
      --border: #334155;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      max-width: 860px;
      margin: 40px auto;
      padding: 0 24px;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
    }
    h1, h2, h3, h4 { color: #ffffff; margin-top: 1.6em; margin-bottom: 0.6em; }
    h1 { border-bottom: 2px solid var(--border); padding-bottom: 0.3em; font-size: 2.2rem; }
    h2 { border-bottom: 1px solid var(--border); padding-bottom: 0.25em; font-size: 1.6rem; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    pre { background: var(--code-bg); padding: 16px; border-radius: 8px; overflow-x: auto; border: 1px solid var(--border); }
    code { font-family: monospace; font-size: 0.9em; }
    p code { background: var(--code-bg); padding: 2px 6px; border-radius: 4px; color: #a5f3fc; }
    blockquote { border-left: 4px solid var(--accent); margin: 16px 0; padding: 8px 16px; background: rgba(56, 189, 248, 0.05); color: #94a3b8; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid var(--border); padding: 10px 14px; text-align: left; }
    th { background: var(--code-bg); color: #fff; }
    img { max-width: 100%; border-radius: 8px; }
    hr { border: 0; height: 1px; background: var(--border); margin: 32px 0; }
  </style>
</head>
<body>
  ${parsedHtml}
</body>
</html>`;

    const blob = new Blob([fullHtmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[var(--bg-elevated)]/90 backdrop-blur-md rounded-xl border border-[var(--border-subtle)] shadow-sm">
        {/* Templates Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            {isFr ? 'Modèles :' : 'Templates:'}
          </span>
          {Object.entries(TEMPLATES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setMarkdown(t.content)}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--bg-surface)] hover:bg-[var(--glass-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-all hover:border-[var(--accent-productivity)]/40 active:scale-95"
            >
              {isFr ? t.labelFr : t.labelEn}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-subtle)]">
          <button
            onClick={() => setViewMode('edit')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'edit'
                ? 'bg-[var(--accent-productivity)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isFr ? 'Éditeur seul' : 'Editor'}
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`hidden md:block px-3 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'split'
                ? 'bg-[var(--accent-productivity)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isFr ? 'Vue côte à côte' : 'Split View'}
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'preview'
                ? 'bg-[var(--accent-productivity)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isFr ? 'Aperçu seul' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Formatting Toolbar (Visible in edit or split mode) */}
      {viewMode !== 'preview' && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[var(--bg-surface)]/70 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
          <button
            onClick={() => insertFormatting('**', '**', 'bold text')}
            title="Bold (Ctrl+B)"
            className="px-2 py-1 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] font-bold transition-colors"
          >
            B
          </button>
          <button
            onClick={() => insertFormatting('*', '*', 'italic text')}
            title="Italic (Ctrl+I)"
            className="px-2 py-1 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] italic transition-colors"
          >
            I
          </button>
          <button
            onClick={() => insertFormatting('~~', '~~', 'strikethrough')}
            title="Strikethrough"
            className="px-2 py-1 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] line-through transition-colors"
          >
            S
          </button>
          <span className="w-px h-4 bg-[var(--border-subtle)] mx-1" />

          <button
            onClick={() => insertLinePrefix('#')}
            title="Heading 1"
            className="px-2 py-1 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] font-semibold transition-colors"
          >
            H1
          </button>
          <button
            onClick={() => insertLinePrefix('##')}
            title="Heading 2"
            className="px-2 py-1 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] font-semibold transition-colors"
          >
            H2
          </button>
          <button
            onClick={() => insertLinePrefix('###')}
            title="Heading 3"
            className="px-2 py-1 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] font-semibold transition-colors"
          >
            H3
          </button>
          <span className="w-px h-4 bg-[var(--border-subtle)] mx-1" />

          <button
            onClick={() => insertLinePrefix('-')}
            title="Bullet List"
            className="px-2 py-1 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            • List
          </button>
          <button
            onClick={() => insertLinePrefix('1.')}
            title="Numbered List"
            className="px-2 py-1 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            1. List
          </button>
          <button
            onClick={() => insertLinePrefix('- [ ]')}
            title="Task List"
            className="px-2 py-1 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            ☑ Task
          </button>
          <button
            onClick={() => insertLinePrefix('>')}
            title="Quote"
            className="px-2 py-1 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            ❝ Quote
          </button>
          <span className="w-px h-4 bg-[var(--border-subtle)] mx-1" />

          <button
            onClick={() => insertFormatting('`', '`', 'code')}
            title="Inline Code"
            className="px-2 py-1 font-mono rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            {'</>'}
          </button>
          <button
            onClick={() => insertFormatting('```typescript\n', '\n```', '// code snippet')}
            title="Code Block"
            className="px-2 py-1 font-mono rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            Block
          </button>
          <button
            onClick={() => insertFormatting('[', '](https://example.com)', 'link title')}
            title="Insert Link"
            className="px-2 py-1 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            🔗 Link
          </button>
          <button
            onClick={insertTable}
            title="Insert Table"
            className="px-2 py-1 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            📊 Table
          </button>
          <button
            onClick={() => insertFormatting('\n---\n', '', '')}
            title="Horizontal Divider"
            className="px-2 py-1 rounded hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
          >
            — Divider
          </button>

          <div className="ml-auto">
            <button
              onClick={() => setMarkdown('')}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
            >
              {isFr ? 'Effacer' : 'Clear'}
            </button>
          </div>
        </div>
      )}

      {/* Editor & Preview Panes */}
      <div
        className={`grid gap-4 w-full min-h-[460px] ${
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* Editor Area */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div className="flex flex-col bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-surface)]/80 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                {isFr ? 'Éditeur Markdown' : 'Markdown Source'}
              </span>
              <button
                onClick={() => handleCopy('md')}
                className="text-xs text-[var(--accent-productivity)] hover:underline flex items-center gap-1"
              >
                {copyStatus === 'md' ? (isFr ? '✓ Copié !' : '✓ Copied!') : (isFr ? 'Copier .md' : 'Copy .md')}
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder={
                isFr
                  ? 'Tapez ou collez votre code Markdown ici...'
                  : 'Type or paste your Markdown here...'
              }
              className="flex-1 w-full min-h-[420px] p-4 bg-transparent font-mono text-sm leading-relaxed text-[var(--text-primary)] resize-y focus:outline-none placeholder:text-[var(--text-muted)]"
              spellCheck="false"
            />
          </div>
        )}

        {/* Live Preview Area */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="flex flex-col bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-surface)]/80 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  {isFr ? 'Aperçu en Direct' : 'Live Preview'}
                </span>
              </div>
              <button
                onClick={() => handleCopy('html')}
                className="text-xs text-[var(--accent-productivity)] hover:underline flex items-center gap-1"
              >
                {copyStatus === 'html' ? (isFr ? '✓ HTML Copié !' : '✓ HTML Copied!') : (isFr ? 'Copier HTML' : 'Copy HTML')}
              </button>
            </div>
            <div
              className="flex-1 p-6 overflow-y-auto max-h-[600px] prose-dark text-[var(--text-primary)] text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parsedHtml }}
            />
          </div>
        )}
      </div>

      {/* Stats Bar & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] shadow-sm">
        {/* Statistics */}
        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] flex-wrap">
          <div>
            <strong className="text-[var(--text-primary)]">{stats.words}</strong>{' '}
            {isFr ? 'mots' : 'words'}
          </div>
          <span className="text-[var(--border-subtle)]">•</span>
          <div>
            <strong className="text-[var(--text-primary)]">{stats.chars}</strong>{' '}
            {isFr ? 'caractères' : 'characters'}
          </div>
          <span className="text-[var(--border-subtle)]">•</span>
          <div>
            <strong className="text-[var(--text-primary)]">{stats.lines}</strong>{' '}
            {isFr ? 'lignes' : 'lines'}
          </div>
          <span className="text-[var(--border-subtle)]">•</span>
          <div>
            ~<strong className="text-[var(--text-primary)]">{stats.readingTime}</strong>{' '}
            {isFr ? 'min de lecture' : 'min read'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleCopy('html')}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--glass-bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-all flex items-center gap-1.5"
          >
            📋 {copyStatus === 'html' ? (isFr ? 'Copié !' : 'Copied!') : (isFr ? 'Copier HTML' : 'Copy HTML')}
          </button>
          <button
            onClick={handleDownloadMd}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--glass-bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-all flex items-center gap-1.5"
          >
            💾 {isFr ? 'Télécharger .md' : 'Download .md'}
          </button>
          <button
            onClick={handleDownloadHtml}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[var(--accent-productivity)] hover:opacity-90 text-white transition-all shadow-sm flex items-center gap-1.5"
          >
            🌐 {isFr ? 'Exporter HTML (.html)' : 'Download HTML (.html)'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Robust, safe Markdown parser that handles:
 * - Sanitization (escaping raw HTML tags)
 * - Headings (# through ######)
 * - Code blocks with languages
 * - Inline code, bold, italic, strikethrough
 * - Tables with alignments
 * - Blockquotes
 * - Ordered & Unordered & Task lists
 * - Links and Images
 * - Horizontal rules
 */
function parseMarkdownToHtml(md: string): string {
  if (!md) return '<p class="text-[var(--text-muted)] italic">Nothing to preview yet...</p>';

  // Step 1: Escape HTML to avoid XSS
  let text = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Step 2: Extract code blocks before processing inline markdown
  const codeBlocks: string[] = [];
  text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const index = codeBlocks.length;
    const langBadge = lang ? `<span class="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 select-none">${lang}</span>` : '';
    codeBlocks.push(`
      <div class="my-4 rounded-lg overflow-hidden border border-slate-800 bg-[#0d1117]">
        <div class="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-slate-800 text-xs text-slate-400">
          <span>${lang ? lang.toLowerCase() : 'code'}</span>
          ${langBadge}
        </div>
        <pre class="p-4 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed"><code>${code.trim()}</code></pre>
      </div>
    `);
    return `__CODE_BLOCK_${index}__`;
  });

  // Step 3: Tables
  text = text.replace(/((?:\|[^\n]+\|\n?)+)/g, (match) => {
    const rows = match.trim().split('\n').filter(r => r.includes('|'));
    if (rows.length < 2) return match;

    const headerRow = rows[0];
    const separatorRow = rows[1];
    const dataRows = rows.slice(2);

    if (!separatorRow.includes('---')) return match;

    const headers = headerRow
      .split('|')
      .slice(1, -1)
      .map(h => `<th class="border border-[var(--border-subtle)] px-3 py-2 bg-[var(--bg-surface)] text-left font-semibold text-xs text-[var(--text-primary)]">${h.trim()}</th>`)
      .join('');

    const body = dataRows
      .map(row => {
        const cells = row
          .split('|')
          .slice(1, -1)
          .map(c => `<td class="border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-secondary)]">${c.trim()}</td>`)
          .join('');
        return `<tr class="hover:bg-[var(--glass-bg)] transition-colors">${cells}</tr>`;
      })
      .join('');

    return `
      <div class="my-4 overflow-x-auto">
        <table class="w-full border-collapse border border-[var(--border-subtle)] text-left text-sm rounded-lg overflow-hidden">
          <thead><tr>${headers}</tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    `;
  });

  // Step 4: Images & Links
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-4 max-h-80 object-cover border border-[var(--border-subtle)] shadow-md" />');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--accent-productivity)] underline underline-offset-2 hover:opacity-80 transition-opacity">$1</a>');

  // Step 5: Headings
  text = text.replace(/^######\s+(.+)$/gm, '<h6 class="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mt-4 mb-2">$1</h6>');
  text = text.replace(/^#####\s+(.+)$/gm, '<h5 class="text-sm font-bold text-[var(--text-primary)] mt-4 mb-2">$1</h5>');
  text = text.replace(/^####\s+(.+)$/gm, '<h4 class="text-base font-semibold text-[var(--text-primary)] mt-5 mb-2">$1</h4>');
  text = text.replace(/^###\s+(.+)$/gm, '<h3 class="text-lg font-bold text-[var(--text-primary)] mt-6 mb-2.5">$1</h3>');
  text = text.replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-bold text-[var(--text-primary)] mt-7 mb-3 pb-1 border-b border-[var(--border-subtle)]">$1</h2>');
  text = text.replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl font-extrabold text-[var(--text-primary)] mt-8 mb-4 pb-2 border-b border-[var(--border-subtle)]">$1</h1>');

  // Step 6: Blockquotes
  text = text.replace(/^>\s*(.+)$/gm, '<blockquote class="border-l-4 border-[var(--accent-productivity)] pl-4 py-1.5 my-3 text-[var(--text-secondary)] italic bg-[var(--accent-productivity)]/5 rounded-r">$1</blockquote>');

  // Step 7: Horizontal Rules
  text = text.replace(/^(?:---|\*\*\*|___)$/gm, '<hr class="my-6 border-0 h-px bg-[var(--border-subtle)]" />');

  // Step 8: Lists & Task items
  text = text.replace(/^-\s*\[x\]\s*(.+)$/gim, '<li class="list-none flex items-center gap-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" checked disabled class="accent-[var(--accent-productivity)] rounded" /> <span class="line-through text-[var(--text-muted)]">$1</span></li>');
  text = text.replace(/^-\s*\[\s*\]\s*(.+)$/gim, '<li class="list-none flex items-center gap-2 text-xs text-[var(--text-secondary)]"><input type="checkbox" disabled class="accent-[var(--accent-productivity)] rounded" /> <span>$1</span></li>');
  text = text.replace(/^[-*+]\s+(.+)$/gm, '<li class="ml-4 list-disc text-[var(--text-secondary)] mb-1 text-xs">$1</li>');
  text = text.replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-4 list-decimal text-[var(--text-secondary)] mb-1 text-xs">$2</li>');

  // Step 9: Inline formatting
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-[var(--text-primary)]">$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong class="font-semibold text-[var(--text-primary)]">$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em class="italic text-[var(--text-secondary)]">$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em class="italic text-[var(--text-secondary)]">$1</em>');
  text = text.replace(/~~([^~]+)~~/g, '<del class="line-through text-[var(--text-muted)]">$1</del>');
  text = text.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--accent-productivity)] font-mono text-xs">$1</code>');

  // Step 10: Paragraph breaks
  text = text.split('\n\n').map(para => {
    para = para.trim();
    if (!para) return '';
    if (para.startsWith('<h') || para.startsWith('<div') || para.startsWith('<table') || para.startsWith('<blockquote') || para.startsWith('<hr') || para.startsWith('<li') || para.startsWith('__CODE_BLOCK_')) {
      return para;
    }
    return `<p class="mb-3 text-xs leading-relaxed text-[var(--text-secondary)]">${para.replace(/\n/g, '<br />')}</p>`;
  }).join('\n');

  // Step 11: Re-insert code blocks
  codeBlocks.forEach((block, index) => {
    text = text.replace(`__CODE_BLOCK_${index}__`, block);
  });

  return text;
}
