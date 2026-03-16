import Link from 'next/link';
import Image from 'next/image';
import { getAllArtists } from '@/lib/articles';

export const metadata = {
  title: 'Artists - LOWEND NYC',
  description: 'Artists covered by LOWEND NYC. Profiles, social links, and event recaps from the NYC underground.',
};

function SocialLink({ href, label }: { href: string; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-xs uppercase tracking-wider text-text-secondary hover:text-accent-red transition-colors border border-border px-3 py-1.5 hover:border-accent-red"
    >
      {label}
    </a>
  );
}

export default function ArtistsPage() {
  const artists = getAllArtists();

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
      {/* Page header */}
      <div className="mb-16">
        <h1 className="font-display font-bold text-6xl sm:text-8xl uppercase tracking-tight mb-4">
          ARTISTS
        </h1>
        <div className="w-20 h-1 bg-accent-red mb-6" />
        <p className="text-text-secondary text-lg max-w-2xl">
          Every artist we&apos;ve covered. Full profiles, social links, and our write-ups from the NYC underground.
        </p>
      </div>

      {/* Artists grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <div
            key={artist.name}
            className="bg-card-bg border border-border group"
          >
            {/* Artist image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={artist.image || `https://picsum.photos/seed/${encodeURIComponent(artist.name)}/800/600`}
                alt={artist.name}
                fill
                className="object-cover grayscale contrast-[1.1] group-hover:grayscale-0 transition-all duration-500"
              />
              {/* Red overlay on hover */}
              <div className="absolute inset-0 bg-accent-red/0 group-hover:bg-accent-red/10 transition-colors duration-300" />
            </div>

            {/* Artist info */}
            <div className="p-6">
              <h2 className="font-display font-bold text-3xl uppercase tracking-tight mb-1">
                {artist.name}
              </h2>
              {artist.realName && (
                <p className="font-mono text-xs text-text-secondary uppercase tracking-wider mb-4">
                  {artist.realName}
                </p>
              )}

              {/* Genre tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {artist.genres.map((genre: string) => (
                  <span
                    key={genre}
                    className="font-mono text-[10px] uppercase tracking-wider text-accent-red border border-accent-red/30 px-2 py-0.5"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Social links */}
              <div className="flex flex-wrap gap-2 mb-6">
                <SocialLink href={artist.instagram} label="Instagram" />
                <SocialLink href={artist.spotify} label="Spotify" />
                <SocialLink href={artist.soundcloud} label="SoundCloud" />
                <SocialLink href={artist.residentadvisor} label="RA" />
                <SocialLink href={artist.beatport} label="Beatport" />
              </div>

              {/* Related articles */}
              <div className="border-t border-border pt-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary mb-3">
                  {artist.articles.length} {artist.articles.length === 1 ? 'Article' : 'Articles'}
                </p>
                {artist.articles.map((article: { slug: string; title: string }) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="block font-display text-sm uppercase tracking-wide hover:text-accent-red transition-colors mb-1"
                  >
                    → {article.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
