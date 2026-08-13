'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Terminal, Shield, Users, Globe, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ChmodCalculatorWidget({ locale }: { locale: string }) {
  const t = useTranslations('tools.chmod');
  const [perms, setPerms] = useState({
    owner: { read: true, write: true, execute: false },
    group: { read: true, write: false, execute: false },
    public: { read: true, write: false, execute: false }
  });
  const [copied, setCopied] = useState(false);

  const getOctalForTarget = (target: keyof typeof perms) => {
    let val = 0;
    if (perms[target].read) val += 4;
    if (perms[target].write) val += 2;
    if (perms[target].execute) val += 1;
    return val;
  };

  const octalStr = `${getOctalForTarget('owner')}${getOctalForTarget('group')}${getOctalForTarget('public')}`;
  
  const getSymbolicForTarget = (target: keyof typeof perms) => {
    let str = '';
    str += perms[target].read ? 'r' : '-';
    str += perms[target].write ? 'w' : '-';
    str += perms[target].execute ? 'x' : '-';
    return str;
  };

  const symbolicStr = `${getSymbolicForTarget('owner')}${getSymbolicForTarget('group')}${getSymbolicForTarget('public')}`;
  const commandStr = `chmod ${octalStr} file.txt`;

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(commandStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  const handleToggle = (target: keyof typeof perms, perm: keyof typeof perms.owner) => {
    setPerms({
      ...perms,
      [target]: {
        ...perms[target],
        [perm]: !perms[target][perm]
      }
    });
  };

  const PermissionRow = ({ title, icon, target }: { title: string, icon: React.ReactNode, target: keyof typeof perms }) => (
    <div style={{ background: '#12121a', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f0f0f5', fontWeight: 500 }}>
        {icon}
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {(['read', 'write', 'execute'] as const).map(p => (
          <button
            key={p}
            onClick={() => handleToggle(target, p)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${perms[target][p] ? '#c9a96e' : 'rgba(255,255,255,0.06)'}`,
              background: perms[target][p] ? 'rgba(201, 169, 110, 0.1)' : '#0a0a0f',
              color: perms[target][p] ? '#c9a96e' : '#8a8a9a',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '18px', fontFamily: 'monospace' }}>
              {p === 'read' ? 'r' : p === 'write' ? 'w' : 'x'}
            </span>
            <span style={{ fontSize: '12px' }}>{t(p)}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Results Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#12121a', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
          <div style={{ color: '#8a8a9a', fontSize: '14px', marginBottom: '8px' }}>{t('octalLabel')}</div>
          <div style={{ color: '#c9a96e', fontSize: '42px', fontWeight: 700, fontFamily: 'monospace' }}>{octalStr}</div>
        </div>
        <div style={{ background: '#12121a', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
          <div style={{ color: '#8a8a9a', fontSize: '14px', marginBottom: '8px' }}>{t('symbolicLabel')}</div>
          <div style={{ color: '#f0f0f5', fontSize: '32px', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '2px', lineHeight: '48px' }}>{symbolicStr}</div>
        </div>
      </div>

      {/* Command Preview */}
      <div style={{ background: '#0a0a0f', border: '1px solid #1a1a25', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Terminal style={{ color: '#55556a' }} size={20} />
        <code style={{ flex: 1, color: '#10b981', fontSize: '16px', fontFamily: 'monospace' }}>{commandStr}</code>
        <Button variant="secondary" onClick={copyCommand} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
        </Button>
      </div>

      {/* Toggles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <PermissionRow title={t('owner')} icon={<Shield size={18} color="#ef4444" />} target="owner" />
        <PermissionRow title={t('group')} icon={<Users size={18} color="#3b82f6" />} target="group" />
        <PermissionRow title={t('public')} icon={<Globe size={18} color="#10b981" />} target="public" />
      </div>

    </div>
  );
}
