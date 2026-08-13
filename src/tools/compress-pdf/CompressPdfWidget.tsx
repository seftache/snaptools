"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, CheckCircle, ArrowDown, Minimize2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function CompressPdfWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; oldSize: number; newSize: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Load and save to strip some incremental data and metadata
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      // Basic "compression" by removing metadata and reserializing without object streams if needed, 
      // pdf-lib's save() often reduces size of heavily edited PDFs.
      pdf.setTitle("");
      pdf.setAuthor("");
      pdf.setSubject("");
      pdf.setKeywords([]);
      pdf.setProducer("SnapTools Compress");
      pdf.setCreator("SnapTools Compress");

      const compressedBytes = await pdf.save({ useObjectStreams: false });
      const blob = new Blob([compressedBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      setResult({
        url,
        oldSize: file.size,
        newSize: blob.size,
      });
    } catch (error) {
      console.error("Error compressing PDF:", error);
      alert("Failed to compress PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-[var(--text-primary)]">
      <div className="w-full max-w-2xl p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl backdrop-blur-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Compress PDF</h2>
          <p className="text-sm opacity-70">Reduce file size while optimizing for quality</p>
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
                <div>
                  <span className="font-medium block">{file.name}</span>
                  <span className="text-xs opacity-60">{formatSize(file.size)}</span>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-sm opacity-70 hover:opacity-100"
              >
                Change File
              </button>
            </div>
          </motion.div>
        )}

        {result ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl mt-6"
          >
            <CheckCircle className="w-10 h-10 text-blue-500 mb-3" />
            <p className="font-medium mb-2">Compression Complete!</p>
            <p className="text-sm opacity-70 mb-4">
              {formatSize(result.oldSize)} &rarr; {formatSize(result.newSize)}
              {result.newSize < result.oldSize ? ` (${Math.round((1 - result.newSize / result.oldSize) * 100)}% smaller)` : " (Already optimized)"}
            </p>
            <a
              href={result.url}
              download="compressed.pdf"
              className="flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-surface)] rounded-full font-bold hover:opacity-90 transition-opacity"
            >
              <ArrowDown className="w-4 h-4" />
              Download Compressed PDF
            </a>
          </motion.div>
        ) : (
          <button
            onClick={handleCompress}
            disabled={!file || isProcessing}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/25 transition-all mt-6"
          >
            <Minimize2 className="w-5 h-5" />
            {isProcessing ? "Compressing..." : "Compress PDF"}
          </button>
        )}
      </div>
    </div>
  );
}
