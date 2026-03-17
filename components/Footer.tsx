import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[#0A0A0A] mt-0">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
        {/* Big wordmark footer */}
        <div className="mb-10">
          <p 
            className="font-display font-bold uppercase leading-none text-text-primary"
            style={{ fontSize: 'clamp(32px, 8vw, 80px)', lineHeight: '0.85', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}
          >
            LOWEND NYC
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border pt-8">
          {/* Navigation */}
          <div>
            <p className="meta-text mb-4">NAVIGATE</p>
            <div className="space-y-2">
              {['News', 'Features', 'Mixes', 'Artists', 'About'].map((item) => (
                <a key={item} href={`/${item.toLowerCase()}`} className="block font-display uppercase text-sm tracking-wider hover:text-accent-red transition-colors duration-75">
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="meta-text mb-4">CONTACT</p>
            <div className="space-y-2 text-sm">
              <a href="mailto:hello@lowendnyc.com" className="block text-text-secondary hover:text-accent-red transition-colors">hello@lowendnyc.com</a>
              <a href="mailto:press@lowendnyc.com" className="block text-text-secondary hover:text-accent-red transition-colors">press@lowendnyc.com</a>
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="meta-text mb-4">FOLLOW</p>
            <div className="flex gap-5">
              <a href="https://instagram.com/lowend.nyc" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-red transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://soundcloud.com/lowend-nyc" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-red transition-colors" aria-label="SoundCloud">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 17.939h-1v-8.068c.308-.231.639-.429 1-.566v8.634zm3 0h1v-9.224c-.229.265-.443.548-.621.857l-.379-.184v8.551zm-2 0h1v-8.848c-.508-.079-.623-.05-1-.01v8.858zm-4 0h1v-7.02c-.312.458-.555.971-.692 1.535l-.308-.182v5.667zm-3-5.25c-.606.547-1 1.354-1 2.268 0 .914.394 1.721 1 2.268v-4.536zm18.879-.671c-.204-2.837-2.404-5.079-5.117-5.079-1.022 0-1.964.328-2.762.877v10.123h9.089c1.607 0 2.911-1.393 2.911-3.106 0-1.714-1.304-3.106-2.911-3.106h-.21z"/></svg>
              </a>
              <a href="https://twitter.com/lowend_nyc" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-red transition-colors" aria-label="Twitter / X">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div>
              <p className="font-display font-bold uppercase text-sm mb-1">JOIN THE LIST</p>
              <p className="text-text-secondary text-sm">Get weekly updates on NYC&apos;s underground scene.</p>
            </div>
            <div className="flex-1 max-w-md">
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="meta-text">
            © {new Date().getFullYear()} LOWEND NYC. ALL RIGHTS RESERVED.
          </p>
          <p className="meta-text">
            NEW YORK CITY
          </p>
        </div>
      </div>
    </footer>
  );
}
