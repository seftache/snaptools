"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, RotateCcw, Copy, Check, History, 
  Trash2, Sparkles, Binary, Delete, CornerDownLeft 
} from 'lucide-react';

export default function CalculatorWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [expr, setExpr] = useState<string>('');
  const [displayVal, setDisplayVal] = useState<string>('0');
  const [isRad, setIsRad] = useState<boolean>(false);
  const [isSecond, setIsSecond] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Factorial helper
  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let r = 1;
    for (let i = 2; i <= Math.min(n, 170); i++) r *= i;
    return r;
  };

  const handleClear = () => {
    setExpr('');
    setDisplayVal('0');
  };

  const handleBackspace = () => {
    if (displayVal.length > 1 && displayVal !== 'Error' && displayVal !== 'NaN') {
      setDisplayVal((prev) => prev.slice(0, -1));
    } else {
      setDisplayVal('0');
    }
  };

  const handleNumber = (digit: string) => {
    setDisplayVal((prev) => {
      if (prev === '0' || prev === 'Error' || prev === 'NaN') return digit;
      return prev + digit;
    });
  };

  const handleDecimal = () => {
    if (!displayVal.includes('.')) {
      setDisplayVal((prev) => prev + '.');
    }
  };

  const handleOperator = (op: string) => {
    setExpr((prev) => `${prev} ${displayVal} ${op}`);
    setDisplayVal('0');
  };

  const calculateResult = () => {
    if (!expr && displayVal === '0') return;

    const fullExpr = `${expr} ${displayVal}`.trim();
    try {
      // Safe evaluation with math replacement
      let sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, `${Math.PI}`)
        .replace(/\be\b/g, `${Math.E}`)
        .replace(/mod/g, '%');

      // Evaluate safely
      // eslint-disable-next-line no-new-func
      const calcFn = new Function(`return (${sanitized})`);
      let res = calcFn();

      if (typeof res === 'number') {
        if (!isFinite(res)) throw new Error('Overflow');
        // Round floating point inaccuracies
        res = Math.round(res * 1e12) / 1e12;
      }

      const resStr = String(res);
      setHistory((prev) => [{ expr: fullExpr, result: resStr }, ...prev.slice(0, 19)]);
      setDisplayVal(resStr);
      setExpr('');
    } catch {
      setDisplayVal('Error');
      setExpr('');
    }
  };

  const handleScientificFunction = (fn: string) => {
    const val = parseFloat(displayVal);
    if (isNaN(val)) return;

    let res: number = val;
    const toAngle = (rad: number) => (isRad ? rad : (rad * Math.PI) / 180);
    const fromAngle = (v: number) => (isRad ? v : (v * 180) / Math.PI);

    switch (fn) {
      case 'sin':
        res = Math.sin(toAngle(val));
        break;
      case 'cos':
        res = Math.cos(toAngle(val));
        break;
      case 'tan':
        res = Math.tan(toAngle(val));
        break;
      case 'asin':
        res = fromAngle(Math.asin(val));
        break;
      case 'acos':
        res = fromAngle(Math.acos(val));
        break;
      case 'atan':
        res = fromAngle(Math.atan(val));
        break;
      case 'sinh':
        res = Math.sinh(val);
        break;
      case 'cosh':
        res = Math.cosh(val);
        break;
      case 'tanh':
        res = Math.tanh(val);
        break;
      case 'ln':
        res = Math.log(val);
        break;
      case 'log10':
        res = Math.log10(val);
        break;
      case 'log2':
        res = Math.log2(val);
        break;
      case 'sqrt':
        res = Math.sqrt(val);
        break;
      case 'cbrt':
        res = Math.cbrt(val);
        break;
      case 'sq':
        res = val * val;
        break;
      case 'cube':
        res = val * val * val;
        break;
      case 'inv':
        res = 1 / val;
        break;
      case 'exp':
        res = Math.exp(val);
        break;
      case '10pow':
        res = Math.pow(10, val);
        break;
      case 'fact':
        res = factorial(Math.floor(val));
        break;
      case 'abs':
        res = Math.abs(val);
        break;
      case 'plusminus':
        res = -val;
        break;
      case 'percent':
        res = val / 100;
        break;
      default:
        break;
    }

    if (typeof res === 'number') {
      res = Math.round(res * 1e12) / 1e12;
    }

    const resStr = isNaN(res) ? 'Error' : String(res);
    setHistory((prev) => [{ expr: `${fn}(${val})`, result: resStr }, ...prev.slice(0, 19)]);
    setDisplayVal(resStr);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculateResult();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    },
    [displayVal, expr]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {isFr ? 'Calculatrice Scientifique Pro' : 'Scientific Calculator Pro'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {isFr
                ? 'Fonctions trigonométriques, logarithmes, puissances, factorielle, mémoire & historique'
                : 'Trigonometry, logarithms, powers, factorial, memory & full calculation history'}
            </p>
          </div>
        </div>

        {/* Deg / Rad & History Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRad(!isRad)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isRad
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {isRad ? 'RAD (Radians)' : 'DEG (Degrés)'}
          </button>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              showHistory
                ? 'bg-white/20 border-white/30 text-white'
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
            }`}
            title={isFr ? 'Historique des calculs' : 'History'}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">{isFr ? 'Historique' : 'History'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Calculator */}
        <div className="lg:col-span-2 space-y-4">
          {/* High-Tech Digital Display */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/15 shadow-inner relative group">
            <div className="text-xs font-mono text-gray-400 min-h-[1.25rem] text-right break-all">
              {expr || ' '}
            </div>
            <div className="text-3xl sm:text-4xl font-mono font-bold text-white text-right break-all mt-1 tracking-wider">
              {displayVal}
            </div>

            <button
              type="button"
              onClick={copyToClipboard}
              className="absolute left-3 bottom-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all text-xs flex items-center gap-1 opacity-60 group-hover:opacity-100"
              title={isFr ? 'Copier le résultat' : 'Copy result'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isFr ? 'Copié !' : 'Copied!') : (isFr ? 'Copier' : 'Copy')}</span>
            </button>
          </div>

          {/* Memory Bar */}
          <div className="grid grid-cols-5 gap-2 text-xs font-semibold">
            {[
              { label: 'MC', action: () => setMemory(0) },
              { label: 'MR', action: () => setDisplayVal(String(memory)) },
              { label: 'M+', action: () => setMemory((m) => m + parseFloat(displayVal || '0')) },
              { label: 'M-', action: () => setMemory((m) => m - parseFloat(displayVal || '0')) },
              { label: 'MS', action: () => setMemory(parseFloat(displayVal || '0')) },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all font-mono"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Keypad Grid (Scientific + Numeric) */}
          <div className="grid grid-cols-5 gap-2 text-sm">
            {/* Row 1 */}
            <button
              type="button"
              onClick={() => setIsSecond(!isSecond)}
              className={`p-2.5 rounded-xl font-bold border transition-all ${
                isSecond
                  ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20'
                  : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30'
              }`}
            >
              2nd
            </button>
            <button
              type="button"
              onClick={() => handleScientificFunction(isSecond ? 'asin' : 'sin')}
              className="p-2.5 rounded-xl font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
            >
              {isSecond ? 'sin⁻¹' : 'sin'}
            </button>
            <button
              type="button"
              onClick={() => handleScientificFunction(isSecond ? 'acos' : 'cos')}
              className="p-2.5 rounded-xl font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
            >
              {isSecond ? 'cos⁻¹' : 'cos'}
            </button>
            <button
              type="button"
              onClick={() => handleScientificFunction(isSecond ? 'atan' : 'tan')}
              className="p-2.5 rounded-xl font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
            >
              {isSecond ? 'tan⁻¹' : 'tan'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-2.5 rounded-xl font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30"
            >
              AC
            </button>

            {/* Row 2 */}
            <button
              type="button"
              onClick={() => handleScientificFunction(isSecond ? 'exp' : 'ln')}
              className="p-2.5 rounded-xl font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
            >
              {isSecond ? 'eˣ' : 'ln'}
            </button>
            <button
              type="button"
              onClick={() => handleScientificFunction(isSecond ? '10pow' : 'log10')}
              className="p-2.5 rounded-xl font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
            >
              {isSecond ? '10ˣ' : 'log'}
            </button>
            <button
              type="button"
              onClick={() => handleScientificFunction(isSecond ? 'cbrt' : 'sqrt')}
              className="p-2.5 rounded-xl font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
            >
              {isSecond ? '∛x' : '√x'}
            </button>
            <button
              type="button"
              onClick={() => handleScientificFunction(isSecond ? 'cube' : 'sq')}
              className="p-2.5 rounded-xl font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
            >
              {isSecond ? 'x³' : 'x²'}
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="p-2.5 rounded-xl font-bold bg-white/10 hover:bg-white/15 text-gray-300 flex items-center justify-center border border-white/10"
            >
              <Delete className="w-4 h-4" />
            </button>

            {/* Row 3 */}
            <button
              type="button"
              onClick={() => handleScientificFunction('fact')}
              className="p-2.5 rounded-xl font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
            >
              x!
            </button>
            <button
              type="button"
              onClick={() => handleNumber('7')}
              className="p-2.5 rounded-xl font-bold text-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
            >
              7
            </button>
            <button
              type="button"
              onClick={() => handleNumber('8')}
              className="p-2.5 rounded-xl font-bold text-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
            >
              8
            </button>
            <button
              type="button"
              onClick={() => handleNumber('9')}
              className="p-2.5 rounded-xl font-bold text-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
            >
              9
            </button>
            <button
              type="button"
              onClick={() => handleOperator('÷')}
              className="p-2.5 rounded-xl font-bold text-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
            >
              ÷
            </button>

            {/* Row 4 */}
            <button
              type="button"
              onClick={() => handleScientificFunction('inv')}
              className="p-2.5 rounded-xl font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
            >
              1/x
            </button>
            <button
              type="button"
              onClick={() => handleNumber('4')}
              className="p-2.5 rounded-xl font-bold text-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => handleNumber('5')}
              className="p-2.5 rounded-xl font-bold text-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => handleNumber('6')}
              className="p-2.5 rounded-xl font-bold text-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
            >
              6
            </button>
            <button
              type="button"
              onClick={() => handleOperator('×')}
              className="p-2.5 rounded-xl font-bold text-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
            >
              ×
            </button>

            {/* Row 5 */}
            <button
              type="button"
              onClick={() => setDisplayVal(String(Math.PI))}
              className="p-2.5 rounded-xl font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
            >
              π
            </button>
            <button
              type="button"
              onClick={() => handleNumber('1')}
              className="p-2.5 rounded-xl font-bold text-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleNumber('2')}
              className="p-2.5 rounded-xl font-bold text-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleNumber('3')}
              className="p-2.5 rounded-xl font-bold text-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => handleOperator('-')}
              className="p-2.5 rounded-xl font-bold text-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
            >
              -
            </button>

            {/* Row 6 */}
            <button
              type="button"
              onClick={() => setDisplayVal(String(Math.E))}
              className="p-2.5 rounded-xl font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
            >
              e
            </button>
            <button
              type="button"
              onClick={() => handleNumber('0')}
              className="p-2.5 rounded-xl font-bold text-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDecimal}
              className="p-2.5 rounded-xl font-bold text-lg bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
            >
              .
            </button>
            <button
              type="button"
              onClick={calculateResult}
              className="p-2.5 rounded-xl font-bold text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
            >
              =
            </button>
            <button
              type="button"
              onClick={() => handleOperator('+')}
              className="p-2.5 rounded-xl font-bold text-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
            >
              +
            </button>
          </div>
        </div>

        {/* Right Col: Calculation History Stack */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col h-full min-h-[300px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="font-bold text-xs text-gray-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-400" />
              {isFr ? 'Historique des calculs' : 'History'}
            </span>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-[11px] text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                {isFr ? 'Effacer' : 'Clear'}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[360px] pr-1">
            {history.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-500">
                {isFr ? 'Aucun calcul récent' : 'No recent calculations'}
              </div>
            ) : (
              history.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDisplayVal(item.result)}
                  className="w-full text-right p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs group"
                >
                  <div className="text-gray-400 font-mono text-[11px] group-hover:text-blue-300">
                    {item.expr} =
                  </div>
                  <div className="font-mono font-bold text-white text-sm mt-0.5">{item.result}</div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
