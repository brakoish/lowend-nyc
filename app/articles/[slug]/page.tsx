import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAllArticles, getArticleBySlug, getRelatedArticles } from '@/lib/articles';
import ReactMarkdown from 'react-markdown';

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

const SITE_URL = 'https://lowend-nyc.vercel.app';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return {};
  }

  // Ensure og:image is an absolute URL
  const ogImage = article.image.startsWith('http')
    ? article.image
    : `${SITE_URL}${article.image}`;

  return {
    title: `${article.title} - LOWEND NYC`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `${SITE_URL}/articles/${article.slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      siteName: 'LOWEND NYC',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [ogImage],
    },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  // Get related articles based on genre or venue
  const relatedArticles = getRelatedArticles(params.slug, article.genre, article.venue, 3);

  // Build JSON-LD structured data for Article schema
  const ogImage = article.image.startsWith('http')
    ? article.image
    : `${SITE_URL}${article.image}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: ogImage,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Organization',
      name: 'LOWEND NYC',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LOWEND NYC',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/articles/${article.slug}`,
    },
    articleSection: article.genre.join(', '),
    keywords: article.genre.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <main>
      {/* Full-width hero image with overlaid headline */}
      <section className="relative w-full">
        <div className="relative h-[400px] lg:h-[500px] w-full overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover article-image"
            unoptimized
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
          
          {/* Genre tags */}
          <div className="absolute top-4 left-4 flex gap-2">
            {article.genre.map((genre) => (
              <span key={genre} className="red-tag">
                {genre}
              </span>
            ))}
          </div>

          {/* Headline overlaid at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:px-6 lg:px-12 pb-6">
            <h1 
              className="font-display uppercase leading-[0.9] text-white"
              style={{ fontSize: 'clamp(32px, 6vw, 72px)', fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              {article.title}
            </h1>
            <div className="meta-text flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
              <span>{article.venue}</span>
              <span className="hidden sm:inline">·</span>
              <span>{article.location}</span>
              <span className="hidden sm:inline">·</span>
              <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two-column layout: Article body + Sidebar */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className={`grid grid-cols-1 ${article.artist.name === 'LOWEND Editorial' ? '' : 'xl:grid-cols-[1fr_320px]'} gap-8 lg:gap-12`}>
          {/* Article body */}
          <article>
            {/* Back Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-red transition-colors mb-8 font-mono text-sm uppercase"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>

            {/* Article Content */}
            <div className="prose-custom article-body">
              <ReactMarkdown
                components={{
                  h1: () => null, // Skip h1 - title is already shown in hero overlay
                  h2: ({ children }) => (
                    <h2 className="font-display font-bold text-xl uppercase leading-tight mb-4 mt-8 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-[2px] after:bg-accent-red">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-display font-bold text-lg uppercase leading-tight mb-3 mt-6">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-text-primary leading-[1.7] mb-6" style={{ fontSize: '18px', maxWidth: '65ch' }}>{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 mb-6 text-text-primary">{children}</ul>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-accent-red font-bold">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="text-text-secondary italic">{children}</em>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-accent-red pl-4 italic text-text-secondary my-6">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </article>

          {/* Sidebar - hidden for editorial articles */}
          {article.artist.name !== 'LOWEND Editorial' && (
          <aside className="space-y-8 xl:sticky xl:top-24 xl:self-start">
            {/* Artist Card */}
            <div className="border border-[#222] p-5">
              <h3 className="font-display font-bold uppercase text-sm mb-4 tracking-wider">
                ABOUT {article.artist.name}
              </h3>
              
              {article.artist.realName && (
                <p className="text-text-secondary text-sm mb-4">
                  <span className="text-text-primary">Real name:</span> {article.artist.realName}
                </p>
              )}

              {/* Genre tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {article.genre.map((genre) => (
                  <span key={genre} className="font-mono text-[10px] uppercase px-2 py-1 bg-[#222] text-text-secondary">
                    {genre}
                  </span>
                ))}
              </div>

              {/* Venue info */}
              <div className="mb-4">
                <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Venue</p>
                <p className="text-text-primary font-display uppercase">{article.venue}</p>
                <p className="text-text-secondary text-sm">{article.location}</p>
              </div>

              {/* Social links */}
              <div className="space-y-2">
                <p className="text-text-secondary text-xs uppercase tracking-wider mb-2">Follow</p>
                <div className="flex flex-wrap gap-2">
                  {article.artist.instagram && (
                    <a
                      href={article.artist.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 border border-[#333] hover:border-accent-red hover:text-accent-red transition-colors font-mono text-[10px] uppercase"
                    >
                      IG
                    </a>
                  )}
                  {article.artist.spotify && (
                    <a
                      href={article.artist.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 border border-[#333] hover:border-accent-red hover:text-accent-red transition-colors font-mono text-[10px] uppercase"
                    >
                      Spotify
                    </a>
                  )}
                  {article.artist.soundcloud && (
                    <a
                      href={article.artist.soundcloud}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 border border-[#333] hover:border-accent-red hover:text-accent-red transition-colors font-mono text-[10px] uppercase"
                    >
                      SoundCloud
                    </a>
                  )}
                  {article.artist.residentadvisor && (
                    <a
                      href={article.artist.residentadvisor}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 border border-[#333] hover:border-accent-red hover:text-accent-red transition-colors font-mono text-[10px] uppercase"
                    >
                      RA
                    </a>
                  )}
                  {article.artist.beatport && (
                    <a
                      href={article.artist.beatport}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 border border-[#333] hover:border-accent-red hover:text-accent-red transition-colors font-mono text-[10px] uppercase"
                    >
                      Beatport
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
            <div className="border border-[#222] p-5">
              <h3 className="font-display font-bold uppercase text-sm mb-4 tracking-wider">
                RELATED ARTICLES
              </h3>
              <div className="space-y-4">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/articles/${related.slug}`}
                    className="group block"
                  >
                    <div className="relative h-24 w-full overflow-hidden mb-2">
                      <Image
                        src={related.image}
                        alt={related.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    </div>
                    <h4 className="font-display uppercase text-sm leading-tight group-hover:text-accent-red transition-colors line-clamp-2">
                      {related.title}
                    </h4>
                    <p className="text-text-secondary text-xs mt-1">
                      {related.venue}
                    </p>
                  </Link>
                ))}
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-accent-red hover:text-[#CC2222] transition-colors font-display uppercase text-sm mt-4"
              >
                View All Articles
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            )}
          </aside>
          )}
        </div>
      </section>
    </main>
    </>
  );
}
