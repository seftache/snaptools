"use client";

import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
}

interface TabGroupProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function TabGroup({ tabs, activeTab, onTabChange, className = "" }: TabGroupProps) {
  return (
    <div className={`flex space-x-1 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] p-1 border border-[var(--border-subtle)] overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-daily)] ${
            activeTab === tab.id ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
