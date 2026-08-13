"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Network } from 'lucide-react';

function ipToInt(ip: string) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function intToIp(int: number) {
  return [ (int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255 ].join('.');
}

export default function SubnetCalcWidget({ locale }: { locale: string }) {
  const [ipStr, setIpStr] = useState('192.168.1.0');
  const [cidr, setCidr] = useState(24);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    try {
      if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ipStr)) return;
      const ip = ipToInt(ipStr);
      const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
      const network = (ip & mask) >>> 0;
      const wildcard = (~mask) >>> 0;
      const broadcast = (network | wildcard) >>> 0;
      
      const firstUsable = cidr < 31 ? network + 1 : network;
      const lastUsable = cidr < 31 ? broadcast - 1 : broadcast;
      const totalHosts = Math.pow(2, 32 - cidr);
      const usableHosts = cidr < 31 ? totalHosts - 2 : totalHosts;
      
      const firstOctet = parseInt(ipStr.split('.')[0], 10);
      let ipClass = 'Unknown';
      if (firstOctet >= 1 && firstOctet <= 126) ipClass = 'A';
      else if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'B';
      else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'C';
      else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'D (Multicast)';
      else if (firstOctet >= 240 && firstOctet <= 255) ipClass = 'E (Experimental)';

      const binaryMask = intToIp(mask).split('.').map(n => parseInt(n, 10).toString(2).padStart(8, '0')).join('.');

      setResults({
        network: intToIp(network),
        broadcast: intToIp(broadcast),
        mask: intToIp(mask),
        wildcard: intToIp(wildcard),
        totalHosts,
        usableHosts,
        firstUsable: intToIp(firstUsable),
        lastUsable: intToIp(lastUsable),
        ipClass,
        binaryMask
      });
    } catch(e) {
      setResults(null);
    }
  }, [ipStr, cidr]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--glass-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px', color: 'white' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Network className="w-6 h-6 text-indigo-400" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Subnet Calculator</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#9ca3af' }}>IP Address</label>
          <input 
            type="text" 
            value={ipStr} 
            onChange={e => setIpStr(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', color: 'white' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#9ca3af' }}>CIDR Prefix: /{cidr}</label>
          <input 
            type="range" 
            min="0" max="32" 
            value={cidr} 
            onChange={e => setCidr(parseInt(e.target.value, 10))}
            style={{ width: '100%', height: '44px' }}
          />
        </div>
      </div>

      {results && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Network Address', value: results.network },
            { label: 'Broadcast Address', value: results.broadcast },
            { label: 'Subnet Mask', value: results.mask },
            { label: 'Wildcard Mask', value: results.wildcard },
            { label: 'First Usable IP', value: results.firstUsable },
            { label: 'Last Usable IP', value: results.lastUsable },
            { label: 'Total Hosts', value: results.totalHosts.toLocaleString() },
            { label: 'Usable Hosts', value: results.usableHosts.toLocaleString() },
            { label: 'IP Class', value: results.ipClass },
            { label: 'Binary Mask', value: results.binaryMask },
          ].map((item, idx) => (
            <div key={idx} style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '1.1rem', fontFamily: item.label === 'Binary Mask' ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
