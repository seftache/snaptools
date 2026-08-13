/**
 * UTM parameter builder for EHP (Ethical Hacker Prep) links
 */

interface UTMParams {
  source: string;
  medium?: string;
  campaign?: string;
  content?: string;
}

export function buildEHPUrl(params: UTMParams): string {
  const base = 'https://ethicalhackerprep.com';
  const searchParams = new URLSearchParams({
    utm_source: params.source,
    utm_medium: params.medium || 'tool_cta',
    utm_campaign: params.campaign || 'network_launch',
    ...(params.content ? { utm_content: params.content } : {}),
  });

  return `${base}?${searchParams.toString()}`;
}
