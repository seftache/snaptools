import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Inter, Playfair_Display } from 'next/font/google';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    en: 'SnapTools — Free Online Tools',
    fr: 'SnapTools — Outils en ligne gratuits',
  };

  const descriptions: Record<string, string> = {
    en: 'Free, fast online tools: calculators, converters, generators, and developer utilities. No login required.',
    fr: 'Outils en ligne gratuits et rapides : calculatrices, convertisseurs, générateurs et utilitaires pour développeurs. Sans inscription.',
  };

  return {
    title: {
      default: titles[locale] || titles.en,
      template: `%s | SnapTools`,
    },
    description: descriptions[locale] || descriptions.en,
    metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'snaptools.store'}`),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        fr: '/fr',
        'x-default': '/en',
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'SnapTools',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    authors: [{ name: 'SnapTools' }],
    creator: 'SnapTools',
    publisher: 'SnapTools',
    other: {
      'google-adsense-account': 'ca-pub-6307209882135887',
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as 'en' | 'fr')) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'snaptools.store';

  // Schema.org Global Organization & WebSite Structured Data
  const globalSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'SnapTools',
      url: `https://${domain}`,
      logo: `https://${domain}/favicon.ico`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'SnapTools',
      url: `https://${domain}/${locale}`,
      potentialAction: {
        '@type': 'SearchAction',
        target: `https://${domain}/${locale}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable} dark`} suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6307209882135887"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Organization / WebSite Structured Data */}
        {globalSchema.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="antialiased min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0a', color: '#e0e0e0', fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>

        {/* Global Google Tag Manager / Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1K1NHRF9VC"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1K1NHRF9VC');
          `}
        </Script>
      </body>
    </html>
  );
}
