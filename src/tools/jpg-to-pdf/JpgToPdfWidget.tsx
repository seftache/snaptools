"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, X, CheckCircle, ArrowDown } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export default function JpgToPdfWidget({ locale }: { locale: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
      setFiles((prev) => [...prev, ...newFiles]);
      setResultUrl(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setResultUrl(null);
    try {
      const pdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let image;
        if (file.type === "image/jpeg" || file.type === "image/jpg") {
          image = await pdf.embedJpg(arrayBuffer);
        } else if (file.type === "image/png") {
          image = await pdf.embedPng(arrayBuffer);
        } else {
          continue; // skip unsupported
        }

        const { width, height } = image.scale(1);
        const page = pdf.addPage([width, height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (error) {
      console.error("Error converting images to PDF:", error);
      alert("Failed to create PDF from images.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-[var(--text-primary)]">
      <div className="w-full max-w-2xl p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl backdrop-blur-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">JPG/PNG to PDF</h2>
          <p className="text-sm opacity-70">Combine your images into a single PDF document</p>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--glass-bg)] transition-colors mb-6"
        >
          <UploadCloud className="w-12 h-12 mb-4 opacity-70" />
          <p className="font-medium">Click or drag images (JPG, PNG) here</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/jpg"
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
              className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="relative group rounded-lg overflow-hidden border border-[var(--border-subtle)] aspect-square bg-[var(--bg-elevated)]"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 p-1 bg-black/60 text-[10px] text-white truncate text-center">
                    {file.name}
                  </div>
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
            <p className="font-medium mb-4">PDF created successfully!</p>
            <a
              href={resultUrl}
              download="images.pdf"
              className="flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-surface)] rounded-full font-bold hover:opacity-90 transition-opacity"
            >
              <ArrowDown className="w-4 h-4" />
              Download PDF
            </a>
          </motion.div>
        ) : (
          <button
            onClick={handleConvert}
            disabled={files.length === 0 || isProcessing}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            <ImageIcon className="w-5 h-5" />
            {isProcessing ? "Processing..." : "Convert to PDF"}
          </button>
        )}
      </div>
    </div>
  );
}
