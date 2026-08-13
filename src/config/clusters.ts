export type ClusterType = 'daily' | 'media' | 'productivity' | 'devsec' | 'lifestyle';

export interface ClusterConfig {
  id: ClusterType;
  name: { en: string; fr: string };
  accentColor: string;
  ctaTier: 1 | 2 | 3;
}

export const clustersMap: Record<ClusterType, ClusterConfig> = {
  daily: {
    id: 'daily',
    name: { en: 'Daily Utilities', fr: 'Utilitaires du quotidien' },
    accentColor: 'hsl(210, 80%, 60%)',
    ctaTier: 3,
  },
  media: {
    id: 'media',
    name: { en: 'Media & Social', fr: 'Médias & Réseaux sociaux' },
    accentColor: 'hsl(270, 70%, 60%)',
    ctaTier: 3,
  },
  productivity: {
    id: 'productivity',
    name: { en: 'Productivity & Documents', fr: 'Productivité & Documents' },
    accentColor: 'hsl(170, 60%, 50%)',
    ctaTier: 2,
  },
  devsec: {
    id: 'devsec',
    name: { en: 'Dev & Security Tools', fr: 'Outils Dev & Sécurité' },
    accentColor: 'hsl(145, 80%, 50%)',
    ctaTier: 1,
  },
  lifestyle: {
    id: 'lifestyle',
    name: { en: 'Health, Games & Lifestyle', fr: 'Santé, Jeux & Mode de vie' },
    accentColor: 'hsl(25, 90%, 55%)',
    ctaTier: 3,
  },
};

/** Ordered array for iteration (e.g., hub page) */
export const clusters: ClusterConfig[] = [
  clustersMap.daily,
  clustersMap.devsec,
  clustersMap.media,
  clustersMap.productivity,
  clustersMap.lifestyle,
];

export function getClusterById(id: ClusterType): ClusterConfig | undefined {
  return clustersMap[id];
}
