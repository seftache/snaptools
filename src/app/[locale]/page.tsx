import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllTools } from '@/config/tools';
import { clusters } from '@/config/clusters';
import type { Metadata } from 'next';
import HubContent from './HubContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hub' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function HubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'hub' });

  const tools = getAllTools();
  const toolsByCluster = clusters.map((cluster) => ({
    cluster,
    tools: tools.filter((tool) => tool.cluster === cluster.id),
  }));

  return (
    <main className="flex-1">
      <HubContent
        toolsByCluster={toolsByCluster}
        locale={locale}
        heroTitle={t('heroTitle')}
        heroSubtitle={t('heroSubtitle')}
      />
    </main>
  );
}
