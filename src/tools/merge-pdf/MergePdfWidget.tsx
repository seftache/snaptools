"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, X, CheckCircle, ArrowDown } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function MergePdfWidget({ locale }: { locale: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((f) => f.type === "application/pdf");
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setResultUrl(null);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedPdfFile = await mergedPdf.save();
      const blob = new Blob([mergedPdfFile as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert("Failed to merge PDFs. Make sure they are valid PDF files.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-[var(--text-primary)]">
      <div className="w-full max-w-2xl p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl backdrop-blur-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Merge PDFs</h2>
          <p className="text-sm opacity-70">Combine multiple PDF files into one easily</p>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--glass-bg)] transition-colors mb-6"
        >
          <UploadCloud className="w-12 h-12 mb-4 opacity-70" />
          <p className="font-medium">Click or drag PDF files here</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            multiple
            className="hidden"
          />
        </div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 space-y-3"
            >
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate text-sm font-medium">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {resultUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center p-6 bg-green-500/10 border border-green-500/20 rounded-xl"
          >
            <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
            <p className="font-medium mb-4">PDFs merged successfully!</p>
            <a
              href={resultUrl}
              download="merged.pdf"
              className="flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-surface)] rounded-full font-bold hover:opacity-90 transition-opacity"
            >
              <ArrowDown className="w-4 h-4" />
              Download Merged PDF
            </a>
          </motion.div>
        ) : (
          <button
            onClick={handleMerge}
            disabled={files.length < 2 || isProcessing}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            {isProcessing ? "Processing..." : "Merge PDFs"}
          </button>
        )}
      </div>
    </div>
  );
}
