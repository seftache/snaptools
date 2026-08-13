"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Scissors, File, Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function PdfSplitWidget({ locale }: { locale: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rangeStr, setRangeStr] = useState<string>('');
  const [isSplitting, setIsSplitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPageCount(pdfDoc.getPageCount());
      } catch (err) {
        setError('Invalid PDF file.');
        setFile(null);
      }
    }
  };

  const parseRange = (range: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = range.split(',').map(p => p.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end <= maxPages && start <= end) {
          for (let i = start; i <= end; i++) pages.add(i);
        }
      } else {
        const num = Number(part);
        if (!isNaN(num) && num > 0 && num <= maxPages) {
          pages.add(num);
        }
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  };

  const splitPdf = async () => {
    if (!file) return;
    
    const pagesToExtract = parseRange(rangeStr, pageCount);
    if (pagesToExtract.length === 0) {
      setError('Please enter a valid page range.');
      return;
    }

    setIsSplitting(true);
    setError(null);

    try {
      const fileBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(fileBuffer);
      const newPdf = await PDFDocument.create();
      
      // pdf-lib uses 0-based index
      const indices = pagesToExtract.map(p => p - 1);
      const copiedPages = await newPdf.copyPages(sourcePdf, indices);
      
      copiedPages.forEach(page => newPdf.addPage(page));
      
      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `split_${Date.now()}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Error while splitting PDF.');
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '2rem',
          backdropFilter: 'blur(12px)'
        }}
      >
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Scissors /> Split PDF
        </h2>
        
        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
          Extract specific pages or page ranges from your PDF document.
        </p>

        {!file ? (
          <label 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem',
              border: '2px dashed var(--border-subtle)',
              borderRadius: '12px',
              background: 'var(--bg-surface)',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              transition: 'background 0.2s'
            }}
          >
            <File size={48} color="#aaa" style={{ marginBottom: '1rem' }} />
            <span style={{ color: 'white', fontWeight: 500 }}>Select PDF</span>
            <input 
              type="file" 
              accept="application/pdf" 
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>
        ) : (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <File size={24} color="#6366f1" style={{ marginRight: '1rem' }} />
              <div>
                <div style={{ color: 'white' }}>{file.name}</div>
                <div style={{ color: '#aaa', fontSize: '0.9rem' }}>{pageCount} pages</div>
              </div>
              <button 
                onClick={() => { setFile(null); setRangeStr(''); setPageCount(0); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Pages to extract (e.g. 1-3, 5, 8-10):</label>
              <input 
                type="text" 
                value={rangeStr}
                onChange={(e) => setRangeStr(e.target.value)}
                placeholder="1-5, 8, 11-13"
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'white',
                  width: '100%',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <Button 
          onClick={splitPdf} 
          disabled={!file || !rangeStr || isSplitting}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          {isSplitting ? 'Splitting...' : <><Download size={20} /> Extract Pages</>}
        </Button>
      </motion.div>
    </div>
  );
}
