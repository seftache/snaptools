"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface MarginWidgetProps {
  locale: string;
}

type CalculationMode = 'cost_revenue' | 'cost_margin' | 'cost_markup';

const CURRENCIES = [
  { symbol: '$', label: 'USD ($)' },
  { symbol: '€', label: 'EUR (€)' },
  { symbol: '£', label: 'GBP (£)' },
  { symbol: 'CA$', label: 'CAD ($)' },
  { symbol: 'CHF', label: 'CHF' },
  { symbol: '¥', label: 'JPY (¥)' },
];

const COMPARISON_TABLE = [
  { margin: 10, markup: 11.11 },
  { margin: 15, markup: 17.65 },
  { margin: 20, markup: 25.00 },
  { margin: 25, markup: 33.33 },
  { margin: 30, markup: 42.86 },
  { margin: 33.33, markup: 50.00 },
  { margin: 40, markup: 66.67 },
  { margin: 50, markup: 100.00 },
  { margin: 60, markup: 150.00 },
  { margin: 75, markup: 300.00 },
];

export default function MarginWidget({ locale }: MarginWidgetProps) {
  const isFr = locale === 'fr';

  // Calculator State
  const [mode, setMode] = useState<CalculationMode>('cost_revenue');
  const [currency, setCurrency] = useState('$');
  const [costInput, setCostInput] = useState<string>('50');
  const [revenueInput, setRevenueInput] = useState<string>('80');
  const [marginInput, setMarginInput] = useState<string>('37.5');
  const [markupInput, setMarkupInput] = useState<string>('60');
  const [unitsInput, setUnitsInput] = useState<string>('100');
  const [copied, setCopied] = useState(false);

  // Parse inputs safely
  const cost = Math.max(0, parseFloat(costInput) || 0);
  const units = Math.max(1, parseInt(unitsInput) || 1);

  // Compute outputs based on active mode
  const calculations = useMemo(() => {
    let sellingPrice = 0;
    let profit = 0;
    let marginPercent = 0;
    let markupPercent = 0;

    if (mode === 'cost_revenue') {
      sellingPrice = Math.max(0, parseFloat(revenueInput) || 0);
      profit = sellingPrice - cost;
      marginPercent = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
      markupPercent = cost > 0 ? (profit / cost) * 100 : (profit > 0 ? 100 : 0);
    } else if (mode === 'cost_margin') {
      const targetMargin = Math.min(99.9, Math.max(-200, parseFloat(marginInput) || 0));
      sellingPrice = targetMargin < 100 ? cost / (1 - targetMargin / 100) : cost * 2;
      profit = sellingPrice - cost;
      marginPercent = targetMargin;
      markupPercent = cost > 0 ? (profit / cost) * 100 : 0;
    } else if (mode === 'cost_markup') {
      const targetMarkup = Math.max(-100, parseFloat(markupInput) || 0);
      sellingPrice = cost * (1 + targetMarkup / 100);
      profit = sellingPrice - cost;
      markupPercent = targetMarkup;
      marginPercent = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
    }

    const totalRevenue = sellingPrice * units;
    const totalCost = cost * units;
    const totalProfit = profit * units;

    // Visual percentage breakdown (capped between 0 and 100 for display)
    let costRatio = 100;
    let profitRatio = 0;
    if (sellingPrice > 0 && profit >= 0) {
      costRatio = Math.min(100, Math.max(0, (cost / sellingPrice) * 100));
      profitRatio = Math.min(100, Math.max(0, (profit / sellingPrice) * 100));
    } else if (sellingPrice > 0 && profit < 0) {
      costRatio = 100;
      profitRatio = 0;
    }

    return {
      sellingPrice: Number(sellingPrice.toFixed(2)),
      profit: Number(profit.toFixed(2)),
      marginPercent: Number(marginPercent.toFixed(2)),
      markupPercent: Number(markupPercent.toFixed(2)),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      costRatio: Number(costRatio.toFixed(1)),
      profitRatio: Number(profitRatio.toFixed(1)),
      isLoss: profit < 0,
    };
  }, [mode, cost, revenueInput, marginInput, markupInput, units]);

  // Copy calculations summary
  const copySummary = () => {
    const summaryText = isFr
      ? `📊 Analyse Marge & Markup (SnapTools)
- Prix d'Achat (Coût) : ${currency}${cost.toFixed(2)}
- Prix de Vente : ${currency}${calculations.sellingPrice.toFixed(2)}
- Bénéfice Brut : ${currency}${calculations.profit.toFixed(2)}
- Marge Bénéficiaire : ${calculations.marginPercent.toFixed(2)}%
- Taux de Marque / Markup : ${calculations.markupPercent.toFixed(2)}%
- Pour ${units} unités -> Revenu: ${currency}${calculations.totalRevenue.toFixed(2)} | Profit: ${currency}${calculations.totalProfit.toFixed(2)}`
      : `📊 Profit Margin & Markup Analysis (SnapTools)
- Cost Price: ${currency}${cost.toFixed(2)}
- Selling Price: ${currency}${calculations.sellingPrice.toFixed(2)}
- Gross Profit: ${currency}${calculations.profit.toFixed(2)}
- Profit Margin: ${calculations.marginPercent.toFixed(2)}%
- Markup: ${calculations.markupPercent.toFixed(2)}%
- For ${units} units -> Revenue: ${currency}${calculations.totalRevenue.toFixed(2)} | Total Profit: ${currency}${calculations.totalProfit.toFixed(2)}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Mode & Currency Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] shadow-sm">
        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border-subtle)] flex-wrap">
          <button
            onClick={() => setMode('cost_revenue')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              mode === 'cost_revenue'
                ? 'bg-[var(--accent-productivity)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isFr ? 'Coût + Prix de Vente' : 'Cost + Selling Price'}
          </button>
          <button
            onClick={() => setMode('cost_margin')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              mode === 'cost_margin'
                ? 'bg-[var(--accent-productivity)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isFr ? 'Coût + Marge Voulue (%)' : 'Cost + Target Margin (%)'}
          </button>
          <button
            onClick={() => setMode('cost_markup')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              mode === 'cost_markup'
                ? 'bg-[var(--accent-productivity)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isFr ? 'Coût + Markup Voulue (%)' : 'Cost + Target Markup (%)'}
          </button>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[var(--text-secondary)]">
            {isFr ? 'Devise :' : 'Currency:'}
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--accent-productivity)]"
          >
            {CURRENCIES.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Inputs + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 p-5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center justify-between">
            <span>{isFr ? 'Paramètres de Calcul' : 'Calculation Parameters'}</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)]">
              {mode.replace('_', ' ')}
            </span>
          </h3>

          {/* Cost Input */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              {isFr ? "Prix de Revient (Coût d'Achat)" : 'Cost Price (COGS)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)] font-mono">
                {currency}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-productivity)]"
                placeholder="50.00"
              />
            </div>
          </div>

          {/* Conditional Second Input */}
          {mode === 'cost_revenue' && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                {isFr ? 'Prix de Vente (Chiffre d\'Affaires Unitaire)' : 'Selling Price (Revenue)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)] font-mono">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={revenueInput}
                  onChange={(e) => setRevenueInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-productivity)]"
                  placeholder="80.00"
                />
              </div>
            </div>
          )}

          {mode === 'cost_margin' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  {isFr ? 'Marge Bénéficiaire Souhaitée (%)' : 'Desired Profit Margin (%)'}
                </label>
                <span className="text-xs font-mono font-bold text-[var(--accent-productivity)]">
                  {marginInput}%
                </span>
              </div>
              <div className="relative mb-2">
                <input
                  type="number"
                  min="0"
                  max="99"
                  step="0.1"
                  value={marginInput}
                  onChange={(e) => setMarginInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-productivity)]"
                  placeholder="30"
                />
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="0.5"
                value={parseFloat(marginInput) || 0}
                onChange={(e) => setMarginInput(e.target.value)}
                className="w-full accent-[var(--accent-productivity)] cursor-pointer"
              />
            </div>
          )}

          {mode === 'cost_markup' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  {isFr ? 'Taux de Marque Souhaité / Markup (%)' : 'Desired Markup (%)'}
                </label>
                <span className="text-xs font-mono font-bold text-[var(--accent-productivity)]">
                  {markupInput}%
                </span>
              </div>
              <div className="relative mb-2">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  value={markupInput}
                  onChange={(e) => setMarkupInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-productivity)]"
                  placeholder="50"
                />
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={parseFloat(markupInput) || 0}
                onChange={(e) => setMarkupInput(e.target.value)}
                className="w-full accent-[var(--accent-productivity)] cursor-pointer"
              />
            </div>
          )}

          {/* Volume / Units for Total Projection */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              {isFr ? 'Quantité / Volume Prévu (Unités)' : 'Quantity / Estimated Volume (Units)'}
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={unitsInput}
              onChange={(e) => setUnitsInput(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-productivity)]"
              placeholder="100"
            />
          </div>

          <button
            onClick={() => {
              setCostInput('50');
              setRevenueInput('80');
              setMarginInput('37.5');
              setMarkupInput('60');
              setUnitsInput('100');
            }}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] self-end mt-1 transition-colors"
          >
            {isFr ? '↺ Réinitialiser les valeurs' : '↺ Reset default values'}
          </button>
        </div>

        {/* Right Column: Key Outputs & Visual Breakdown (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Key Output Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Selling Price */}
            <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex flex-col">
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                {isFr ? 'Prix de Vente' : 'Selling Price'}
              </span>
              <span className="text-xl font-bold font-mono text-[var(--text-primary)] mt-1 truncate">
                {currency}{calculations.sellingPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-auto pt-1">
                {isFr ? 'par unité' : 'per unit'}
              </span>
            </div>

            {/* Gross Profit */}
            <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex flex-col">
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                {isFr ? 'Bénéfice Brut' : 'Gross Profit'}
              </span>
              <span
                className={`text-xl font-bold font-mono mt-1 truncate ${
                  calculations.isLoss ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {calculations.profit >= 0 ? '+' : ''}
                {currency}{calculations.profit.toFixed(2)}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-auto pt-1">
                {isFr ? 'marge en valeur' : 'profit in $'}
              </span>
            </div>

            {/* Margin % */}
            <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex flex-col">
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                {isFr ? 'Marge Brute' : 'Profit Margin'}
              </span>
              <span
                className={`text-xl font-bold font-mono mt-1 truncate ${
                  calculations.isLoss ? 'text-rose-400' : 'text-[var(--accent-productivity)]'
                }`}
              >
                {calculations.marginPercent.toFixed(1)}%
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-auto pt-1">
                % {isFr ? 'du C.A.' : 'of Revenue'}
              </span>
            </div>

            {/* Markup % */}
            <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex flex-col">
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                {isFr ? 'Taux de Marque' : 'Markup'}
              </span>
              <span className="text-xl font-bold font-mono text-cyan-400 mt-1 truncate">
                {calculations.markupPercent.toFixed(1)}%
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-auto pt-1">
                % {isFr ? 'du Coût' : 'of Cost'}
              </span>
            </div>
          </div>

          {/* Visual Breakdown Bar (Cost vs Profit) */}
          <div className="p-5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--text-primary)]">
                {isFr ? 'Répartition Visuelle du Prix de Vente' : 'Revenue Breakdown per Unit'}
              </span>
              <span className="font-mono text-[var(--text-secondary)]">
                100% = {currency}{calculations.sellingPrice.toFixed(2)}
              </span>
            </div>

            {/* Dual Color Bar */}
            <div className="w-full h-6 rounded-lg overflow-hidden flex bg-slate-900 border border-[var(--border-subtle)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calculations.costRatio}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-slate-700/80 flex items-center justify-center text-[10px] font-mono text-slate-200 font-semibold px-2 truncate"
                title={`Cost: ${currency}${cost.toFixed(2)} (${calculations.costRatio}%)`}
              >
                {calculations.costRatio > 15 && `${isFr ? 'Coût' : 'Cost'} ${calculations.costRatio}%`}
              </motion.div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calculations.profitRatio}%` }}
                transition={{ duration: 0.4 }}
                className={`h-full flex items-center justify-center text-[10px] font-mono font-semibold px-2 truncate ${
                  calculations.isLoss ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'
                }`}
                title={`Profit: ${currency}${calculations.profit.toFixed(2)} (${calculations.profitRatio}%)`}
              >
                {calculations.profitRatio > 15 && `${isFr ? 'Profit' : 'Profit'} ${calculations.profitRatio}%`}
              </motion.div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-xs pt-1 text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-700 border border-slate-600 inline-block" />
                <span>
                  {isFr ? 'Coût d\'Achat :' : 'Cost Price:'} <strong>{currency}{cost.toFixed(2)}</strong> ({calculations.costRatio}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded inline-block ${calculations.isLoss ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <span>
                  {isFr ? 'Bénéfice Net :' : 'Gross Profit:'} <strong className={calculations.isLoss ? 'text-rose-400' : 'text-emerald-400'}>{currency}{calculations.profit.toFixed(2)}</strong> ({calculations.profitRatio}%)
                </span>
              </div>
            </div>
          </div>

          {/* Volume Projection Card */}
          <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[var(--text-muted)] block">
                {isFr ? `Projection pour ${units} unités vendues :` : `Projection for ${units} units sold:`}
              </span>
              <div className="flex items-center gap-4 mt-1 font-mono">
                <span>
                  {isFr ? 'C.A. Total :' : 'Total Revenue:'} <strong className="text-[var(--text-primary)]">{currency}{calculations.totalRevenue.toLocaleString()}</strong>
                </span>
                <span>•</span>
                <span>
                  {isFr ? 'Bénéfice Total :' : 'Total Profit:'} <strong className={calculations.isLoss ? 'text-rose-400' : 'text-emerald-400'}>{currency}{calculations.totalProfit.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={copySummary}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--glass-bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-all flex items-center gap-1.5 active:scale-95"
            >
              {copied ? (isFr ? '✓ Rapport Copié !' : '✓ Copied!') : (isFr ? '📋 Copier le Résumé' : '📋 Copy Summary')}
            </button>
          </div>
        </div>
      </div>

      {/* Educational & Comparison Section: Margin vs Markup */}
      <div className="p-5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex flex-col gap-4">
        <h4 className="text-sm font-bold text-[var(--text-primary)]">
          {isFr ? 'Comprendre la Différence : Marge vs Taux de Marque (Markup)' : 'Understanding the Difference: Margin vs Markup'}
        </h4>

        {/* Side-by-side concept cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
          {/* Margin Concept */}
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--accent-productivity)] text-sm">
                {isFr ? 'Marge Bénéficiaire (Profit Margin)' : 'Profit Margin'}
              </span>
              <span className="text-[10px] font-mono bg-[var(--accent-productivity)]/10 text-[var(--accent-productivity)] px-2 py-0.5 rounded">
                Profit ÷ Prix de Vente
              </span>
            </div>
            <p className="text-[var(--text-secondary)]">
              {isFr
                ? 'La marge exprime le pourcentage de profit par rapport au chiffre d\'affaires total (prix de vente). Elle ne peut jamais dépasser 100%.'
                : 'Margin represents the percentage of total sales revenue that is profit. A 30% margin means $30 out of every $100 in revenue is profit. Margin cannot exceed 100%.'}
            </p>
            <div className="font-mono text-[11px] p-2 bg-[var(--bg-elevated)] rounded text-slate-300">
              Margin (%) = ((Selling Price - Cost) / Selling Price) × 100
            </div>
          </div>

          {/* Markup Concept */}
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-400 text-sm">
                {isFr ? 'Taux de Marque / Coefficient (Markup)' : 'Markup'}
              </span>
              <span className="text-[10px] font-mono bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded">
                Profit ÷ Coût d'Achat
              </span>
            </div>
            <p className="text-[var(--text-secondary)]">
              {isFr
                ? 'Le markup (taux de marque) est le pourcentage ajouté au coût initial pour obtenir le prix de vente. Il peut largement dépasser 100%.'
                : 'Markup is the percentage added to the cost price of goods to determine the selling price. Unlike margin, markup can exceed 100% (e.g. 300% markup on a $10 item = $40 price).'}
            </p>
            <div className="font-mono text-[11px] p-2 bg-[var(--bg-elevated)] rounded text-slate-300">
              Markup (%) = ((Selling Price - Cost) / Cost) × 100
            </div>
          </div>
        </div>

        {/* Quick Reference Conversion Table */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">
            {isFr ? 'Table d\'Équivalence Rapide (Marge ↔ Markup) :' : 'Quick Reference Conversion Table (Margin ↔ Markup):'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
            {COMPARISON_TABLE.map((row) => (
              <div
                key={row.margin}
                className="p-2 bg-[var(--bg-surface)] rounded border border-[var(--border-subtle)] hover:border-[var(--accent-productivity)]/40 transition-colors"
              >
                <div className="text-[var(--accent-productivity)] font-bold">{row.margin}% {isFr ? 'Marge' : 'Margin'}</div>
                <div className="text-[var(--text-muted)] text-[10px]">▼</div>
                <div className="text-cyan-400 font-bold">{row.markup.toFixed(1)}% {isFr ? 'Markup' : 'Markup'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
