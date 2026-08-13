"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, FileDown, Upload, X, Loader2, CheckCircle, ArrowRight } from 'lucide-react';

export default function WordToPdfWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'converting' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.doc') || droppedFile.name.endsWith('.docx')) {
        setFile(droppedFile);
        setStatus('idle');
      } else {
        alert('Please upload a valid Word document (.doc or .docx)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const convertFile = () => {
    if (!file) return;
    setStatus('converting');
    setProgress(0);
    
    // Simulate conversion progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('success');
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const downloadPdf = () => {
    // In a real scenario, this would download the converted PDF
    alert('This is a client-side demo. In a full implementation, this would trigger the PDF download.');
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-[var(--text-primary)] mb-2 flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" />
            <ArrowRight className="w-5 h-5 text-gray-500" />
            <FileDown className="w-8 h-8 text-red-500" />
          </h2>
          <p className="text-gray-400">Convert your Word documents to PDF seamlessly.</p>
        </div>

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-white/5'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
              />
              <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">Drag & Drop your Word file here</h3>
              <p className="text-gray-400 mb-6">or click to browse from your device</p>
              <div className="flex gap-2 text-xs text-gray-500 font-medium">
                <span className="bg-white/5 px-2 py-1 rounded">.DOCX</span>
                <span className="bg-white/5 px-2 py-1 rounded">.DOC</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-[var(--text-primary)] font-medium truncate max-w-[200px] sm:max-w-[300px]">
                      {file.name}
                    </h4>
                    <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                {status === 'idle' && (
                  <button onClick={reset} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {status === 'idle' && (
                <button
                  onClick={convertFile}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  Convert to PDF
                </button>
              )}

              {status === 'converting' && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-400 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Converting...
                    </span>
                    <span className="text-gray-400">{progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-150 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 shrink-0" />
                    <div>
                      <h5 className="font-medium">Conversion Complete!</h5>
                      <p className="text-sm opacity-80">Your document is ready to download.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={downloadPdf}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
                    >
                      <FileDown className="w-5 h-5" />
                      Download PDF
                    </button>
                    <button
                      onClick={reset}
                      className="px-6 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-white/5 text-[var(--text-primary)] rounded-xl font-medium transition-colors"
                    >
                      Convert Another
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
