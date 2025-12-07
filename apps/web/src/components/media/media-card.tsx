'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { getImageUrl, truncate } from '@/lib/utils';
import type { MediaItem } from '@movtime/types';

interface MediaCardProps {
  media: MediaItem;
  href: string;
}

export function MediaCard({ media, href }: MediaCardProps) {
  return (
    <Link href={href}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={getImageUrl(media.posterPath, 'w500')}
            alt={media.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-1">{media.title}</h3>
          {media.releaseDate && (
            <p className="text-sm text-muted-foreground mb-2">
              {new Date(media.releaseDate).getFullYear()}
            </p>
          )}
          {media.overview && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {truncate(media.overview, 100)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

