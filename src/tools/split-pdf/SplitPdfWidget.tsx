"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, CheckCircle, ArrowDown, Scissors } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function SplitPdfWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [pageRange, setPageRange] = useState("1");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResultUrl(null);
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResultUrl(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();

      // Simple parser for ranges like "1-3, 5"
      const pagesToKeep = new Set<number>();
      const parts = pageRange.split(",").map((s) => s.trim());
      for (const part of parts) {
        if (part.includes("-")) {
          const [start, end] = part.split("-").map((n) => parseInt(n, 10));
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= totalPages) pagesToKeep.add(i - 1);
            }
          }
        } else {
          const num = parseInt(part, 10);
          if (!isNaN(num) && num >= 1 && num <= totalPages) {
            pagesToKeep.add(num - 1);
          }
        }
      }

      const indices = Array.from(pagesToKeep).sort((a, b) => a - b);
      if (indices.length === 0) {
        throw new Error("No valid pages selected.");
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, indices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const newPdfFile = await newPdf.save();
      const blob = new Blob([newPdfFile as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert("Failed to split PDF. Check your page range and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-[var(--text-primary)]">
      <div className="w-full max-w-2xl p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl backdrop-blur-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Split PDF</h2>
          <p className="text-sm opacity-70">Extract pages or split your PDF by range</p>
        </div>

        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--glass-bg)] transition-colors mb-6"
          >
            <UploadCloud className="w-12 h-12 mb-4 opacity-70" />
            <p className="font-medium">Click or drag a PDF file here</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-4"
          >
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <span className="font-medium">{file.name}</span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-sm opacity-70 hover:opacity-100"
              >
                Change File
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 opacity-80">
                Pages to extract (e.g. 1-3, 5)
              </label>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="1-5, 8, 11-13"
                className="w-full p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:outline-none focus:border-blue-500"
              />
            </div>
          </motion.div>
        )}

        {resultUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center p-6 bg-green-500/10 border border-green-500/20 rounded-xl mt-6"
          >
            <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
            <p className="font-medium mb-4">PDF split successfully!</p>
            <a
              href={resultUrl}
              download="split.pdf"
              className="flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-surface)] rounded-full font-bold hover:opacity-90 transition-opacity"
            >
              <ArrowDown className="w-4 h-4" />
              Download Split PDF
            </a>
          </motion.div>
        ) : (
          <button
            onClick={handleSplit}
            disabled={!file || !pageRange || isProcessing}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/25 transition-all mt-6"
          >
            <Scissors className="w-5 h-5" />
            {isProcessing ? "Processing..." : "Split PDF"}
          </button>
        )}
      </div>
    </div>
  );
}
