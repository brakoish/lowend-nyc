'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  venue: string;
  genre: string[];
  featured: boolean;
}

interface SearchResult {
  articles: Article[];
  total: number;
  query: { q: string; genre: string; venue: string };
}

const GENRES = ['Techno', 'House', 'Garage', 'Bass', 'Drum & Bass', 'Ambient', 'Acid House'];
const VENUES = ['Knockdown Center', 'Brooklyn Mirage', 'Basement', 'Elsewhere', 'Nowadays', '99 Scott', 'Brooklyn Storehouse'];

export default function Search() {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query || selectedGenre || selectedVenue) {
        performSearch();
      } else {
        setResults(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, selectedGenre, selectedVenue]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (selectedGenre) params.set('genre', selectedGenre);
      if (selectedVenue) params.set('venue', selectedVenue);

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedGenre('');
    setSelectedVenue('');
    setResults(null);
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, artists, venues..."
          className="w-full bg-transparent border border-border px-4 py-3 pl-12 text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-red transition-colors"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-transparent border border-border px-4 py-2 text-text-primary focus:outline-none focus:border-accent-red"
        >
          <option value="">All Genres</option>
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        <select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          className="bg-transparent border border-border px-4 py-2 text-text-primary focus:outline-none focus:border-accent-red"
        >
          <option value="">All Venues</option>
          {VENUES.map((venue) => (
            <option key={venue} value={venue}>
              {venue}
            </option>
          ))}
        </select>

        {(query || selectedGenre || selectedVenue) && (
          <button
            onClick={clearFilters}
            className="text-accent-red hover:text-white transition-colors text-sm uppercase tracking-wider"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-accent-red border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {results && !loading && (
        <div>
          <p className="text-text-secondary text-sm mb-4">
            {results.total} result{results.total !== 1 ? 's' : ''}
          </p>

          {results.articles.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              No articles found. Try different search terms.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="group block"
                >
                  <div className="relative h-48 overflow-hidden mb-3">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    {article.featured && (
                      <span className="absolute top-2 left-2 red-tag text-xs">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {article.genre.slice(0, 2).map((g) => (
                      <span
                        key={g}
                        className="font-mono text-[10px] uppercase px-2 py-1 bg-[#333333] text-text-secondary"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display uppercase text-lg leading-tight group-hover:text-accent-red transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-text-secondary text-sm mt-1">
                    {article.venue}
                  </p>
                  <p className="text-text-secondary text-xs mt-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
