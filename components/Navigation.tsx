'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'NEWS' },
  { href: '/features', label: 'FEATURES' },
  { href: '/mixes', label: 'MIXES' },
  { href: '/artists', label: 'ARTISTS' },
  { href: '/about', label: 'ABOUT' },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <nav className="bg-page-bg sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* MASSIVE wordmark — edge to edge, ultra heavy, full width stretch */}
        <div className="pt-2 lg:pt-3 pb-0 overflow-hidden">
          <Link
            href="/"
            className="block font-display uppercase hover:text-accent-red transition-colors duration-75 leading-none w-full"
            style={{
              fontSize: 'clamp(60px, 16vw, 220px)',
              lineHeight: '0.9',
              letterSpacing: '0.02em',
              fontWeight: 900,
              display: 'block',
              width: '100%',
              textAlign: 'justify',
              textAlignLast: 'justify',
            }}
          >
            LOWEND NYC
          </Link>
        </div>

        {/* Nav bar — items spread across FULL width like the mockup */}
        <div className="flex justify-between items-center py-2 border-t-2 border-white/20">
          {/* Desktop Navigation — space-between full width */}
          <div className="hidden md:flex items-center justify-between w-full">
            <div className="flex items-center justify-between flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-display uppercase font-bold transition-colors duration-75 ${
                    pathname === link.href ? 'text-accent-red' : 'hover:text-accent-red'
                  }`}
                  style={{ fontSize: 'clamp(16px, 2.5vw, 32px)', fontWeight: 700 }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <button className="ml-6 text-text-secondary hover:text-accent-red transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-text-primary z-[60] relative ml-auto"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Full-screen mobile menu takeover */}
      <div
        className={`fixed inset-0 bg-page-bg z-50 transition-all duration-200 md:hidden flex flex-col justify-center items-center ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          className="absolute top-6 right-4 text-text-primary z-[60]"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <Link
          href="/"
          className="font-display font-bold text-xl tracking-tight uppercase text-text-secondary/40 mb-16"
          onClick={() => setMobileMenuOpen(false)}
        >
          LOWEND NYC
        </Link>

        <div className="flex flex-col items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`font-display font-bold uppercase tracking-tight transition-colors leading-none py-3 ${
                pathname === link.href ? 'text-accent-red' : 'text-text-primary hover:text-accent-red'
              }`}
              style={{ fontSize: 'clamp(40px, 10vw, 72px)' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="w-16 h-1 bg-accent-red mt-16" />
      </div>
    </nav>
  );
}
