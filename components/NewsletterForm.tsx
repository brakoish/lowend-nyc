'use client';

import { useState, FormEvent } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Thanks for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="w-full">
      {status === 'success' ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-black/20 border-2 border-black text-black" role="status" aria-live="polite">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-mono text-sm uppercase">{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" aria-label="Newsletter subscription">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ENTER YOUR EMAIL"
            disabled={status === 'loading'}
            aria-required="true"
            aria-invalid={status === 'error' ? 'true' : 'false'}
            aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
            className="flex-1 px-4 py-3 bg-white border-2 border-black text-black placeholder:text-black/60 font-mono text-sm uppercase focus:outline-none focus:border-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#E30614] transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-black text-[#E30614] font-display font-bold uppercase tracking-wider hover:bg-black/80 transition-colors duration-75 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#E30614]"
          >
            {status === 'loading' ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
          </button>
        </form>
      )}
      
      {status === 'error' && (
        <p id="newsletter-error" className="mt-2 text-black/80 font-mono text-xs uppercase" role="alert" aria-live="assertive">
          {message}
        </p>
      )}
    </div>
  );
}
