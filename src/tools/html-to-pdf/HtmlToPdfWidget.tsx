"use client";

import React, { useState, useRef } from "react";

export default function HtmlToPdfWidget({ locale }: { locale: string }) {
  const [htmlCode, setHtmlCode] = useState("<h1>Hello World</h1><p>This is a test PDF.</p>");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = () => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlCode);
      iframeDoc.close();
      
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl border bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-xl backdrop-blur-md">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">HTML Code</label>
        <textarea
          value={htmlCode}
          onChange={(e) => setHtmlCode(e.target.value)}
          rows={8}
          className="bg-black/30 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 font-mono text-sm"
          placeholder="Enter HTML..."
        />
      </div>

      <button
        onClick={handlePrint}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        Convert via Print
      </button>

      {/* Hidden iframe for printing */}
      <iframe ref={iframeRef} style={{ display: 'none' }} title="Print Frame" />
    </div>
  );
}
