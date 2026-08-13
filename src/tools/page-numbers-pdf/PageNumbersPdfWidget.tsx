"use client";

import React, { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";

export default function PageNumbersPdfWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page, idx) => {
        const { width, height } = page.getSize();
        const text = `${idx + 1}`;
        page.drawText(text, {
          x: width / 2 - 5,
          y: 20,
          size: 12,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error(error);
      alert("Error processing PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl border bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-xl backdrop-blur-md">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">Select PDF File</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 bg-black/20 rounded-lg p-2"
        />
      </div>

      <button
        onClick={handleProcess}
        disabled={!file || loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
      >
        {loading ? "Processing..." : "Add Page Numbers"}
      </button>

      {resultUrl && (
        <a
          href={resultUrl}
          download={`numbered-${file?.name || "document.pdf"}`}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-center block"
        >
          Download PDF
        </a>
      )}
    </div>
  );
}
