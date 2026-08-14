import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'snaptools.store';
const ROUTING_MODE = (process.env.ROUTING_MODE || 'subfolder') as 'subdomain' | 'subfolder';

/**
 * Known tool subdomains — used to identify tool requests vs. main site.
 * This set is auto-derived from the tool registry at build time in production.
 * For middleware (edge runtime), we maintain a static list.
 */
const TOOL_SUBDOMAINS = new Set([
  // Phase 1 tools
  'weather', 'time', 'calc', 'holidays',
  'json', 'password', 'encode', 'ip', 'qr', 'regex',
  // Phase 2 tools
  'color', 'uuid', 'placeholder', 'words', 'lorem',
  'utm', 'stopwatch', 'avatar', 'compress', 'health',
  // Phase 3 tools
  'hash', 'diff', 'csv2json', 'dns', 'markdown',
  'margin', 'pomodoro', 'username', 'anagram', 'thumbnail',
  // Phase 4 tools
  'jwt', 'url', 'chmod', 'meta', 'loan',
  'discount', 'age', 'case', 'ratio', 'bpm',
  // Phase 5 tools
  'xml', 'css', 'base', 'html-entities', 'percentage',
  'salary', 'tip', 'timezone', 'shuffle', 'remove-lines',
  // Phase 6 tools (Cleaned up duplicates, kept unique ones)
  'img-converter', 'youtube-thumbnail',
  // Phase 7 tools (Cybersecurity & IT Pro)
  'dns-lookup', 'whois', 'ssl-checker', 'headers-checker', 'hash-generator',
  'hash-identifier', 'mac-lookup', 'port-scanner', 'jwt-decoder', 'subnet-calc',
  'chmod-calc', 'cron-parser', 'useragent-parser', 'sql-formatter', 'diff-checker',
  // Phase 8 tools (Traffic Magnets - 25 Tools)
  'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf', 'protect-pdf', 'unlock-pdf',
  'youtube-downloader', 'tiktok-downloader', 'instagram-downloader', 'twitter-downloader', 'video-to-mp3',
  'remove-background', 'image-compressor', 'heic-to-jpg', 'resize-image', 'crop-image', 'ico-converter',
  'grammar-checker', 'article-spinner', 'text-to-speech', 'speech-to-text', 'plagiarism-checker', 'qr-scanner', 'word-to-pdf',
  // Phase 9 tools
  'remove-bg', 'passport-photo', 'blur-face', 'meme-generator', 'favicon-generator', 'image-resizer', 'image-cropper',
  'watermark-pdf', 'page-numbers-pdf', 'rotate-pdf', 'organize-pdf', 'html-to-pdf', 'schema-generator', 'keyword-density',
  'robots-txt-generator', 'code-beautifier', 'paraphrase-tool', 'email-signature'
]);

function extractSubdomain(hostname: string): string | null {
  // Remove port for local development
  const host = hostname.replace(/:\d+$/, '');

  // Handle localhost development: tool.localhost -> tool
  if (host.endsWith('.localhost') || host.endsWith('.local')) {
    const parts = host.split('.');
    if (parts.length >= 2) {
      const sub = parts[0];
      if (sub && sub !== 'www' && TOOL_SUBDOMAINS.has(sub)) {
        return sub;
      }
    }
    return null;
  }

  // Handle production: tool.snaptools.co -> tool
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = host.replace(`.${ROOT_DOMAIN}`, '');
    if (sub && sub !== 'www' && TOOL_SUBDOMAINS.has(sub)) {
      return sub;
    }
  }

  return null;
}

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  if (ROUTING_MODE === 'subdomain') {
    const subdomain = extractSubdomain(hostname);

    if (subdomain) {
      // Rewrite: weather.snaptools.co/fr -> /tools/weather (locale handled by next-intl)
      // Check if the path already starts with /tools/
      if (!url.pathname.startsWith('/tools/')) {
        url.pathname = `/tools/${subdomain}${url.pathname}`;
        const response = intlMiddleware(request);

        // If intlMiddleware returns a redirect/rewrite, we need to adjust
        if (response.headers.get('x-middleware-rewrite')) {
          return response;
        }

        return NextResponse.rewrite(url, {
          headers: response.headers,
        });
      }
    }
  }

  // For subfolder mode or main domain, just use next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(en|fr)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|og|icons|.*\\.[a-z]{2,4}$).*)',
  ],
};
