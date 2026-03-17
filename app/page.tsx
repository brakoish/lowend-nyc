import Link from 'next/link';
import Image from 'next/image';
import { getAllArticles } from '@/lib/articles';

export default function HomePage() {
  const articles = getAllArticles();
  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  const gridArticles = articles.filter((a) => a.slug !== featuredArticle.slug);

  return (
    <main>
      {/* HERO SECTION — Full width image with overlaid headline */}
      <section className="relative w-full">
        <Link href={`/articles/${featuredArticle.slug}`} className="group block relative">
          {/* Full width image */}
          <div className="relative h-[500px] lg:h-[600px] w-full overflow-hidden">
            <Image
              src={featuredArticle.image}
              alt={featuredArticle.title}
              fill
              className="object-cover article-image transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              unoptimized
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
            
            {/* FEATURE tag */}
            <div className="absolute top-4 left-4">
              <span className="red-tag">FEATURE</span>
            </div>

            {/* Content overlaid at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:px-6 lg:px-12 pb-6">
              {/* Red artist name */}
              <p className="font-display text-accent-red uppercase font-bold mb-2 transition-colors duration-300 group-hover:text-[#FF5555]" style={{ fontSize: 'clamp(14px, 2vw, 24px)' }}>
                {featuredArticle.artist.name === 'LOWEND Editorial' ? 'EDITORIAL' : featuredArticle.artist.name}
              </p>
              {/* Massive headline */}
              <h1 
                className="font-display uppercase leading-[0.95] text-white mb-4 transition-colors duration-300 group-hover:text-[#FF2B2B]"
                style={{ fontSize: 'clamp(28px, 7vw, 96px)', fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                {featuredArticle.title}
              </h1>
              {/* Metadata row */}
              <div className="meta-text flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>POSTED {new Date(featuredArticle.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                <span className="hidden sm:inline">·</span>
                <span>4 MIN READ</span>
                <span className="hidden sm:inline">·</span>
                <span>{featuredArticle.venue}</span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* GRID BELOW HERO — Dense 3-column layout */}
      <section className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {gridArticles.map((article, index) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className={`group block overflow-hidden ${index === 2 ? 'bg-[#FF2B2B]' : 'border border-[#222] hover:border-[#FF2B2B]'} transition-all duration-500 ease-out`}
            >
              {/* Image */}
              <div className="relative h-[200px] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover article-image transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:grayscale-[30%]"
                  unoptimized
                />
              </div>
              {/* Content */}
              <div className={`p-3 ${index === 2 ? 'text-black' : ''}`}>
                <p className={`font-display uppercase font-bold text-xs mb-1 ${index === 2 ? 'text-black/70 group-hover:text-black' : 'text-accent-red group-hover:text-[#FF5555]'} transition-colors duration-300`}>
                  {article.artist.name === 'LOWEND Editorial' ? 'EDITORIAL' : article.artist.name}
                </p>
                <h3 
                  className={`font-display font-bold uppercase leading-tight mb-2 line-clamp-2 ${index === 2 ? 'group-hover:text-black/80' : 'group-hover:text-accent-red'} transition-colors duration-300`}
                  style={{ fontSize: 'clamp(14px, 1.5vw, 22px)' }}
                >
                  {article.title}
                </h3>
                <div className={`meta-text ${index === 2 ? 'text-black/60' : ''}`}>
                  {article.venue} · {article.genre[0].toUpperCase()}
                </div>
              </div>
            </Link>
          ))}
          
          {/* Red accent card for Breakaway/Pacha promo */}
          <div className="bg-[#FF2B2B] p-4 flex flex-col justify-between min-h-[280px]">
            <div>
              <p className="font-display font-bold text-black uppercase text-xs mb-2">EVENT PREVIEW</p>
              <h3 className="font-display font-bold text-black uppercase leading-tight" style={{ fontSize: 'clamp(18px, 2vw, 28px)' }}>
                BREAKAWAY NYC
              </h3>
              <p className="text-black/80 text-sm mt-2">The biggest bass music event of the summer returns to New York.</p>
            </div>
            <div className="meta-text text-black/60">
              AUG 15-17 · RANDALL&apos;S ISLAND
            </div>
          </div>
        </div>
      </section>

      {/* JOIN THE NOISE — Full-bleed red block */}
      <section className="relative w-full bg-[#FF2B2B] py-12 lg:py-16 mt-8 noise-section">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex-1">
              <h2 
                className="font-display font-bold text-black uppercase leading-none"
                style={{ fontSize: 'clamp(36px, 10vw, 120px)' }}
              >
                JOIN THE NOISE
              </h2>
              <p className="text-black/60 mt-3 font-mono text-sm max-w-md">
                Get the latest on NYC&apos;s underground bass scene. New mixes, artist features, and event previews delivered weekly.
              </p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3 flex-1 lg:max-w-lg">
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL"
                className="flex-1 px-4 py-3 bg-black/20 border-2 border-black/40 text-black placeholder:text-black/50 font-mono text-sm uppercase focus:outline-none focus:border-black transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-black text-[#FF2B2B] font-display font-bold uppercase tracking-wider hover:bg-black/80 transition-colors duration-75 whitespace-nowrap"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ALL COVERAGE */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-display font-bold uppercase tracking-tight whitespace-nowrap" style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700 }}>ALL COVERAGE</h2>
          <div className="flex-1 h-[1px] bg-border" />
          <span className="meta-text whitespace-nowrap">{articles.length} ARTICLES</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group block overflow-hidden border border-[#222] hover:border-[#FF2B2B] transition-all duration-500 ease-out"
            >
              <div className="relative h-[200px] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover article-image transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:grayscale-[30%]"
                  unoptimized
                />
                <div className="absolute top-0 left-0 flex">
                  <span className="red-tag">{article.genre[0]}</span>
                </div>
              </div>
              <div className="p-3">
                <p className="font-display text-accent-red uppercase text-xs font-bold tracking-wider mb-1 group-hover:text-[#FF5555] transition-colors duration-300">
                  {article.artist.name === 'LOWEND Editorial' ? 'EDITORIAL' : article.artist.name}
                </p>
                <h3 className="font-display font-bold uppercase leading-tight mb-2 group-hover:text-accent-red transition-colors duration-300 line-clamp-2" style={{ fontSize: 'clamp(14px, 1.5vw, 22px)' }}>
                  {article.title}
                </h3>
                <div className="meta-text">
                  {article.venue} · {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
