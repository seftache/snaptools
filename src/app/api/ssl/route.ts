import { NextRequest, NextResponse } from 'next/server';
import tls from 'tls';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  domain = domain.replace(/^https?:\/\//, '').split('/')[0];

  try {
    const certInfo = await new Promise((resolve, reject) => {
      let isResolved = false;
      const socket = tls.connect(443, domain as string, { servername: domain as string }, () => {
        if (isResolved) return;
        const cert = socket.getPeerCertificate();
        if (!cert || !Object.keys(cert).length) {
          isResolved = true;
          reject(new Error('No certificate found'));
          return;
        }
        
        isResolved = true;
        resolve({
          subject: cert.subject?.CN || domain,
          issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          protocol: socket.getProtocol(),
          cipher: socket.getCipher().name
        });
        socket.destroy();
      });

      socket.on('error', (err) => {
        if (isResolved) return;
        isResolved = true;
        reject(err);
      });

      setTimeout(() => {
        if (isResolved) return;
        isResolved = true;
        socket.destroy();
        reject(new Error('Connection timed out'));
      }, 5000);
    });

    return NextResponse.json(certInfo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to check SSL' }, { status: 500 });
  }
}
