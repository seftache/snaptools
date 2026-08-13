"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export function Footer() {
  const year = new Date().getFullYear();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';
  const isFr = locale === 'fr';

  return (
    <footer style={{ width: '100%', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.5), transparent)' }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 32px 40px' }}>
        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '56px' }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '24px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
              Snap<span style={{ color: '#c9a96e' }}>Tools</span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '340px', marginBottom: '24px' }}>
              {isFr
                ? '60+ outils en ligne gratuits, rapides et confidentiels pour créateurs, développeurs et professionnels. Aucun compte requis.'
                : '60+ free, fast, and private online tools for creators, developers, and professionals. No account required.'}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.12)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c9a96e', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                {isFr ? 'Plateforme Propulsée par' : 'Built by'}{' '}
                <a href="https://ethicalhackerprep.com" target="_blank" rel="noopener noreferrer" style={{ color: '#d4b97a', textDecoration: 'none' }}>
                  Ethical Hacker Prep
                </a>
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
              {isFr ? 'Navigation' : 'Navigation'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                [`/${locale}`, isFr ? 'Tous les Outils' : 'Tools Hub'],
                [`/${locale}/privacy`, isFr ? 'Politique de Confidentialité' : 'Privacy Policy'],
                [`/${locale}/terms`, isFr ? 'Conditions d\'Utilisation' : 'Terms of Service'],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a96e')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* EHP */}
          <div>
            <h4 style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
              Ethical Hacker Prep
            </h4>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '20px' }}>
              {isFr
                ? 'Formations et certifications en cybersécurité (CEH, OSCP, CompTIA). Démarrez gratuitement.'
                : 'Cybersecurity training & certifications. CEH, OSCP, CompTIA. Start free.'}
            </p>
            <a
              href="https://ethicalhackerprep.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#c9a96e', textDecoration: 'none' }}
            >
              {isFr ? 'Découvrir EHP →' : 'Visit EHP →'}
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>© {year} SnapTools. Tous droits réservés.</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            Designed &amp; Developed by{' '}
            <a href="https://gadjico.netlify.app" target="_blank" rel="noopener noreferrer" style={{ color: '#c9a96e', textDecoration: 'none' }}>
              Gadjico
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
