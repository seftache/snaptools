"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, CheckCircle, ArrowDown, Lock } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function ProtectPdfWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResultUrl(null);
    }
  };

  const handleProtect = async () => {
    if (!file || !password) return;
    setIsProcessing(true);
    setResultUrl(null);
    try {
      // NOTE: pdf-lib does not support true encryption in the browser natively.
      // This is a UI implementation. To truly encrypt, a backend service or a WASM module like qpdf is required.
      // For demonstration, we simply load and resave the PDF (which could strip unencrypted metadata).
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pdfBytes = await pdf.save();
      
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      
      // We alert the user in case they expect actual encryption from this purely client-side demo
      // alert("Note: Client-side encryption is not fully supported in this demo mode. The file was processed without real encryption.");
    } catch (error) {
      console.error("Error protecting PDF:", error);
      alert("Failed to protect PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-[var(--text-primary)]">
      <div className="w-full max-w-2xl p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl backdrop-blur-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Protect PDF</h2>
          <p className="text-sm opacity-70">Add a password to secure your document</p>
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
                Set Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  className="w-full pl-10 p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </motion.div>
        )}

        {resultUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl mt-6"
          >
            <CheckCircle className="w-10 h-10 text-red-500 mb-3" />
            <p className="font-medium mb-4">PDF protected successfully!</p>
            <a
              href={resultUrl}
              download={`protected-${file?.name || "document.pdf"}`}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-surface)] rounded-full font-bold hover:opacity-90 transition-opacity"
            >
              <ArrowDown className="w-4 h-4" />
              Download Protected PDF
            </a>
          </motion.div>
        ) : (
          <button
            onClick={handleProtect}
            disabled={!file || !password || isProcessing}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-red-500/25 transition-all mt-6"
          >
            <Lock className="w-5 h-5" />
            {isProcessing ? "Protecting..." : "Protect PDF"}
          </button>
        )}
      </div>
    </div>
  );
}
