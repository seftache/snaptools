export const siteConfig = {
  name: 'SnapTools',
  domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'snaptools.store',
  url: `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'snaptools.store'}`,
  ehpUrl: 'https://ethicalhackerprep.com',
  ehpName: 'Ethical Hacker Prep',
  description: { 
    en: 'A collection of fast, simple, and free online tools for everyday tasks, developers, and productivity.', 
    fr: 'Une collection d\'outils en ligne rapides, simples et gratuits pour les tâches quotidiennes, les développeurs et la productivité.' 
  },
  locales: ['en', 'fr'] as const,
  defaultLocale: 'en' as const,
  routingMode: (process.env.ROUTING_MODE || 'subfolder') as 'subdomain' | 'subfolder',
} as const;

export type Locale = typeof siteConfig.locales[number];
