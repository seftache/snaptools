"use client";
import React, { useState } from 'react';

export default function RobotsTxtWidget({ locale }: { locale: string }) {
  const [userAgent, setUserAgent] = useState('*');
  const [allow, setAllow] = useState('');
  const [disallow, setDisallow] = useState('');
  const [sitemap, setSitemap] = useState('');

  const generateRobotsTxt = () => {
    let output = `User-agent: ${userAgent || '*'}\n`;
    if (allow) {
      allow.split(',').forEach(path => {
        output += `Allow: ${path.trim()}\n`;
      });
    }
    if (disallow) {
      disallow.split(',').forEach(path => {
        output += `Disallow: ${path.trim()}\n`;
      });
    }
    if (sitemap) {
      output += `\nSitemap: ${sitemap}\n`;
    }
    return output;
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Robots.txt Generator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">User-Agent</label>
            <input
              type="text"
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-md p-2 focus:outline-none focus:border-orange-500/50"
              placeholder="*"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Allow (comma separated)</label>
            <input
              type="text"
              value={allow}
              onChange={(e) => setAllow(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-md p-2 focus:outline-none focus:border-orange-500/50"
              placeholder="/"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Disallow (comma separated)</label>
            <input
              type="text"
              value={disallow}
              onChange={(e) => setDisallow(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-md p-2 focus:outline-none focus:border-orange-500/50"
              placeholder="/admin/, /private/"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sitemap URL</label>
            <input
              type="url"
              value={sitemap}
              onChange={(e) => setSitemap(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-md p-2 focus:outline-none focus:border-orange-500/50"
              placeholder="https://example.com/sitemap.xml"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">Generated Output</h3>
          <textarea
            readOnly
            value={generateRobotsTxt()}
            className="w-full h-[280px] bg-black/40 border border-orange-500/30 rounded-lg p-4 font-mono text-sm focus:outline-none text-orange-200"
          />
        </div>
      </div>
    </div>
  );
}
