import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  let finalUrl = targetUrl;
  if (!/^https?:\/\//i.test(finalUrl)) {
    finalUrl = 'https://' + finalUrl;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(finalUrl, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return NextResponse.json({ headers, status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch headers' }, { status: 500 });
  }
}
