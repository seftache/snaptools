'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CTABannerProps {
  tier: 1 | 2 | 3;
  toolSlug: string;
  accentColor: string;
  locale: string;
}

const ctaContent: Record<string, Record<1 | 2 | 3, { title?: string; description: string; button?: string }>> = {
  en: {
    1: {
      title: 'Level up your cybersecurity skills',
      description: 'You just used a tool built by security professionals. Want to understand how attackers think? Ethical Hacker Prep teaches offensive security so you can defend better.',
      button: 'Start Free →',
    },
    2: {
      description: 'Built and maintained by the team behind Ethical Hacker Prep — the cybersecurity certification prep platform.',
      button: 'Learn more',
    },
    3: {
      description: 'A SnapTools project, by Ethical Hacker Prep.',
    },
  },
  fr: {
    1: {
      title: 'Montez en compétences en cybersécurité',
      description: 'Vous venez d\'utiliser un outil conçu par des professionnels de la sécurité. Envie de comprendre comment pensent les attaquants ? Ethical Hacker Prep vous enseigne la sécurité offensive pour mieux vous défendre.',
      button: 'Commencer gratuitement →',
    },
    2: {
      description: 'Conçu et maintenu par l\'équipe d\'Ethical Hacker Prep — la plateforme de préparation aux certifications en cybersécurité.',
      button: 'En savoir plus',
    },
    3: {
      description: 'Un projet SnapTools, par Ethical Hacker Prep.',
    },
  },
};

// Contextual CTA overrides for specific tools
const toolSpecificCTA: Record<string, Record<string, { title?: string; description: string }>> = {
  password: {
    en: {
      title: 'How do attackers crack passwords?',
      description: 'You just generated a strong password. Do you know the techniques attackers use to crack them? Ethical Hacker Prep teaches you to think offensively so you can defend better.',
    },
    fr: {
      title: 'Comment les attaquants craquent-ils les mots de passe ?',
      description: 'Vous venez de générer un mot de passe solide. Connaissez-vous les techniques utilisées par les attaquants pour les craquer ? Ethical Hacker Prep vous apprend à penser comme un hacker pour mieux vous défendre.',
    },
  },
  ip: {
    en: {
      title: 'What does your IP reveal about you?',
      description: 'Your IP address is more than just numbers — it reveals your location, ISP, and can be used in reconnaissance attacks. Learn how attackers exploit this information with Ethical Hacker Prep.',
    },
    fr: {
      title: 'Que révèle votre adresse IP sur vous ?',
      description: 'Votre adresse IP ne se résume pas à des chiffres — elle révèle votre localisation, votre FAI, et peut être exploitée lors d\'attaques de reconnaissance. Apprenez comment avec Ethical Hacker Prep.',
    },
  },
  encode: {
    en: {
      title: 'Encoding is not encryption',
      description: 'Base64 encoding is often confused with encryption — but it provides zero security. Learn the difference and understand real-world attack vectors with Ethical Hacker Prep.',
    },
    fr: {
      title: 'L\'encodage n\'est pas du chiffrement',
      description: 'L\'encodage Base64 est souvent confondu avec le chiffrement — mais il n\'offre aucune sécurité. Apprenez la différence et comprenez les vrais vecteurs d\'attaque avec Ethical Hacker Prep.',
    },
  },
};

export default function CTABanner({ tier, toolSlug, accentColor, locale }: CTABannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const localeContent = ctaContent[locale] || ctaContent.en;
  const baseCta = localeContent[tier];

  // Apply tool-specific overrides for tier 1
  const toolOverride = tier === 1 ? toolSpecificCTA[toolSlug]?.[locale] : undefined;
  const cta = toolOverride ? { ...baseCta, ...toolOverride } : baseCta;

  const utmParams = new URLSearchParams({
    utm_source: toolSlug,
    utm_medium: 'tool_cta',
    utm_campaign: 'network_launch',
  });

  const ehpUrl = `https://ethicalhackerprep.com?${utmParams.toString()}`;

  if (dismissed) return null;

  // Tier 3: minimal footer mention
  if (tier === 3) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-4"
      >
        <p className="text-sm text-[var(--text-muted)]">
          {cta.description}{' '}
          <a
            href={ehpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[var(--text-secondary)] transition-colors"
          >
            ethicalhackerprep.com
          </a>
        </p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative rounded-2xl border overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}15)`,
          borderColor: `${accentColor}25`,
        }}
      >
        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5 transition-all z-10"
          aria-label={locale === 'fr' ? 'Fermer' : 'Dismiss'}
        >
          ×
        </button>

        <div className="p-6 sm:p-8 backdrop-blur-sm">
          {tier === 1 && 'title' in cta && cta.title && (
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: accentColor }}
            >
              {cta.title}
            </h3>
          )}

          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-2xl">
            {cta.description}
          </p>

          {cta.button && (
            <a
              href={ehpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110"
              style={{ backgroundColor: accentColor }}
            >
              {cta.button}
            </a>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
