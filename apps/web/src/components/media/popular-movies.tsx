'use client';

import { useEffect, useState } from 'react';
import { MediaCard } from './media-card';
import { mediaApi } from '@/lib/api';
import type { SearchResult } from '@movtime/types';

export function PopularMovies() {
  const [movies, setMovies] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const data = await mediaApi.getPopularMovies(1);
        setMovies(data);
      } catch (err) {
        setError('Erreur lors du chargement des films');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (error || !movies) {
    return <div className="text-center py-8 text-destructive">{error}</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.items.slice(0, 12).map((movie) => (
        <MediaCard key={movie.id} media={movie} href={`/movie/${movie.id}`} />
      ))}
    </div>
  );
}

