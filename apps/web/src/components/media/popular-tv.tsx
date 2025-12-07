'use client';

import { useEffect, useState } from 'react';
import { MediaCard } from './media-card';
import { mediaApi } from '@/lib/api';
import type { SearchResult } from '@movtime/types';

export function PopularTV() {
  const [tvShows, setTvShows] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTV() {
      try {
        setLoading(true);
        const data = await mediaApi.getPopularTv(1);
        setTvShows(data);
      } catch (err) {
        setError('Erreur lors du chargement des séries');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTV();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (error || !tvShows) {
    return <div className="text-center py-8 text-destructive">{error}</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {tvShows.items.slice(0, 12).map((tv) => (
        <MediaCard key={tv.id} media={tv} href={`/tv/${tv.id}`} />
      ))}
    </div>
  );
}

