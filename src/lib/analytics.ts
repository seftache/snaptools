/**
 * GA4 Analytics helper
 * Tracks tool usage events and CTA clicks across the SnapTools network.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  eventName: string,
  params: Record<string, string | number | boolean>
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/**
 * Track when a user successfully uses a tool
 */
export function trackToolUsed(toolSlug: string, action: string): void {
  trackEvent('tool_used', {
    tool_slug: toolSlug,
    tool_action: action,
  });
}

/**
 * Track when a user clicks a CTA leading to EHP
 */
export function trackCTAClick(toolSlug: string, ctaTier: number): void {
  trackEvent('cta_clicked', {
    tool_slug: toolSlug,
    cta_tier: ctaTier,
    destination: 'ehp',
  });
}

/**
 * Returns the GA4 script tags as raw HTML string for dangerouslySetInnerHTML.
 * Use in layout.tsx head section.
 */
export function getGAScriptContent(): string | null {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}', {
      page_path: window.location.pathname,
    });
  `;
}

export function getGAScriptSrc(): string | null {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;
  return `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
}
