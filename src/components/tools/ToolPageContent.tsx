'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { ToolConfig, ToolLocaleContent } from '@/config/tools';
import type { ClusterConfig } from '@/config/clusters';
import { EHPCarousel } from '@/components/cta/EHPCarousel';
import FAQSection from '@/components/tools/FAQSection';
import RelatedTools from '@/components/tools/RelatedTools';
import SEOBody from '@/components/tools/SEOBody';

const toolWidgets: Record<string, React.ComponentType<{ locale: string }>> = {
  // Phase 1
  weather: dynamic(() => import('@/tools/weather/WeatherWidget')),
  time: dynamic(() => import('@/tools/time/WorldClockWidget')),
  calc: dynamic(() => import('@/tools/calc/CalculatorWidget')),
  holidays: dynamic(() => import('@/tools/holidays/HolidaysWidget')),
  json: dynamic(() => import('@/tools/json/JSONFormatterWidget')),
  password: dynamic(() => import('@/tools/password/PasswordGenWidget')),
  encode: dynamic(() => import('@/tools/encode/EncoderWidget')),
  ip: dynamic(() => import('@/tools/ip/IPInfoWidget')),
  qr: dynamic(() => import('@/tools/qr/QRGeneratorWidget')),
  regex: dynamic(() => import('@/tools/regex/RegexTesterWidget')),
  // Phase 2
  color: dynamic(() => import('@/tools/color/ColorWidget')),
  uuid: dynamic(() => import('@/tools/uuid/UuidWidget')),
  placeholder: dynamic(() => import('@/tools/placeholder/PlaceholderWidget')),
  words: dynamic(() => import('@/tools/words/WordsWidget')),
  lorem: dynamic(() => import('@/tools/lorem/LoremWidget')),
  utm: dynamic(() => import('@/tools/utm/UtmBuilderWidget')),
  stopwatch: dynamic(() => import('@/tools/stopwatch/StopwatchWidget')),
  avatar: dynamic(() => import('@/tools/avatar/AvatarWidget')),
  compress: dynamic(() => import('@/tools/compress/CompressWidget')),
  health: dynamic(() => import('@/tools/health/HealthWidget')),
  // Phase 3
  hash: dynamic(() => import('@/tools/hash/HashWidget')),
  diff: dynamic(() => import('@/tools/diff/DiffWidget')),
  csv2json: dynamic(() => import('@/tools/csv2json/CsvJsonWidget')),
  dns: dynamic(() => import('@/tools/dns/DnsWidget')),
  thumbnail: dynamic(() => import('@/tools/thumbnail/ThumbnailWidget')),
  markdown: dynamic(() => import('@/tools/markdown/MarkdownWidget')),
  margin: dynamic(() => import('@/tools/margin/MarginWidget')),
  pomodoro: dynamic(() => import('@/tools/pomodoro/PomodoroWidget')),
  username: dynamic(() => import('@/tools/username/UsernameWidget')),
  anagram: dynamic(() => import('@/tools/anagram/AnagramWidget')),
  // Phase 4
  jwt: dynamic(() => import('@/tools/jwt/JwtDecoderWidget')),
  url: dynamic(() => import('@/tools/url/UrlParserWidget')),
  chmod: dynamic(() => import('@/tools/chmod/ChmodCalculatorWidget')),
  meta: dynamic(() => import('@/tools/meta/MetaTagsGeneratorWidget')),
  loan: dynamic(() => import('@/tools/loan/LoanCalculatorWidget')),
  discount: dynamic(() => import('@/tools/discount/DiscountCalculatorWidget')),
  age: dynamic(() => import('@/tools/age/AgeCalculatorWidget')),
  case: dynamic(() => import('@/tools/case/CaseConverterWidget')),
  ratio: dynamic(() => import('@/tools/ratio/AspectRatioWidget')),
  bpm: dynamic(() => import('@/tools/bpm/BpmTapperWidget')),
  // Phase 5
  xml: dynamic(() => import('@/tools/xml/XmlFormatterWidget')),
  css: dynamic(() => import('@/tools/css/CssMinifierWidget')),
  base: dynamic(() => import('@/tools/base/BaseConverterWidget')),
  'html-entities': dynamic(() => import('@/tools/html-entities/HtmlEntitiesWidget')),
  percentage: dynamic(() => import('@/tools/percentage/PercentageCalculatorWidget')),
  salary: dynamic(() => import('@/tools/salary/SalaryCalculatorWidget')),
  tip: dynamic(() => import('@/tools/tip/TipCalculatorWidget')),
  timezone: dynamic(() => import('@/tools/timezone/TimezoneConverterWidget')),
  shuffle: dynamic(() => import('@/tools/shuffle/ListShufflerWidget')),
  'remove-lines': dynamic(() => import('@/tools/remove-lines/RemoveLinesWidget')),
  // Phase 6 tools (Cleaned up duplicates)
  'img-converter': dynamic(() => import('@/tools/img-converter/ImgConverterWidget')),
  'youtube-thumbnail': dynamic(() => import('@/tools/youtube-thumbnail/YoutubeThumbnailWidget')),
  // Phase 7 (Cybersecurity & IT Pro)
  'dns-lookup': dynamic(() => import('@/tools/dns-lookup/DnsLookupWidget')),
  'whois': dynamic(() => import('@/tools/whois/WhoisWidget')),
  'ssl-checker': dynamic(() => import('@/tools/ssl-checker/SslCheckerWidget')),
  'headers-checker': dynamic(() => import('@/tools/headers-checker/HeadersCheckerWidget')),
  'hash-generator': dynamic(() => import('@/tools/hash-generator/HashGeneratorWidget')),
  'hash-identifier': dynamic(() => import('@/tools/hash-identifier/HashIdentifierWidget')),
  'mac-lookup': dynamic(() => import('@/tools/mac-lookup/MacLookupWidget')),
  'port-scanner': dynamic(() => import('@/tools/port-scanner/PortScannerWidget')),
  'jwt-decoder': dynamic(() => import('@/tools/jwt-decoder/JwtDecoderWidget')),
  'subnet-calc': dynamic(() => import('@/tools/subnet-calc/SubnetCalcWidget')),
  'chmod-calc': dynamic(() => import('@/tools/chmod-calc/ChmodCalcWidget')),
  'cron-parser': dynamic(() => import('@/tools/cron-parser/CronParserWidget')),
  'useragent-parser': dynamic(() => import('@/tools/useragent-parser/UseragentParserWidget')),
  'sql-formatter': dynamic(() => import('@/tools/sql-formatter/SqlFormatterWidget')),
  'diff-checker': dynamic(() => import('@/tools/diff-checker/DiffCheckerWidget')),
  // Phase 8 tools (Traffic Magnets - 25 Tools)
  // PDF
  'merge-pdf': dynamic(() => import('@/tools/merge-pdf/MergePdfWidget')),
  'split-pdf': dynamic(() => import('@/tools/split-pdf/SplitPdfWidget')),
  'compress-pdf': dynamic(() => import('@/tools/compress-pdf/CompressPdfWidget')),
  'pdf-to-jpg': dynamic(() => import('@/tools/pdf-to-jpg/PdfToJpgWidget')),
  'jpg-to-pdf': dynamic(() => import('@/tools/jpg-to-pdf/JpgToPdfWidget')),
  'protect-pdf': dynamic(() => import('@/tools/protect-pdf/ProtectPdfWidget')),
  'unlock-pdf': dynamic(() => import('@/tools/unlock-pdf/UnlockPdfWidget')),
  // Media
  'youtube-downloader': dynamic(() => import('@/tools/youtube-downloader/YoutubeDownloaderWidget')),
  'tiktok-downloader': dynamic(() => import('@/tools/tiktok-downloader/TiktokDownloaderWidget')),
  'instagram-downloader': dynamic(() => import('@/tools/instagram-downloader/InstagramDownloaderWidget')),
  'twitter-downloader': dynamic(() => import('@/tools/twitter-downloader/TwitterDownloaderWidget')),
  'video-to-mp3': dynamic(() => import('@/tools/video-to-mp3/VideoToMp3Widget')),
  // Image
  'remove-background': dynamic(() => import('@/tools/remove-background/RemoveBackgroundWidget')),
  'image-compressor': dynamic(() => import('@/tools/image-compressor/ImageCompressorWidget')),
  'heic-to-jpg': dynamic(() => import('@/tools/heic-to-jpg/HeicToJpgWidget')),
  'resize-image': dynamic(() => import('@/tools/resize-image/ResizeImageWidget')),
  'crop-image': dynamic(() => import('@/tools/crop-image/CropImageWidget')),
  'ico-converter': dynamic(() => import('@/tools/ico-converter/IcoConverterWidget')),
  // Text & SEO
  'grammar-checker': dynamic(() => import('@/tools/grammar-checker/GrammarCheckerWidget')),
  'article-spinner': dynamic(() => import('@/tools/article-spinner/ArticleSpinnerWidget')),
  'text-to-speech': dynamic(() => import('@/tools/text-to-speech/TextToSpeechWidget')),
  'speech-to-text': dynamic(() => import('@/tools/speech-to-text/SpeechToTextWidget')),
  'plagiarism-checker': dynamic(() => import('@/tools/plagiarism-checker/PlagiarismCheckerWidget')),
  'qr-scanner': dynamic(() => import('@/tools/qr-scanner/QrScannerWidget')),
  'word-to-pdf': dynamic(() => import('@/tools/word-to-pdf/WordToPdfWidget')),
  // Phase 8 fixes
  'pdf-merge': dynamic(() => import('@/tools/merge-pdf/MergePdfWidget')),
  'pdf-split': dynamic(() => import('@/tools/split-pdf/SplitPdfWidget')),
  'pdf-protect': dynamic(() => import('@/tools/protect-pdf/ProtectPdfWidget')),
  'yt-downloader': dynamic(() => import('@/tools/youtube-downloader/YoutubeDownloaderWidget')),
  'insta-downloader': dynamic(() => import('@/tools/instagram-downloader/InstagramDownloaderWidget')),
  'img-compressor': dynamic(() => import('@/tools/image-compressor/ImageCompressorWidget')),
  // Phase 9 tools
  'blur-face': dynamic(() => import('@/tools/blur-face/BlurFaceWidget')),
  'meme-generator': dynamic(() => import('@/tools/meme-generator/MemeGeneratorWidget')),
  'favicon-generator': dynamic(() => import('@/tools/favicon-generator/FaviconGeneratorWidget')),
  'image-resizer': dynamic(() => import('@/tools/image-resizer/ImageResizerWidget')),
  'image-cropper': dynamic(() => import('@/tools/image-cropper/ImageCropperWidget')),
  'watermark-pdf': dynamic(() => import('@/tools/watermark-pdf/WatermarkPdfWidget')),
  'page-numbers-pdf': dynamic(() => import('@/tools/page-numbers-pdf/PageNumbersPdfWidget')),
  'rotate-pdf': dynamic(() => import('@/tools/rotate-pdf/RotatePdfWidget')),
  'organize-pdf': dynamic(() => import('@/tools/organize-pdf/OrganizePdfWidget')),
  'html-to-pdf': dynamic(() => import('@/tools/html-to-pdf/HtmlToPdfWidget')),
  'schema-generator': dynamic(() => import('@/tools/schema-generator/SchemaGeneratorWidget')),
  'keyword-density': dynamic(() => import('@/tools/keyword-density/KeywordDensityWidget')),
  'robots-txt-generator': dynamic(() => import('@/tools/robots-txt-generator/RobotsTxtWidget')),
  'code-beautifier': dynamic(() => import('@/tools/code-beautifier/CodeBeautifierWidget')),
  'paraphrase-tool': dynamic(() => import('@/tools/paraphrase-tool/ParaphraseWidget')),
  'email-signature': dynamic(() => import('@/tools/email-signature/EmailSignatureWidget')),
  'remove-bg': dynamic(() => import('@/tools/remove-bg/RemoveBgWidget')),
  'passport-photo': dynamic(() => import('@/tools/passport-photo/PassportPhotoWidget')),
};

interface ToolPageContentProps {
  tool: ToolConfig;
  content: ToolLocaleContent;
  cluster: ClusterConfig | undefined;
  relatedTools: ToolConfig[];
  locale: string;
}

export default function ToolPageContent({
  tool,
  content,
  cluster,
  relatedTools,
  locale,
}: ToolPageContentProps) {
  const ToolWidget = toolWidgets[tool.slug];
  // Default to gold if no cluster color
  const accentColor = cluster?.accentColor || '#c9a96e'; 
  const ctaTier = cluster?.ctaTier || 3;

  return (
    <main style={{ flex: 1, width: '100%', background: '#0a0a0a', color: '#ffffff' }}>
      {/* ════════════════════ TOOL HEADER ════════════════════ */}
      <section style={{ position: 'relative', width: '100%', padding: '120px 24px 40px', overflow: 'hidden' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', borderRadius: '50%', background: accentColor, opacity: 0.04, filter: 'blur(100px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
            <Link href={`/${locale}`} style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a96e')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
              SnapTools
            </Link>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{content.h1}</span>
          </nav>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 700, color: '#ffffff', lineHeight: 1.1, marginBottom: '8px' }}
          >
            {content.h1}
          </motion.h1>
          <motion.p
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
             style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: '600px' }}>
            {content.metaDescription}
          </motion.p>
        </div>
      </section>

      {/* ════════════════════ TOOL WIDGET ════════════════════ */}
      <section style={{ width: '100%', padding: '0 24px 60px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ maxWidth: '800px', margin: '0 auto' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            {ToolWidget ? (
              <ToolWidget locale={locale} />
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '16px' }}>🛠️</span>
                Widget configuration error for: {tool.slug}
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* ════════════════════ CONTENT SECTIONS ════════════════════ */}
      <EHPCarousel />

      <section style={{ width: '100%', padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '60px' }}>
          
          <div style={{ fontSize: '15px', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)' }}>
            <SEOBody content={content.seoBody} />
          </div>

          {content.faq.length > 0 && (
            <FAQSection faq={content.faq} locale={locale} />
          )}

          {relatedTools.length > 0 && (
            <div style={{ paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '24px', fontWeight: 600, color: '#ffffff', marginBottom: '24px' }}>
                {locale === 'fr' ? 'Outils Similaires' : 'Related Tools'}
              </h3>
              <RelatedTools tools={relatedTools} locale={locale} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
