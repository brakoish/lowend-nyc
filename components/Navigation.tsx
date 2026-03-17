'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
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
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the close button when menu opens
      setTimeout(() => firstFocusableRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
      // Return focus to menu button when closed
      mobileMenuButtonRef.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Trap focus within mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return;
    
    const menu = mobileMenuRef.current;
    if (!menu) return;

    const focusableElements = menu.querySelectorAll<HTMLElement>(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [mobileMenuOpen]);

  return (
    <nav className="bg-page-bg sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* MASSIVE wordmark — edge to edge, ultra heavy, full width stretch */}
        <div className="pt-2 lg:pt-3 pb-0 overflow-hidden">
          <Link
            href="/"
            className="block font-display uppercase hover:text-accent-red transition-colors duration-75 leading-none w-full whitespace-nowrap"
            style={{
              fontSize: 'clamp(40px, 10vw, 140px)',
              lineHeight: '0.9',
              letterSpacing: '0.02em',
              fontWeight: 900,
              display: 'block',
              width: '100%',
            }}
          >
            LOWEND NYC
          </Link>
        </div>

        {/* Nav bar — items spread across FULL width like the mockup */}
        <div className="flex justify-between items-center py-2 border-t-2 border-white/20">
          {/* Desktop Navigation — space-between full width */}
          <div className="hidden md:flex items-center justify-between w-full">
            <div className="flex items-center justify-between flex-1 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-display uppercase font-bold transition-colors duration-75 whitespace-nowrap ${
                    pathname === link.href ? 'text-accent-red' : 'hover:text-accent-red'
                  }`}
                  style={{ fontSize: 'clamp(14px, 2vw, 28px)', fontWeight: 700 }}
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <button
              className="ml-4 lg:ml-6 text-text-secondary hover:text-accent-red transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg rounded"
              aria-label="Search"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            ref={mobileMenuButtonRef}
            className="md:hidden text-text-primary z-[60] relative ml-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg rounded p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent-red focus:text-black focus:px-4 focus:py-2 focus:font-display focus:font-bold focus:uppercase focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Full-screen mobile menu takeover */}
      <div
        ref={mobileMenuRef}
        id="mobile-menu"
        className={`fixed inset-0 bg-page-bg z-50 transition-all duration-200 md:hidden flex flex-col justify-center items-center ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <button
          ref={firstFocusableRef}
          className="absolute top-6 right-4 text-text-primary z-[60] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg rounded p-1"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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

        <nav className="flex flex-col items-center gap-1" aria-label="Mobile menu">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`font-display font-bold uppercase tracking-tight transition-colors leading-none py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-4 focus-visible:ring-offset-page-bg rounded px-2 ${
                pathname === link.href ? 'text-accent-red' : 'text-text-primary hover:text-accent-red'
              }`}
              style={{ fontSize: 'clamp(40px, 10vw, 72px)' }}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="w-16 h-1 bg-accent-red mt-16" />
      </div>
    </nav>
  );
}
