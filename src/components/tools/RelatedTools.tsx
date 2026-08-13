'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ToolConfig } from '@/config/tools';

interface RelatedToolsProps {
  tools: ToolConfig[];
  locale: string;
}

export default function RelatedTools({ tools, locale }: RelatedToolsProps) {
  const title = locale === 'fr' ? 'Outils similaires' : 'Related Tools';

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-[var(--text-primary)]">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((tool, index) => {
          const content = tool.locales[locale] || tool.locales.en;
          return (
            <Link key={tool.slug} href={`/${locale}/tools/${tool.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 p-4 rounded-xl border transition-colors hover:bg-[var(--bg-surface)]"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <span className="text-xl" role="img" aria-hidden="true">
                  {tool.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-[var(--text-primary)] truncate">
                    {content?.h1 || tool.slug}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {content?.metaDescription || ''}
                  </p>
                </div>
                <span className="text-[var(--text-muted)]" aria-hidden="true">→</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
