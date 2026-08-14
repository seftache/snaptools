import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Conditions d\'utilisation' : 'Terms of Service',
    description:
      locale === 'fr'
        ? 'Conditions d\'utilisation de SnapTools.'
        : 'SnapTools Terms of Service.',
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (locale === 'fr') {
    return <TermsFR />;
  }
  return <TermsEN />;
}

function TermsEN() {
  return (
    <main className="flex-1 px-4 py-20 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-invert prose-sm max-w-none text-[var(--text-secondary)] space-y-6">
        <p><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">1. Acceptance of Terms</h2>
        <p>By accessing and using SnapTools, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">2. Description of Service</h2>
        <p>SnapTools provides a collection of free online utility tools including calculators, converters, generators, and developer utilities. All tools are provided as-is for personal and professional use.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">3. No Warranty</h2>
        <p>All tools and services are provided &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; without warranty of any kind, express or implied. We do not guarantee that our tools will be uninterrupted, error-free, or that the results will be accurate. You use our tools at your own risk.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use our services for any illegal purpose</li>
          <li>Attempt to overload, disrupt, or attack our infrastructure</li>
          <li>Use automated scripts to access our tools at excessive rates</li>
          <li>Reverse-engineer, decompile, or extract our source code</li>
          <li>Use our tools to process data you are not authorized to process</li>
        </ul>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">5. Intellectual Property</h2>
        <p>The SnapTools name, logo, design, and codebase are owned by the SnapTools team. The output of our tools belongs to you.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">6. Copyright / DMCA</h2>
        <p>If you believe that content accessible through SnapTools infringes your copyright, please contact us at: dmca@snaptools.store. We will promptly investigate and take appropriate action in accordance with the Digital Millennium Copyright Act (DMCA).</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">7. Limitation of Liability</h2>
        <p>In no event shall SnapTools, its team, or affiliates be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of our services.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">8. Third-Party Services</h2>
        <p>Some tools rely on third-party APIs and services. We are not responsible for the availability, accuracy, or policies of these external services.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">9. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">10. Disclosure</h2>
        <p>SnapTools is part of the SnapTools network, built and maintained by the team behind <a href="https://ethicalhackerprep.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-devsec)] hover:underline">Ethical Hacker Prep</a>.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">11. Contact</h2>
        <p>For questions about these terms: legal@snaptools.store</p>
      </div>
    </main>
  );
}

function TermsFR() {
  return (
    <main className="flex-1 px-4 py-20 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Conditions d&apos;utilisation</h1>
      <div className="prose prose-invert prose-sm max-w-none text-[var(--text-secondary)] space-y-6">
        <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">1. Acceptation des conditions</h2>
        <p>En accédant et en utilisant SnapTools, vous acceptez d&apos;être lié par ces conditions d&apos;utilisation. Si vous n&apos;acceptez pas, veuillez ne pas utiliser nos services.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">2. Description du service</h2>
        <p>SnapTools propose une collection d&apos;outils utilitaires en ligne gratuits : calculatrices, convertisseurs, générateurs et utilitaires pour développeurs. Tous les outils sont fournis tels quels pour un usage personnel et professionnel.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">3. Absence de garantie</h2>
        <p>Tous les outils et services sont fournis « EN L&apos;ÉTAT » et « SELON DISPONIBILITÉ » sans aucune garantie, expresse ou implicite. Nous ne garantissons pas que nos outils seront ininterrompus, sans erreur, ou que les résultats seront précis. Vous les utilisez à vos propres risques.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">4. Utilisation acceptable</h2>
        <p>Vous vous engagez à ne pas :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Utiliser nos services à des fins illégales</li>
          <li>Tenter de surcharger, perturber ou attaquer notre infrastructure</li>
          <li>Utiliser des scripts automatisés pour accéder à nos outils de manière excessive</li>
          <li>Rétro-ingéniérer, décompiler ou extraire notre code source</li>
          <li>Utiliser nos outils pour traiter des données que vous n&apos;êtes pas autorisé à traiter</li>
        </ul>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">5. Propriété intellectuelle</h2>
        <p>Le nom SnapTools, le logo, le design et le code source sont la propriété de l&apos;équipe SnapTools. Les résultats générés par nos outils vous appartiennent.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">6. Droit d&apos;auteur / DMCA</h2>
        <p>Si vous estimez qu&apos;un contenu accessible via SnapTools porte atteinte à vos droits d&apos;auteur, contactez-nous à : dmca@snaptools.store. Nous procéderons rapidement à une enquête et prendrons les mesures appropriées.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">7. Limitation de responsabilité</h2>
        <p>En aucun cas SnapTools, son équipe ou ses affiliés ne pourront être tenus responsables de tout dommage direct, indirect, accessoire, spécial ou consécutif découlant de votre utilisation de nos services.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">8. Services tiers</h2>
        <p>Certains outils reposent sur des API et services tiers. Nous ne sommes pas responsables de la disponibilité, de la précision ou des politiques de ces services externes.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">9. Modification des conditions</h2>
        <p>Nous nous réservons le droit de modifier ces conditions à tout moment. L&apos;utilisation continue de nos services après des modifications constitue une acceptation des nouvelles conditions.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">10. Mention légale</h2>
        <p>SnapTools fait partie du réseau SnapTools, conçu et maintenu par l&apos;équipe d&apos;<a href="https://ethicalhackerprep.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-devsec)] hover:underline">Ethical Hacker Prep</a>.</p>

        <h2 className="text-[var(--text-primary)] text-xl font-semibold mt-8">11. Contact</h2>
        <p>Pour toute question : legal@snaptools.store</p>
      </div>
    </main>
  );
}
