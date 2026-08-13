"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle, ArrowDown, Image as ImageIcon } from "lucide-react";

export default function PdfToJpgWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Dynamic import to configure worker for pdfjs
    import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;
    }).catch((err) => {
      console.warn("Failed to load pdfjs worker. It might not be installed or configured correctly.", err);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImageUrls([]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setImageUrls([]);
    try {
      const pdfjs = await import("pdfjs-dist");
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const urls: string[] = [];

      for (let i = 1; i <= Math.min(numPages, 20); i++) { // Limit to 20 pages for client-side memory safety
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport } as any).promise;
          const url = canvas.toDataURL("image/jpeg", 0.9);
          urls.push(url);
        }
      }
      setImageUrls(urls);
    } catch (error) {
      console.error("Error converting PDF to JPG:", error);
      alert("Failed to convert PDF. Note: Ensure pdfjs-dist is installed correctly.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-[var(--text-primary)]">
      <div className="w-full max-w-4xl p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl backdrop-blur-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">PDF to JPG</h2>
          <p className="text-sm opacity-70">Convert each page of your PDF into high-quality JPG images</p>
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
            className="mb-6"
          >
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <span className="font-medium">{file.name}</span>
              </div>
              <button
                onClick={() => { setFile(null); setImageUrls([]); }}
                className="text-sm opacity-70 hover:opacity-100"
              >
                Change File
              </button>
            </div>
          </motion.div>
        )}

        {imageUrls.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <div className="flex items-center justify-center gap-2 mb-6 text-green-500">
              <CheckCircle className="w-6 h-6" />
              <span className="font-bold text-lg">Converted {imageUrls.length} pages</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-[var(--border-subtle)]">
                  <img src={url} alt={`Page ${idx + 1}`} className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <a
                      href={url}
                      download={`page-${idx + 1}.jpg`}
                      className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </a>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                    Page {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <button
            onClick={handleConvert}
            disabled={!file || isProcessing}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-yellow-500/25 transition-all mt-6"
          >
            <ImageIcon className="w-5 h-5" />
            {isProcessing ? "Converting..." : "Convert to JPG"}
          </button>
        )}
      </div>
    </div>
  );
}
