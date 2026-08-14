import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getToolBySlug, getRelatedTools } from '@/config/tools';
import { getClusterById } from '@/config/clusters';
import type { Metadata } from 'next';
import ToolPageContent from '@/components/tools/ToolPageContent';

interface ToolPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) return {};

  const content = tool.locales[locale] || tool.locales.en;
  if (!content) return {};

  const cluster = getClusterById(tool.cluster);
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'snaptools.store';
  const canonicalUrl = `https://${domain}/${locale}/tools/${slug}`;

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries([
        ...Object.keys(tool.locales).map((loc) => [
          loc,
          `https://${domain}/${loc}/tools/${slug}`,
        ]),
        ['x-default', `https://${domain}/en/tools/${slug}`],
      ]),
    },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url: canonicalUrl,
      type: 'website',
      siteName: 'SnapTools',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.metaTitle,
      description: content.metaDescription,
    },
    other: {
      'application-name': 'SnapTools',
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const tool = getToolBySlug(slug);
  if (!tool) {
    notFound();
  }

  const content = tool.locales[locale] || tool.locales.en;
  if (!content) {
    notFound();
  }

  const cluster = getClusterById(tool.cluster);
  const relatedTools = getRelatedTools(slug, 4);

  // Schema.org structured data
  const schemaOrg = [
    // SoftwareApplication schema
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: content.metaTitle,
      description: content.metaDescription,
      url: `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'snaptools.store'}/${locale}/tools/${slug}`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    // FAQPage schema
    ...(content.faq.length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: content.faq.map((item: any) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
              },
            })),
          },
        ]
      : []),
    // BreadcrumbList schema
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'SnapTools',
          item: `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'snaptools.co'}/${locale}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: content.h1,
          item: `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'snaptools.co'}/${locale}/tools/${slug}`,
        },
      ],
    },
  ];

  return (
    <>
      {schemaOrg.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ToolPageContent
        tool={tool}
        content={content}
        cluster={cluster}
        relatedTools={relatedTools}
        locale={locale}
      />
    </>
  );
}
