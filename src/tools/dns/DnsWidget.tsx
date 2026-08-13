"use client";

import React, { useState, useEffect, useCallback } from "react";

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS', 'SOA'] as const;
type RecordType = typeof RECORD_TYPES[number] | 'ALL';

const DNS_TYPE_MAP: Record<number, string> = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  12: 'PTR',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA',
  33: 'SRV',
  257: 'CAA',
};

const DNS_STATUS_MAP: Record<number, { text: string; desc: string; color: string }> = {
  0: { text: 'NOERROR', desc: 'Query completed successfully', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  1: { text: 'FORMERR', desc: 'Format error in request', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  2: { text: 'SERVFAIL', desc: 'Server failed to process query', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  3: { text: 'NXDOMAIN', desc: 'Domain does not exist', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  4: { text: 'NOTIMP', desc: 'Query type not implemented', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  5: { text: 'REFUSED', desc: 'Server refused query', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
};

const TYPE_COLORS: Record<string, { badge: string; text: string }> = {
  A: { badge: 'bg-blue-500/20 border-blue-500/40 text-blue-300', text: 'text-blue-300' },
  AAAA: { badge: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300', text: 'text-indigo-300' },
  MX: { badge: 'bg-purple-500/20 border-purple-500/40 text-purple-300', text: 'text-purple-300' },
  TXT: { badge: 'bg-amber-500/20 border-amber-500/40 text-amber-300', text: 'text-amber-300' },
  CNAME: { badge: 'bg-teal-500/20 border-teal-500/40 text-teal-300', text: 'text-teal-300' },
  NS: { badge: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', text: 'text-emerald-300' },
  SOA: { badge: 'bg-pink-500/20 border-pink-500/40 text-pink-300', text: 'text-pink-300' },
};

interface DnsRecord {
  name: string;
  type: number;
  typeName: string;
  TTL: number;
  data: string;
}

interface QueryResult {
  status: number;
  records: DnsRecord[];
  rawResponse?: any;
  responseTimeMs: number;
}

export default function DnsWidget({ locale }: { locale: string }) {
  const isFr = locale === 'fr';
  const [domain, setDomain] = useState('example.com');
  const [recordType, setRecordType] = useState<RecordType>('A');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const cleanDomainName = (input: string) => {
    let clean = input.trim().toLowerCase();
    // Remove protocol
    clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
    // Remove paths / query params / ports
    clean = clean.split('/')[0].split(':')[0];
    return clean;
  };

  const executeLookup = useCallback(async () => {
    const targetDomain = cleanDomainName(domain);
    if (!targetDomain) {
      setError(isFr ? 'Veuillez saisir un nom de domaine valide' : 'Please enter a valid domain name');
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      if (recordType === 'ALL') {
        // Query common record types concurrently
        const queries = RECORD_TYPES.map(async (t) => {
          const res = await fetch(
            `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(targetDomain)}&type=${t}`,
            { headers: { Accept: 'application/dns-json' } }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        });

        const responses = await Promise.allSettled(queries);
        const elapsed = Math.round(performance.now() - startTime);

        let overallStatus = 0;
        const allRecords: DnsRecord[] = [];
        const rawList: any[] = [];

        responses.forEach((res) => {
          if (res.status === 'fulfilled' && res.value) {
            rawList.push(res.value);
            if (res.value.Status !== undefined && res.value.Status !== 0 && overallStatus === 0) {
              overallStatus = res.value.Status;
            }
            if (Array.isArray(res.value.Answer)) {
              res.value.Answer.forEach((ans: any) => {
                allRecords.push({
                  name: ans.name,
                  type: ans.type,
                  typeName: DNS_TYPE_MAP[ans.type] || `TYPE${ans.type}`,
                  TTL: ans.TTL,
                  data: ans.data,
                });
              });
            }
          }
        });

        setResult({
          status: overallStatus,
          records: allRecords,
          rawResponse: rawList,
          responseTimeMs: elapsed,
        });
      } else {
        // Query single record type
        let res: Response;
        try {
          res = await fetch(
            `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(targetDomain)}&type=${recordType}`,
            { headers: { Accept: 'application/dns-json' } }
          );
        } catch (fetchErr) {
          // Fallback to Google DoH if Cloudflare fails
          res = await fetch(
            `https://dns.google/resolve?name=${encodeURIComponent(targetDomain)}&type=${recordType}`
          );
        }

        if (!res.ok) {
          throw new Error(`DNS Query returned status ${res.status}`);
        }

        const data = await res.json();
        const elapsed = Math.round(performance.now() - startTime);

        const records: DnsRecord[] = [];
        if (Array.isArray(data.Answer)) {
          data.Answer.forEach((ans: any) => {
            records.push({
              name: ans.name,
              type: ans.type,
              typeName: DNS_TYPE_MAP[ans.type] || `TYPE${ans.type}`,
              TTL: ans.TTL,
              data: ans.data,
            });
          });
        }

        setResult({
          status: data.Status ?? 0,
          records,
          rawResponse: data,
          responseTimeMs: elapsed,
        });
      }
    } catch (err: any) {
      setError(
        isFr
          ? `Impossible d'interroger les serveurs DNS : ${err.message || 'Erreur réseau'}`
          : `Failed to query DNS servers: ${err.message || 'Network error'}`
      );
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [domain, recordType, isFr]);

  // Initial lookup on mount
  useEffect(() => {
    executeLookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatTTL = (ttl: number) => {
    if (ttl < 60) return `${ttl}s`;
    if (ttl < 3600) return `${ttl}s (${Math.round(ttl / 60)}m)`;
    return `${ttl}s (${(ttl / 3600).toFixed(1)}h)`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Search Bar & Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Domain Input Field */}
          <div className="relative flex-1">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeLookup()}
              placeholder={isFr ? 'ex: exemple.fr ou sousdomaine.domaine.com' : 'e.g. example.com or github.com'}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-devsec)] transition-all"
            />
            {domain && (
              <button
                onClick={() => setDomain('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Record Type Selector */}
          <div className="flex items-center gap-2">
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value as RecordType)}
              className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-3 text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-devsec)] cursor-pointer"
            >
              <option value="ALL" className="bg-[var(--bg-elevated)] font-semibold">ALL (Tout)</option>
              {RECORD_TYPES.map((t) => (
                <option key={t} value={t} className="bg-[var(--bg-elevated)]">
                  {t}
                </option>
              ))}
            </select>

            {/* Lookup Button */}
            <button
              onClick={executeLookup}
              disabled={isLoading}
              className="px-5 py-3 rounded-xl font-semibold text-sm bg-[var(--accent-devsec)] text-black hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>{isFr ? 'Recherche...' : 'Searching...'}</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>{isFr ? 'Interroger' : 'Lookup'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>{isFr ? 'Exemples rapides :' : 'Quick presets:'}</span>
          {['google.com', 'cloudflare.com', 'github.com', 'wikipedia.org'].map((p) => (
            <button
              key={p}
              onClick={() => {
                setDomain(p);
                setTimeout(() => executeLookup(), 10);
              }}
              className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-mono"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <span className="text-base">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Status Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold border font-mono ${
                  DNS_STATUS_MAP[result.status]?.color || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                }`}
              >
                {DNS_STATUS_MAP[result.status]?.text || `STATUS ${result.status}`}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {DNS_STATUS_MAP[result.status]?.desc || ''}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono">
              <span>⏱️ {result.responseTimeMs} ms</span>
              <span>•</span>
              <span>{result.records.length} {isFr ? 'enregistrement(s)' : 'record(s)'}</span>
            </div>
          </div>

          {/* Records Table / List */}
          {result.records.length === 0 ? (
            <div className="p-10 text-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {isFr ? 'Aucun enregistrement DNS trouvé' : 'No DNS records found'}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {isFr
                  ? `Aucun enregistrement de type "${recordType}" n'est configuré pour ce domaine.`
                  : `No "${recordType}" records are configured for this domain name.`}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-muted)]">
                      <th className="py-3 px-4 font-semibold">{isFr ? 'Type' : 'Type'}</th>
                      <th className="py-3 px-4 font-semibold">{isFr ? 'Nom d\'hôte' : 'Host / Name'}</th>
                      <th className="py-3 px-4 font-semibold">TTL</th>
                      <th className="py-3 px-4 font-semibold">{isFr ? 'Valeur / Données' : 'Value / Target'}</th>
                      <th className="py-3 px-4 text-right font-semibold">{isFr ? 'Action' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]/50">
                    {result.records.map((rec, idx) => {
                      const color = TYPE_COLORS[rec.typeName] || {
                        badge: 'bg-gray-500/20 border-gray-500/40 text-gray-300',
                        text: 'text-gray-300',
                      };
                      const rowKey = `${rec.typeName}-${idx}`;
                      const isCopied = copiedId === rowKey;

                      return (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          {/* Record Type Badge */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${color.badge}`}>
                              {rec.typeName}
                            </span>
                          </td>

                          {/* Host name */}
                          <td className="py-3 px-4 text-[var(--text-secondary)] whitespace-nowrap max-w-[200px] truncate">
                            {rec.name}
                          </td>

                          {/* TTL */}
                          <td className="py-3 px-4 text-[var(--text-muted)] whitespace-nowrap">
                            {formatTTL(rec.TTL)}
                          </td>

                          {/* Value / Data */}
                          <td className="py-3 px-4 text-[var(--text-primary)] font-medium break-all max-w-[400px]">
                            {rec.data}
                          </td>

                          {/* Copy Action */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleCopy(rec.data, rowKey)}
                              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                                isCopied
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-[var(--border-subtle)] hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {isCopied ? (isFr ? '✓ Copié' : '✓ Copied') : (isFr ? 'Copier' : 'Copy')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw JSON Debug Viewer */}
          <div className="pt-2">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1.5"
            >
              <span>{showRawJson ? '▼' : '►'}</span>
              <span>{isFr ? 'Voir la réponse brute DoH (JSON)' : 'Inspect Raw DoH Response (JSON)'}</span>
            </button>

            {showRawJson && (
              <pre className="mt-2 p-3.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)] overflow-auto max-h-60">
                {JSON.stringify(result.rawResponse, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
