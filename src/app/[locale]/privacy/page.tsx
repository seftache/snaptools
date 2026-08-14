import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy',
    description:
      locale === 'fr'
        ? 'Politique de confidentialité de SnapTools — comment nous traitons vos données.'
        : 'SnapTools Privacy Policy — how we handle your data.',
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (locale === 'fr') {
    return <PrivacyFR />;
  }
  return <PrivacyEN />;
}

function PrivacyEN() {
  return (
    <main className="flex-1 px-4 py-20 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-invert prose-sm max-w-none text-[var(--text-secondary)] space-y-6">
        <p><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">1. Introduction</h2>
        <p>SnapTools (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates a network of free online tools. This Privacy Policy describes how we collect, use, and share information when you use our services.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">2. Information We Collect</h2>
        <p><strong>Usage Data:</strong> We use analytics (Google Analytics 4) to collect anonymous usage data including pages visited, tools used, browser type, device type, and approximate location (country-level). This data is used solely to improve our services.</p>
        <p><strong>Tool Input Data:</strong> Data you enter into our tools (text, files, etc.) is processed entirely in your browser whenever technically possible. We do not store, log, or transmit your tool input data to our servers unless the tool explicitly requires an API call (e.g., weather data, IP lookup). In those cases, the data is passed directly to the third-party API and is not stored by us.</p>
        <p><strong>Cookies:</strong> We use essential cookies for site functionality and analytics cookies (with your consent) for usage tracking.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">3. Third-Party Services</h2>
        <p>Some tools use third-party APIs to function (Open-Meteo for weather, ipapi.co for IP lookup, Nager.Date for holidays). Each of these services has its own privacy policy. We encourage you to review them.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">4. Data Retention</h2>
        <p>We do not maintain user accounts or store personal data. Analytics data is retained according to Google Analytics default retention policies.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">5. Your Rights (GDPR)</h2>
        <p>If you are in the European Union, you have the right to access, correct, or delete your personal data, and to object to its processing. Since we do not collect personally identifiable information, these rights are satisfied by design. You can opt out of analytics tracking by declining cookies.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">6. Children&apos;s Privacy</h2>
        <p>Our services are not directed to children under 13. We do not knowingly collect information from children.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">7. Contact</h2>
        <p>For privacy-related questions, contact us at: privacy@snaptools.store</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">8. Disclosure</h2>
        <p>SnapTools is part of the SnapTools network, built and maintained by the team behind <a href="https://ethicalhackerprep.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-devsec)] hover:underline">Ethical Hacker Prep</a>.</p>
      </div>
    </main>
  );
}

function PrivacyFR() {
  return (
    <main className="flex-1 px-4 py-20 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Politique de confidentialité</h1>
      <div className="prose prose-invert prose-sm max-w-none text-[var(--text-secondary)] space-y-6">
        <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">1. Introduction</h2>
        <p>SnapTools (« nous ») exploite un réseau d&apos;outils en ligne gratuits. Cette politique de confidentialité décrit comment nous collectons, utilisons et partageons les informations lorsque vous utilisez nos services.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">2. Données collectées</h2>
        <p><strong>Données d&apos;utilisation :</strong> Nous utilisons Google Analytics 4 pour collecter des données anonymes d&apos;utilisation : pages visitées, outils utilisés, type de navigateur, type d&apos;appareil et localisation approximative (au niveau du pays). Ces données servent uniquement à améliorer nos services.</p>
        <p><strong>Données des outils :</strong> Les données que vous saisissez dans nos outils (texte, fichiers, etc.) sont traitées entièrement dans votre navigateur lorsque c&apos;est techniquement possible. Nous ne stockons, n&apos;enregistrons ni ne transmettons vos données à nos serveurs, sauf lorsque l&apos;outil nécessite un appel API externe (météo, géolocalisation IP). Dans ces cas, les données sont transmises directement au service tiers et ne sont pas conservées par nous.</p>
        <p><strong>Cookies :</strong> Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies analytiques (avec votre consentement) pour le suivi d&apos;utilisation.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">3. Services tiers</h2>
        <p>Certains outils utilisent des API tierces (Open-Meteo pour la météo, ipapi.co pour la géolocalisation IP, Nager.Date pour les jours fériés). Chacun de ces services dispose de sa propre politique de confidentialité.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">4. Conservation des données</h2>
        <p>Nous ne maintenons pas de comptes utilisateurs et ne stockons pas de données personnelles. Les données analytiques sont conservées selon les politiques de rétention par défaut de Google Analytics.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">5. Vos droits (RGPD)</h2>
        <p>Si vous résidez dans l&apos;Union européenne, vous disposez du droit d&apos;accéder, de rectifier ou de supprimer vos données personnelles. Comme nous ne collectons pas d&apos;informations personnellement identifiables, ces droits sont satisfaits par conception. Vous pouvez refuser le suivi analytique en déclinant les cookies.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">6. Protection des mineurs</h2>
        <p>Nos services ne s&apos;adressent pas aux enfants de moins de 13 ans. Nous ne collectons pas sciemment d&apos;informations les concernant.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">7. Contact</h2>
        <p>Pour toute question relative à la confidentialité : privacy@snaptools.store</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">8. Mention légale</h2>
        <p>SnapTools fait partie du réseau SnapTools, conçu et maintenu par l&apos;équipe d&apos;<a href="https://ethicalhackerprep.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-devsec)] hover:underline">Ethical Hacker Prep</a>.</p>
      </div>
    </main>
  );
}
