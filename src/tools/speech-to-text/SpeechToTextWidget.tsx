"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Copy, RefreshCw, AlertCircle } from 'lucide-react';

export default function SpeechToTextWidget({ locale }: { locale: string }) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = locale === 'fr' ? 'fr-FR' : 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setText((prev) => prev + transcript + ' ');
            } else {
              currentTranscript += transcript;
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          setError(`Error occurred in recognition: ${event.error}`);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [locale]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  const clearText = () => {
    setText('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 backdrop-blur-xl">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <Mic className="w-6 h-6 text-pink-400" />
          Speech to Text
        </h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-64 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all resize-none pb-12"
              placeholder="Click microphone to start speaking..."
            />
            {isListening && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-pink-500">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                </span>
                <span className="text-sm font-medium">Listening...</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={toggleListen}
                disabled={!!error && !recognitionRef.current}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors font-medium text-white ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-pink-600 hover:bg-pink-700'
                } disabled:opacity-50`}
              >
                {isListening ? (
                  <>
                    <Square className="w-5 h-5" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Start Listening
                  </>
                )}
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={clearText}
                disabled={!text}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] hover:bg-white/5 border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!text}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] hover:bg-white/5 border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] transition-colors disabled:opacity-50"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
