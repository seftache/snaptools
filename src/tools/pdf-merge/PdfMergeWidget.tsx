"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { motion, Reorder } from 'framer-motion';
import { FileUp, File, Trash2, GripVertical, Download, Plus } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function PdfMergeWidget({ locale }: { locale: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge.');
      return;
    }
    
    setIsMerging(true);
    setError(null);
    
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const mergedPdfFile = await mergedPdf.save();
      const blob = new Blob([mergedPdfFile as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged_${Date.now()}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('An error occurred while merging the PDFs.');
    } finally {
      setIsMerging(false);
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
          <FileUp /> Merge PDFs
        </h2>
        
        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
          Combine multiple PDF files into a single document. Drag to reorder.
        </p>

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
          <FileUp size={48} color="#aaa" style={{ marginBottom: '1rem' }} />
          <span style={{ color: 'white', fontWeight: 500 }}>Click to upload PDFs</span>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>or drag and drop</span>
          <input 
            type="file" 
            multiple 
            accept="application/pdf" 
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </label>

        {files.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.1rem' }}>Selected Files ({files.length})</h3>
            <Reorder.Group axis="y" values={files} onReorder={setFiles} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {files.map((file, index) => (
                <Reorder.Item 
                  key={file.name + index} 
                  value={file}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    cursor: 'grab'
                  }}
                >
                  <GripVertical size={20} color="#aaa" style={{ marginRight: '1rem' }} />
                  <File size={24} color="#6366f1" style={{ marginRight: '1rem' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {file.name}
                    </div>
                    <div style={{ color: '#aaa', fontSize: '0.8rem' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFile(index)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                  >
                    <Trash2 size={20} color="#ef4444" />
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <Button 
          onClick={mergePdfs} 
          disabled={files.length < 2 || isMerging}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          {isMerging ? 'Merging...' : <><Download size={20} /> Merge & Download</>}
        </Button>
      </motion.div>
    </div>
  );
}
