"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Download, Printer, Grid, Sliders, 
  RotateCcw, Sparkles, Image as ImageIcon, Check, ZoomIn, Eye, Wand2, RefreshCw, Cpu 
} from 'lucide-react';
import { removeBackgroundWithAI } from '@/lib/removeBackgroundAI';

type GridCount = 4 | 8 | 1;
type PhotoFormat = 'eu' | 'us' | 'badge';
type FourPhotoArrangement = 'strip' | 'column' | 'grid';

interface FormatConfig {
  nameFr: string;
  nameEn: string;
  widthMm: number;
  heightMm: number;
  ratio: number; // width / height
}

const FORMATS: Record<PhotoFormat, FormatConfig> = {
  eu: {
    nameFr: 'Standard Europe / Afrique (35 x 45 mm)',
    nameEn: 'Standard EU / Africa (35 x 45 mm)',
    widthMm: 35,
    heightMm: 45,
    ratio: 35 / 45,
  },
  us: {
    nameFr: 'Visa / Passeport USA (50 x 50 mm - 2x2")',
    nameEn: 'US Visa / Passport (50 x 50 mm - 2x2")',
    widthMm: 50,
    heightMm: 50,
    ratio: 1,
  },
  badge: {
    nameFr: 'Format CV / Badge Pro (40 x 50 mm)',
    nameEn: 'Resume / ID Badge (40 x 50 mm)',
    widthMm: 40,
    heightMm: 50,
    ratio: 40 / 50,
  },
};

export default function PassportPhotoWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [gridCount, setGridCount] = useState<GridCount>(4);
  const [fourPhotoLayout, setFourPhotoLayout] = useState<FourPhotoArrangement>('strip');
  const [format, setFormat] = useState<PhotoFormat>('eu');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);
  const [showBiometricGuide, setShowBiometricGuide] = useState<boolean>(true);
  
  // AI Background Removal state
  const [isProcessingBg, setIsProcessingBg] = useState<boolean>(false);
  const [aiProgressText, setAiProgressText] = useState<string>('');
  const [aiPercent, setAiPercent] = useState<number>(0);
  const [aiError, setAiError] = useState<string | null>(null);

  // Transformation adjustments
  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [cutImageSrc, setCutImageSrc] = useState<string | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const rawImgRef = useRef<HTMLImageElement | null>(null);
  const processedImgRef = useRef<HTMLImageElement | null>(null);

  // Check if a photo was transferred from remove-bg tool
  useEffect(() => {
    try {
      const transferredPhoto = sessionStorage.getItem('snaptools_passport_photo');
      if (transferredPhoto) {
        const img = new Image();
        img.onload = () => {
          rawImgRef.current = img;
          processedImgRef.current = img;
          setImageSrc(transferredPhoto);
          setCutImageSrc(transferredPhoto);
          sessionStorage.removeItem('snaptools_passport_photo');
        };
        img.src = transferredPhoto;
      }
    } catch {}
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiError(null);
    setCutImageSrc(null);
    const rawSrc = URL.createObjectURL(file);
    const rawImg = new Image();
    rawImg.onload = () => {
      rawImgRef.current = rawImg;
      processedImgRef.current = rawImg;
      setImageSrc(rawSrc);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setRotation(0);
    };
    rawImg.src = rawSrc;

    // Run AI cutout automatically
    triggerAICutout(file);
  };

  const triggerAICutout = async (sourceFileOrBlob: File | Blob | string) => {
    setIsProcessingBg(true);
    setAiError(null);

    try {
      const transparentUrl = await removeBackgroundWithAI(sourceFileOrBlob, (text, pct) => {
        setAiProgressText(text);
        setAiPercent(pct);
      });

      const cutImg = new Image();
      cutImg.onload = () => {
        processedImgRef.current = cutImg;
        setCutImageSrc(transparentUrl);
        setIsProcessingBg(false);
      };
      cutImg.src = transparentUrl;
    } catch (err: any) {
      console.warn('AI cutout fallback to raw image:', err);
      setAiError(isFr ? 'Détourage IA : conservé sans détourage automatique' : 'AI Cutout skipped');
      setIsProcessingBg(false);
    }
  };

  // Render Single Cropped Photo & Final Sheet (300 DPI)
  useEffect(() => {
    const activeImg = processedImgRef.current || rawImgRef.current;
    if (!activeImg) return;

    // 1. Render Preview of Single Photo
    const previewCanvas = previewCanvasRef.current;
    if (previewCanvas) {
      const pCtx = previewCanvas.getContext('2d');
      if (pCtx) {
        const pWidth = 280;
        const pHeight = pWidth / FORMATS[format].ratio;
        previewCanvas.width = pWidth;
        previewCanvas.height = pHeight;

        // Background
        pCtx.fillStyle = bgColor;
        pCtx.fillRect(0, 0, pWidth, pHeight);

        // Draw Image with transforms
        pCtx.save();
        pCtx.translate(pWidth / 2 + offsetX, pHeight / 2 + offsetY);
        pCtx.rotate((rotation * Math.PI) / 180);
        pCtx.scale(zoom, zoom);

        const imgW = activeImg.width || 1;
        const imgH = activeImg.height || 1;
        const imgRatio = imgW / imgH;
        let drawW = pWidth;
        let drawH = pHeight;
        if (imgRatio > FORMATS[format].ratio) {
          drawW = pHeight * imgRatio;
        } else {
          drawH = pWidth / imgRatio;
        }

        pCtx.drawImage(activeImg, -drawW / 2, -drawH / 2, drawW, drawH);
        pCtx.restore();

        // Biometric Guide Overlay
        if (showBiometricGuide) {
          pCtx.save();
          pCtx.strokeStyle = 'rgba(59, 130, 246, 0.75)';
          pCtx.lineWidth = 1.5;
          pCtx.setLineDash([4, 4]);

          // Head Oval
          pCtx.beginPath();
          pCtx.ellipse(pWidth / 2, pHeight * 0.45, pWidth * 0.28, pHeight * 0.32, 0, 0, Math.PI * 2);
          pCtx.stroke();

          // Eye line
          pCtx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          pCtx.beginPath();
          pCtx.moveTo(pWidth * 0.2, pHeight * 0.42);
          pCtx.lineTo(pWidth * 0.8, pHeight * 0.42);
          pCtx.stroke();

          // Chin line
          pCtx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
          pCtx.beginPath();
          pCtx.moveTo(pWidth * 0.3, pHeight * 0.77);
          pCtx.lineTo(pWidth * 0.7, pHeight * 0.77);
          pCtx.stroke();

          pCtx.restore();
        }
      }
    }

    // 2. Render Full 300 DPI Printable Sheet (10 x 15 cm photo paper standard)
    const sheetCanvas = sheetCanvasRef.current;
    if (sheetCanvas && previewCanvas) {
      const sCtx = sheetCanvas.getContext('2d');
      if (sCtx) {
        // Standard 10x15 cm at 300 DPI = 1800 x 1200 px landscape
        const sheetW = 1800;
        const sheetH = 1200;
        sheetCanvas.width = sheetW;
        sheetCanvas.height = sheetH;

        // White sheet background
        sCtx.fillStyle = '#ffffff';
        sCtx.fillRect(0, 0, sheetW, sheetH);

        // 1 mm = 11.811 px at 300 DPI
        const mmToPx = 11.811;
        const singleW = FORMATS[format].widthMm * mmToPx;
        const singleH = FORMATS[format].heightMm * mmToPx;

        // Draw Single Photo buffer on clean background
        const singleCanvas = document.createElement('canvas');
        singleCanvas.width = singleW;
        singleCanvas.height = singleH;
        const sSingleCtx = singleCanvas.getContext('2d');
        if (sSingleCtx) {
          sSingleCtx.fillStyle = bgColor;
          sSingleCtx.fillRect(0, 0, singleW, singleH);

          sSingleCtx.save();
          sSingleCtx.translate(
            singleW / 2 + (offsetX * singleW) / 280,
            singleH / 2 + (offsetY * singleH) / (280 / FORMATS[format].ratio)
          );
          sSingleCtx.rotate((rotation * Math.PI) / 180);
          sSingleCtx.scale(zoom, zoom);

          const imgW = activeImg.width || 1;
          const imgH = activeImg.height || 1;
          const imgRatio = imgW / imgH;
          let drawW = singleW;
          let drawH = singleH;
          if (imgRatio > FORMATS[format].ratio) {
            drawW = singleH * imgRatio;
          } else {
            drawH = singleW / imgRatio;
          }
          sSingleCtx.drawImage(activeImg, -drawW / 2, -drawH / 2, drawW, drawH);
          sSingleCtx.restore();
        }

        if (gridCount === 1) {
          // Single Photo placed in corner or center
          const posX = 60;
          const posY = 60;
          sCtx.drawImage(singleCanvas, posX, posY, singleW, singleH);
          if (showCropMarks) drawCropMarks(sCtx, posX, posY, singleW, singleH);
        } else if (gridCount === 4) {
          if (fourPhotoLayout === 'strip') {
            // Paper-saving: 4 Photos placed in a compact single row at the top edge
            const gapX = 35;
            const startX = 60;
            const startY = 60;

            for (let c = 0; c < 4; c++) {
              const x = startX + c * (singleW + gapX);
              const y = startY;
              sCtx.drawImage(singleCanvas, x, y, singleW, singleH);
              if (showCropMarks) drawCropMarks(sCtx, x, y, singleW, singleH);
            }
          } else if (fourPhotoLayout === 'column') {
            // Paper-saving: 4 Photos stacked in 2 columns of 2 on the left side
            const gapX = 40;
            const gapY = 40;
            const startX = 60;
            const startY = 60;

            for (let r = 0; r < 2; r++) {
              for (let c = 0; c < 2; c++) {
                const x = startX + c * (singleW + gapX);
                const y = startY + r * (singleH + gapY);
                sCtx.drawImage(singleCanvas, x, y, singleW, singleH);
                if (showCropMarks) drawCropMarks(sCtx, x, y, singleW, singleH);
              }
            }
          } else {
            // Centered 2x2 Grid
            const gapX = 60;
            const gapY = 60;
            const totalW = singleW * 2 + gapX;
            const totalH = singleH * 2 + gapY;
            const startX = (sheetW - totalW) / 2;
            const startY = (sheetH - totalH) / 2;

            for (let r = 0; r < 2; r++) {
              for (let c = 0; c < 2; c++) {
                const x = startX + c * (singleW + gapX);
                const y = startY + r * (singleH + gapY);
                sCtx.drawImage(singleCanvas, x, y, singleW, singleH);
                if (showCropMarks) drawCropMarks(sCtx, x, y, singleW, singleH);
              }
            }
          }
        } else if (gridCount === 8) {
          const gapX = 35;
          const gapY = 40;
          const totalW = singleW * 4 + gapX * 3;
          const totalH = singleH * 2 + gapY;
          const startX = (sheetW - totalW) / 2;
          const startY = (sheetH - totalH) / 2;

          for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 4; c++) {
              const x = startX + c * (singleW + gapX);
              const y = startY + r * (singleH + gapY);
              sCtx.drawImage(singleCanvas, x, y, singleW, singleH);
              if (showCropMarks) drawCropMarks(sCtx, x, y, singleW, singleH);
            }
          }
        }

        sCtx.fillStyle = '#94a3b8';
        sCtx.font = '16px sans-serif';
        sCtx.fillText(
          `SnapTools.store • Format: ${FORMATS[format].nameFr} • Papier Photo 10x15 cm (300 DPI)`,
          60,
          sheetH - 30
        );
      }
    }
  }, [
    imageSrc,
    cutImageSrc,
    gridCount,
    fourPhotoLayout,
    format,
    bgColor,
    showCropMarks,
    showBiometricGuide,
    zoom,
    offsetX,
    offsetY,
    rotation,
    isProcessingBg,
  ]);

  const drawCropMarks = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.save();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  };

  const downloadSheet = (formatType: 'jpg' | 'png') => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `planche-photos-identite-${gridCount}x.${formatType}`;
    link.href = canvas.toDataURL(formatType === 'png' ? 'image/png' : 'image/jpeg', 0.98);
    link.click();
  };

  const printSheet = () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 1.0);

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Impression Planche Photo d'Identité - SnapTools</title>
            <style>
              @page { size: 15cm 10cm; margin: 0; }
              body { margin: 0; display: flex; align-items: center; justify-content: center; background: #fff; }
              img { width: 100%; height: auto; max-width: 15cm; max-height: 10cm; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print();" />
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
          <Grid className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {isFr ? 'Générateur de Photos d\'Identité 4x & 8x sur Support Blanc' : 'Passport & ID Photo Sheet Maker (4x & 8x)'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {isFr ? 'Détourage IA automatique • Planche officielle 300 DPI prête à imprimer (10x15 cm)' : 'Automatic AI cutout • 300 DPI official printable sheet (4x6")'}
          </p>
        </div>
      </div>

      {!imageSrc ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-subtle)] hover:border-blue-500/50 rounded-2xl p-14 text-center cursor-pointer transition-all bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)] group">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-blue-400" />
          </div>
          <span className="text-base font-semibold text-[var(--text-primary)] mb-1">
            {isFr ? 'Importez votre photo ou selfie' : 'Upload your photo or selfie'}
          </span>
          <span className="text-xs text-blue-300 font-medium flex items-center gap-1 mt-1">
            <Sparkles className="w-3.5 h-3.5" />
            {isFr ? 'L\'IA va automatiquement détourer le sujet et le poser sur le fond blanc officiel' : 'AI will automatically isolate the subject onto clean white background'}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      ) : (
        <div className="space-y-6">
          {/* AI Status Badge */}
          {isProcessingBg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/30 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-300 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400 animate-pulse" />
                  {aiProgressText || (isFr ? 'Détourage IA en cours...' : 'AI background removal in progress...')}
                </span>
                <span className="font-mono text-blue-400 font-bold">{aiPercent}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${aiPercent}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* Options & Settings Toolbar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
            {/* Format standard */}
            <div>
              <label className="block font-semibold text-gray-300 mb-1.5">
                {isFr ? '1. Format d\'identité :' : '1. ID Format:'}
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as PhotoFormat)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {Object.entries(FORMATS).map(([key, item]) => (
                  <option key={key} value={key} className="bg-zinc-900 text-white">
                    {isFr ? item.nameFr : item.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid count 4x / 8x / 1x */}
            <div>
              <label className="block font-semibold text-gray-300 mb-1.5">
                {isFr ? '2. Disposition sur la planche :' : '2. Sheet Layout:'}
              </label>
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setGridCount(4)}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                    gridCount === 4 ? 'bg-blue-500 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  4 Photos
                </button>
                <button
                  type="button"
                  onClick={() => setGridCount(8)}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                    gridCount === 8 ? 'bg-blue-500 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  8 Photos
                </button>
                <button
                  type="button"
                  onClick={() => setGridCount(1)}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                    gridCount === 1 ? 'bg-blue-500 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  1 Seule
                </button>
              </div>
            </div>

            {/* Background color */}
            <div>
              <label className="block font-semibold text-gray-300 mb-1.5">
                {isFr ? '3. Couleur de support :' : '3. Background Color:'}
              </label>
              <div className="flex gap-2 items-center h-9">
                <button
                  type="button"
                  onClick={() => setBgColor('#ffffff')}
                  className={`flex-1 h-full rounded-lg bg-white text-zinc-900 font-bold border transition-all text-xs flex items-center justify-center gap-1 ${
                    bgColor === '#ffffff' ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'border-white/20'
                  }`}
                >
                  {bgColor === '#ffffff' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  {isFr ? 'Blanc' : 'White'}
                </button>
                <button
                  type="button"
                  onClick={() => setBgColor('#f1f5f9')}
                  className={`flex-1 h-full rounded-lg bg-slate-200 text-zinc-800 font-bold border transition-all text-xs flex items-center justify-center gap-1 ${
                    bgColor === '#f1f5f9' ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'border-white/20'
                  }`}
                >
                  {bgColor === '#f1f5f9' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  {isFr ? 'Gris clair' : 'Grey'}
                </button>
                <button
                  type="button"
                  onClick={() => setBgColor('#dbeafe')}
                  className={`flex-1 h-full rounded-lg bg-blue-100 text-blue-900 font-bold border transition-all text-xs flex items-center justify-center gap-1 ${
                    bgColor === '#dbeafe' ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'border-white/20'
                  }`}
                >
                  {bgColor === '#dbeafe' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  {isFr ? 'Bleu' : 'Blue'}
                </button>
              </div>
            </div>
          </div>

          {/* 4 Photos Arrangement (Paper-Saving Mode Options) */}
          {gridCount === 4 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-xs">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                {isFr ? 'Alignement 4 Photos (Économie de Papier Photo) :' : '4 Photos Alignment (Paper-Saving):'}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFourPhotoLayout('strip')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    fourPhotoLayout === 'strip'
                      ? 'bg-emerald-500 text-white shadow'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {isFr ? 'Bande en Ligne (Haut)' : 'Top Strip'}
                </button>
                <button
                  type="button"
                  onClick={() => setFourPhotoLayout('column')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    fourPhotoLayout === 'column'
                      ? 'bg-emerald-500 text-white shadow'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {isFr ? 'Bloc Gauche (2x2)' : 'Left Block (2x2)'}
                </button>
                <button
                  type="button"
                  onClick={() => setFourPhotoLayout('grid')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    fourPhotoLayout === 'grid'
                      ? 'bg-emerald-500 text-white shadow'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {isFr ? 'Grille Centrée' : 'Centered'}
                </button>
              </div>
            </div>
          )}

          {/* Interactive Biometric Crop / Alignment Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Preview Canvas with Biometric Oval Guide */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-black/60 border border-white/10">
              <div className="flex items-center justify-between w-full mb-3 text-xs">
                <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  {isFr ? 'Cadrage & Repère biométrique' : 'Biometric framing'}
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-gray-400 hover:text-white">
                  <input
                    type="checkbox"
                    checked={showBiometricGuide}
                    onChange={(e) => setShowBiometricGuide(e.target.checked)}
                    className="accent-blue-500 rounded"
                  />
                  <span>{isFr ? 'Afficher le guide' : 'Show guide'}</span>
                </label>
              </div>

              <div className="p-2 rounded-xl bg-zinc-900 border border-white/20 shadow-2xl relative">
                <canvas ref={previewCanvasRef} className="rounded-lg shadow-inner max-w-full" />
              </div>

              <p className="text-[11px] text-gray-400 mt-2 text-center">
                {isFr
                  ? 'Alignez les yeux sur la ligne rouge et le menton sur la ligne verte.'
                  : 'Align eyes with the red line and chin with the green line.'}
              </p>
            </div>

            {/* Right: Adjustments sliders */}
            <div className="space-y-4 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">
                  {isFr ? 'Ajustements de la photo' : 'Photo Adjustments'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setOffsetX(0);
                    setOffsetY(0);
                    setRotation(0);
                  }}
                  className="flex items-center gap-1 text-blue-400 hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  {isFr ? 'Réinitialiser' : 'Reset'}
                </button>
              </div>

              {/* Zoom */}
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>{isFr ? 'Zoom / Échelle :' : 'Zoom / Scale:'}</span>
                  <span className="font-mono text-blue-400">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Position Verticale (Y) */}
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>{isFr ? 'Position Haut / Bas :' : 'Vertical Position (Y):'}</span>
                  <span className="font-mono text-blue-400">{offsetY}px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  value={offsetY}
                  onChange={(e) => setOffsetY(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Position Horizontale (X) */}
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>{isFr ? 'Position Gauche / Droite :' : 'Horizontal Position (X):'}</span>
                  <span className="font-mono text-blue-400">{offsetX}px</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={offsetX}
                  onChange={(e) => setOffsetX(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Rotation */}
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>{isFr ? 'Redresser / Inclinaison :' : 'Straighten / Rotation:'}</span>
                  <span className="font-mono text-blue-400">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Crop marks toggle & Re-trigger AI Cutout */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={showCropMarks}
                    onChange={(e) => setShowCropMarks(e.target.checked)}
                    className="accent-blue-500 rounded"
                  />
                  <span>
                    {isFr ? 'Lignes de découpe' : 'Scissor cutting lines'}
                  </span>
                </label>

                {rawImgRef.current && (
                  <button
                    type="button"
                    onClick={() => rawImgRef.current && triggerAICutout(rawImgRef.current.src)}
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Wand2 className="w-3 h-3" />
                    {isFr ? 'Re-détourer par IA' : 'Re-run AI cutout'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Hidden 300 DPI Canvas used for High-Res Generation */}
          <canvas ref={sheetCanvasRef} className="hidden" />

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <label className="text-xs text-gray-400 hover:text-white cursor-pointer underline flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              {isFr ? 'Changer de photo' : 'Upload another photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>

            <div className="flex flex-wrap items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={printSheet}
                className="flex items-center gap-2 py-3 px-5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all border border-white/10"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                {isFr ? 'Imprimer Directement' : 'Print Directly'}
              </button>

              <button
                type="button"
                onClick={() => downloadSheet('jpg')}
                className="flex items-center gap-2 py-3 px-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25"
              >
                <Download className="w-4 h-4" />
                {isFr
                  ? `Télécharger la Planche ${gridCount}x Photos (HD 300 DPI)`
                  : `Download ${gridCount}x Photos Sheet (HD 300 DPI)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
