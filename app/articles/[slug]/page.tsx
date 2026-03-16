import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAllArticles, getArticleBySlug } from '@/lib/articles';
import ReactMarkdown from 'react-markdown';

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return {};
  }

  return {
    title: `${article.title} - LOWEND NYC`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      images: [article.image],
    },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

      {/* Article Header */}
      <article>
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {article.genre.map((genre) => (
              <span
                key={genre}
                className="font-mono text-xs uppercase px-3 py-1 bg-accent-red text-page-bg"
              >
                {genre}
              </span>
            ))}
          </div>

          <h1 className="font-display font-bold text-4xl md:text-6xl uppercase leading-none mb-6">
            {article.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 font-mono text-sm text-text-secondary uppercase mb-8">
            <div>{article.venue}</div>
            <div>{article.location}</div>
            <div>{new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative h-[400px] md:h-[600px] mb-12 overflow-hidden border border-border">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover article-image"
            unoptimized
            priority
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-invert prose-lg max-w-none mb-12">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="font-display font-bold text-4xl uppercase leading-tight mb-6 mt-8">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="font-display font-bold text-3xl uppercase leading-tight mb-4 mt-8">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-display font-bold text-2xl uppercase leading-tight mb-3 mt-6">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-text-primary text-lg leading-relaxed mb-6">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 mb-6 text-text-primary">{children}</ul>
              ),
              strong: ({ children }) => (
                <strong className="text-accent-red font-bold">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="text-text-secondary">{children}</em>
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Artist Info Section */}
        <div className="border-t border-border pt-12">
          <h3 className="font-display font-bold text-2xl uppercase mb-6">
            ABOUT {article.artist.name}
          </h3>

          {article.artist.realName && (
            <p className="text-text-secondary mb-6">
              Real name: {article.artist.realName}
            </p>
          )}

          <div className="flex flex-wrap gap-4">
            {article.artist.spotify && (
              <a
                href={article.artist.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border hover:border-accent-red hover:text-accent-red transition-colors font-mono text-sm uppercase"
              >
                Spotify
              </a>
            )}
            {article.artist.soundcloud && (
              <a
                href={article.artist.soundcloud}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border hover:border-accent-red hover:text-accent-red transition-colors font-mono text-sm uppercase"
              >
                SoundCloud
              </a>
            )}
            {article.artist.instagram && (
              <a
                href={article.artist.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border hover:border-accent-red hover:text-accent-red transition-colors font-mono text-sm uppercase"
              >
                Instagram
              </a>
            )}
            {article.artist.residentadvisor && (
              <a
                href={article.artist.residentadvisor}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border hover:border-accent-red hover:text-accent-red transition-colors font-mono text-sm uppercase"
              >
                Resident Advisor
              </a>
            )}
            {article.artist.beatport && (
              <a
                href={article.artist.beatport}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border hover:border-accent-red hover:text-accent-red transition-colors font-mono text-sm uppercase"
              >
                Beatport
              </a>
            )}
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <div className="border-t border-border pt-12 mt-12">
        <h3 className="font-display font-bold text-2xl uppercase mb-6">
          MORE FROM LOWEND NYC
        </h3>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-accent-red hover:text-[#CC2222] transition-colors font-display uppercase text-lg"
        >
          View All Articles
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
