"use client";
import React, { useState, useEffect } from 'react';

export default function IPInfoWidget({ locale }: { locale: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIP = () => {
    setLoading(true);
    setError('');
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(d => {
        if (d.error) throw new Error(d.reason || 'API Error');
        setData(d);
      })
      .catch(e => setError(locale === 'fr' ? 'Impossible de récupérer les informations' : 'Failed to fetch IP info'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIP();
  }, [locale]);

  return (
    <div className="p-4 bg-[var(--bg-elevated)] rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{locale === 'fr' ? 'Informations IP' : 'IP Information'}</h2>
        <button onClick={fetchIP} className="text-sm px-3 py-1.5 bg-[var(--border-subtle)] rounded-lg hover:bg-[var(--accent-devsec)] hover:text-white transition-colors">
          {locale === 'fr' ? 'Actualiser' : 'Refresh'}
        </button>
      </div>

      {loading && <div className="animate-pulse flex space-x-4"><div className="h-10 bg-[var(--border-subtle)] rounded w-1/2"></div></div>}
      {error && <div className="text-red-500">{error}</div>}
      
      {data && !loading && !error && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl font-mono font-bold">{data.ip}</div>
            <button 
              onClick={() => navigator.clipboard.writeText(data.ip)}
              className="text-xs px-2 py-1 bg-[var(--border-subtle)] rounded hover:bg-[var(--accent-devsec)] hover:text-white transition-colors"
            >
              {locale === 'fr' ? 'Copier' : 'Copy'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-xs text-[var(--text-secondary)]">{locale === 'fr' ? 'Fournisseur' : 'ISP'}</div>
              <div className="font-medium">{data.org || data.asn}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)]">{locale === 'fr' ? 'Localisation' : 'Location'}</div>
              <div className="font-medium">{data.city}, {data.region}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)]">{locale === 'fr' ? 'Pays' : 'Country'}</div>
              <div className="font-medium">{data.country_name}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)]">{locale === 'fr' ? 'Fuseau horaire' : 'Timezone'}</div>
              <div className="font-medium">{data.timezone}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-[var(--text-secondary)]">{locale === 'fr' ? 'Coordonnées (approx)' : 'Coordinates (approx)'}</div>
              <div className="font-medium">{data.latitude}, {data.longitude}</div>
            </div>
          </div>

          <div className="bg-[var(--bg-default)] p-4 rounded-lg border border-[var(--border-subtle)] text-sm">
            <h3 className="font-semibold mb-2">{locale === 'fr' ? 'Que révèle votre IP ?' : 'What your IP reveals about you'}</h3>
            <p className="text-[var(--text-secondary)] mb-2">
              {locale === 'fr' 
                ? "Votre adresse IP permet aux sites web de déduire votre emplacement géographique approximatif et votre fournisseur d'accès internet."
                : "Your IP address allows websites to deduce your approximate geographical location and your internet service provider."}
            </p>
            <p className="text-[var(--text-secondary)]">
              {locale === 'fr'
                ? "Elle ne donne pas votre adresse physique exacte ni votre identité, mais peut être utilisée pour le ciblage publicitaire ou les restrictions géographiques."
                : "It does not provide your exact physical address or identity, but can be used for targeted advertising or geo-restrictions."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
