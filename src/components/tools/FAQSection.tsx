'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSectionProps {
  faq: FAQItem[];
  locale: string;
}

export default function FAQSection({ faq, locale }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const title = locale === 'fr' ? 'Questions fréquentes' : 'Frequently Asked Questions';

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-[var(--text-primary)]">
        {title}
      </h2>
      <div className="space-y-3">
        {faq.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor: 'var(--border-subtle)',
              background: openIndex === index ? 'var(--bg-elevated)' : 'transparent',
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-[var(--bg-surface)] transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-[var(--text-primary)] text-sm sm:text-base">
                {item.q}
              </span>
              <motion.span
                animate={{ rotate: openIndex === index ? 45 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-[var(--text-muted)] text-lg flex-shrink-0"
              >
                +
              </motion.span>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="px-5 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
