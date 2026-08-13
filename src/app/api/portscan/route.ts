import { NextRequest, NextResponse } from 'next/server';
import net from 'net';

const COMMON_PORTS = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 8080];

function checkPort(host: string, port: number): Promise<{ port: number; status: 'open' | 'closed' }> {
  return new Promise((resolve) => {
    let isResolved = false;
    const socket = new net.Socket();
    
    socket.setTimeout(1500);

    socket.on('connect', () => {
      if (isResolved) return;
      isResolved = true;
      socket.destroy();
      resolve({ port, status: 'open' });
    });

    socket.on('timeout', () => {
      if (isResolved) return;
      isResolved = true;
      socket.destroy();
      resolve({ port, status: 'closed' });
    });

    socket.on('error', () => {
      if (isResolved) return;
      isResolved = true;
      socket.destroy();
      resolve({ port, status: 'closed' });
    });

    socket.connect(port, host);
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const host = searchParams.get('host');

  if (!host) {
    return NextResponse.json({ error: 'Host is required' }, { status: 400 });
  }

  try {
    const results = await Promise.all(
      COMMON_PORTS.map(port => checkPort(host, port))
    );
    
    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Scan failed' }, { status: 500 });
  }
}
