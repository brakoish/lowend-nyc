export const metadata = {
  title: 'About - LOWEND NYC',
  description: 'LOWEND NYC is an independent electronic music publication based in New York City.',
};

export default function AboutPage() {
  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
      {/* Page header */}
      <div className="mb-16">
        <h1 className="font-display font-bold text-6xl sm:text-8xl uppercase tracking-tight mb-4">
          ABOUT
        </h1>
        <div className="w-20 h-1 bg-accent-red mb-6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-display font-bold text-3xl uppercase tracking-tight mb-6">
              THE PUBLICATION
            </h2>
            <div className="space-y-4 text-text-secondary text-lg leading-relaxed">
              <p>
                LOWEND NYC is an independent electronic music publication covering the underground scene in New York City. We document the sets, the artists, and the rooms that make this city&apos;s nightlife worth staying up for.
              </p>
              <p>
                We cover techno, house, garage, bass music, and everything that lives in the low frequencies. From warehouse parties in Bushwick to sold-out rooms at Avant Gardner, we go where the sound takes us.
              </p>
              <p>
                Every write-up is first-person. We were in the room. We felt the bass. We watched the crowd lose it at 3 AM. That&apos;s the only way to cover this music honestly.
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="font-display font-bold text-3xl uppercase tracking-tight mb-6">
              WHAT WE DO
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-card-bg border border-border p-6">
                <h3 className="font-display font-bold text-xl uppercase mb-3 text-accent-red">EVENT RECAPS</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  On-the-ground coverage of DJ sets, festivals, and club nights across NYC. What happened, who played, and why it mattered.
                </p>
              </div>
              <div className="bg-card-bg border border-border p-6">
                <h3 className="font-display font-bold text-xl uppercase mb-3 text-accent-red">ARTIST PROFILES</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Deep dives into the producers and DJs pushing the scene forward. Full social links, discography, and our coverage history.
                </p>
              </div>
              <div className="bg-card-bg border border-border p-6">
                <h3 className="font-display font-bold text-xl uppercase mb-3 text-accent-red">MIX FEATURES</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Curated mixes and set recordings from artists we believe in. The tracks that define the current moment.
                </p>
              </div>
              <div className="bg-card-bg border border-border p-6">
                <h3 className="font-display font-bold text-xl uppercase mb-3 text-accent-red">PHOTOGRAPHY</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Raw, high-contrast documentation of NYC nightlife. The energy, the crowds, the moments between drops.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Press / Media Contact */}
          <div className="bg-card-bg border border-border p-6">
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight mb-4">
              PRESS &amp; MEDIA
            </h3>
            <div className="w-12 h-0.5 bg-accent-red mb-4" />
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              We cover events across NYC and are available for press credentials, media passes, and festival coverage. Reach out for our media kit.
            </p>
            <div className="space-y-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary mb-1">General Inquiries</p>
                <a href="mailto:hello@lowendnyc.com" className="text-accent-red hover:underline text-sm">
                  hello@lowendnyc.com
                </a>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary mb-1">Press / Credentials</p>
                <a href="mailto:press@lowendnyc.com" className="text-accent-red hover:underline text-sm">
                  press@lowendnyc.com
                </a>
              </div>
            </div>
          </div>

          {/* Based in */}
          <div className="bg-card-bg border border-border p-6">
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight mb-4">
              BASED IN
            </h3>
            <div className="w-12 h-0.5 bg-accent-red mb-4" />
            <p className="font-display text-4xl uppercase tracking-tight leading-none mb-2">
              NEW YORK
            </p>
            <p className="font-display text-4xl uppercase tracking-tight leading-none text-accent-red">
              CITY
            </p>
            <p className="font-mono text-xs text-text-secondary mt-4 uppercase tracking-wider">
              Brooklyn · Manhattan · Queens
            </p>
          </div>

          {/* Social */}
          <div className="bg-card-bg border border-border p-6">
            <h3 className="font-display font-bold text-2xl uppercase tracking-tight mb-4">
              FOLLOW
            </h3>
            <div className="w-12 h-0.5 bg-accent-red mb-4" />
            <div className="space-y-2">
              {[
                { label: 'Instagram', href: '#' },
                { label: 'Twitter / X', href: '#' },
                { label: 'SoundCloud', href: '#' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex items-center justify-between py-2 border-b border-border hover:text-accent-red transition-colors group"
                >
                  <span className="font-display uppercase text-sm tracking-wider">{social.label}</span>
                  <span className="text-text-secondary group-hover:text-accent-red transition-colors">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
