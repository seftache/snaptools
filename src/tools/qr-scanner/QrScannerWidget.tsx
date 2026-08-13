"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, StopCircle, AlertCircle, Link as LinkIcon, Copy } from 'lucide-react';
// Assuming jsQR is installed or will be installed
import jsQR from 'jsqr';

export default function QrScannerWidget({ locale }: { locale: string }) {
  const [isScanning, setIsScanning] = useState(false);
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    setError('');
    setData(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
        videoRef.current.play();
        setIsScanning(true);
        requestAnimationFrame(tick);
      }
    } catch (err) {
      setError("Unable to access camera. Please make sure you've granted permissions.");
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (canvas && video) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          try {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            
            if (code) {
              setData(code.data);
              stopScanning();
              return; // Stop ticking
            }
          } catch(e) {
            // jsQR might not be loaded if dynamic import fails, handle silently during tick
          }
        }
      }
    }
    
    if (isScanning) {
      requestAnimationFrame(tick);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 backdrop-blur-xl">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Camera className="w-6 h-6 text-teal-400" />
          QR Code Scanner
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="relative rounded-2xl overflow-hidden bg-black/50 border border-[var(--border-subtle)] aspect-video flex items-center justify-center">
          {!isScanning && !data && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <Camera className="w-16 h-16 mb-4 opacity-50" />
              <p>Click start to scan a QR code using your camera</p>
            </div>
          )}
          
          <video ref={videoRef} className={`w-full h-full object-cover ${!isScanning ? 'hidden' : ''}`} />
          <canvas ref={canvasRef} className="hidden" />
          
          {isScanning && (
            <div className="absolute inset-0 border-[6px] border-teal-500/50 rounded-2xl pointer-events-none m-8 animate-pulse" />
          )}

          {data && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="bg-teal-500/20 text-teal-400 p-4 rounded-full mb-4">
                <LinkIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">QR Code Detected</h3>
              <p className="text-gray-300 break-all max-w-md bg-white/10 p-4 rounded-xl border border-white/20 mb-6">
                {data}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigator.clipboard.writeText(data)}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] hover:bg-white/10 border border-[var(--border-subtle)] rounded-xl text-white transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Text
                </button>
                {data.startsWith('http') && (
                  <a
                    href={data}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-xl text-white transition-colors"
                  >
                    Open Link
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-4">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-teal-500/20"
            >
              <Camera className="w-5 h-5" />
              {data ? 'Scan Another' : 'Start Camera'}
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="flex items-center gap-2 px-8 py-3 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl transition-colors font-medium"
            >
              <StopCircle className="w-5 h-5" />
              Stop Camera
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
