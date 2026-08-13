'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { ClusterConfig } from '@/config/clusters';
import type { ToolConfig } from '@/config/tools';
import { EHPCarousel } from '@/components/cta/EHPCarousel';

interface ClusterGroup { cluster: ClusterConfig; tools: ToolConfig[]; }
interface Props { toolsByCluster: ClusterGroup[]; locale: string; heroTitle: string; heroSubtitle: string; }

/* ── TOOL CARD ─────────────────────────────────────────────────────────── */
function ToolCard({ tool, locale, accentColor }: { tool: ToolConfig; locale: string; accentColor: string }) {
  const content = tool.locales[locale] ?? tool.locales.en;
  return (
    <Link href={`/${locale}/tools/${tool.slug}`} style={{ display: 'block', height: '100%', textDecoration: 'none' }}>
      <motion.div
        whileHover={{ y: -4, borderColor: accentColor + '50' }}
        transition={{ duration: 0.18 }}
        style={{ position: 'relative', height: '100%', padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '16px' }}
      >
        <span style={{ fontSize: '28px', flexShrink: 0, width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', background: accentColor + '15', boxShadow: `0 8px 32px ${accentColor}10` }}>
          {tool.icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f3f4f6', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {content?.h1 ?? tool.slug}
          </h3>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {content?.metaDescription ?? ''}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

/* ── MAIN PAGE ─────────────────────────────────────────────────────────── */
export default function HubContent({ toolsByCluster, locale, heroSubtitle }: Props) {
  const fr = locale === 'fr';

  return (
    <div style={{ background: '#0a0a0a', width: '100%' }}>

      {/* ════════════════════ HERO ════════════════════ */}
      <section style={{ position: 'relative', width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/hero-bg.jpg" alt="" fill style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="100vw" quality={90} priority />
        </div>

        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.65) 55%, #0a0a0a 100%)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '900px', margin: '0 auto', padding: '120px 24px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        >
          {/* H1 */}
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}
            style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 700, color: '#ffffff', lineHeight: 1.08, letterSpacing: '-0.01em', marginBottom: '28px' }}>
            {fr ? <> Les Meilleurs Outils<br /><span style={{ color: '#c9a96e' }}>Gratuits du Web.</span></>
                : <> The Best Free Tools<br /><span style={{ color: '#c9a96e' }}>On The Internet.</span></>}
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
            style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '40px', fontWeight: 300 }}>
            {heroSubtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.7 }}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <a href="#tools"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#c9a96e', color: '#0a0a0a', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '16px 36px', textDecoration: 'none', boxShadow: '0 0 40px rgba(201,169,110,0.3)' }}>
              {fr ? 'Découvrir les Outils' : 'Explore All Tools'}
            </a>
            <a href="https://ethicalhackerprep.com" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(201,169,110,0.4)', color: '#d4b97a', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '16px 36px', textDecoration: 'none' }}>
              Ethical Hacker Prep →
            </a>
          </motion.div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1 }}
          style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>SCROLL</span>
          <motion.span animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            style={{ display: 'block', width: '1px', height: '32px', borderRadius: '100px', background: 'linear-gradient(to bottom, rgba(201,169,110,0.7), transparent)' }} />
        </motion.div>
      </section>

      {/* ════════════════════ EHP BANNER ════════════════════ */}
      <EHPCarousel />

      {/* ════════════════════ TOOLS GRID ════════════════════ */}
      <section id="tools" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '80px 32px 128px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
          {toolsByCluster.map(({ cluster, tools }, i) => (
            <motion.div key={cluster.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.03 }}
            >
              {/* Cluster heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                <div style={{ width: '4px', height: '40px', borderRadius: '100px', background: cluster.accentColor, flexShrink: 0 }} />
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.01em' }}>
                    {cluster.name[locale as 'en' | 'fr'] ?? cluster.name.en}
                  </h2>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                    {tools.length} {fr ? 'outils disponibles' : 'tools available'}
                  </p>
                </div>
                <div style={{ flex: 1, height: '1px', background: cluster.accentColor, opacity: 0.1 }} />
              </div>

              {/* Cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} locale={locale} accentColor={cluster.accentColor} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Developer credit */}
        <div style={{ marginTop: '100px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
            {fr ? 'Maintenu par ' : 'Maintained by '}
            <a href="https://ethicalhackerprep.com" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Ethical Hacker Prep</a>
            {' · '}{fr ? 'Développé par ' : 'Developed by '}
            <a href="https://gadjico.netlify.app" target="_blank" rel="noopener noreferrer" style={{ color: '#c9a96e', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Gadjico</a>
          </p>
        </div>
      </section>
    </div>
  );
}
