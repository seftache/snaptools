"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    transition: 'all 0.35s ease',
    padding: scrolled ? '14px 0' : '22px 0',
    background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
    backdropFilter: scrolled ? 'blur(24px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
    boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.5)' : 'none',
  };

  return (
    <header style={navStyle}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>
            Snap<span style={{ color: '#c9a96e' }}>Tools</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link href="/" style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
            Tools Hub
          </Link>
          <a href="https://ethicalhackerprep.com" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#ffffff', textDecoration: 'none', padding: '8px 18px', borderRadius: '8px', background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,169,110,0.22)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(201,169,110,0.12)')}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c9a96e', animation: 'pulse 2s infinite' }} />
            EHP
          </a>
        </nav>
      </div>

      {/* Mobile menu toggle */}
      <button
        onClick={() => setOpen(!open)}
        style={{ display: 'none', position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: '8px' }}
        aria-label="Menu"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', background: 'rgba(10,10,10,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Link href="/" onClick={() => setOpen(false)} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>Tools Hub</Link>
              <a href="https://ethicalhackerprep.com" target="_blank" rel="noopener noreferrer" style={{ color: '#c9a96e', textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>Ethical Hacker Prep →</a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
