import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/articles';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.toLowerCase() || '';
  const genre = searchParams.get('genre')?.toLowerCase() || '';
  const venue = searchParams.get('venue')?.toLowerCase() || '';

  if (!query && !genre && !venue) {
    return NextResponse.json({ articles: [] });
  }

  const articles = getAllArticles();

  const filtered = articles.filter((article) => {
    // Text search
    const matchesQuery = !query || 
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.artist.name.toLowerCase().includes(query) ||
      article.venue.toLowerCase().includes(query);

    // Genre filter
    const matchesGenre = !genre ||
      article.genre.some(g => g.toLowerCase().includes(genre));

    // Venue filter
    const matchesVenue = !venue ||
      article.venue.toLowerCase().includes(venue);

    return matchesQuery && matchesGenre && matchesVenue;
  });

  // Sort by relevance (featured first, then date)
  const sorted = filtered.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return NextResponse.json({ 
    articles: sorted,
    total: sorted.length,
    query: { q: query, genre, venue }
  });
}
