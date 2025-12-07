import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { SearchHistory } from '@movtime/types';

/**
 * Search Service
 * 
 * Manages user search history.
 */
@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user search history
   */
  async getSearchHistory(userId: string, limit: number = 20): Promise<SearchHistory[]> {
    const history = await this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return history.map((h) => ({
      id: h.id,
      userId: h.userId,
      query: h.query,
      mediaType: h.mediaType as 'movie' | 'tv' | undefined,
      country: h.country || undefined,
      createdAt: h.createdAt,
    }));
  }

  /**
   * Save a search query
   */
  async saveSearch(
    userId: string,
    data: { query: string; mediaType?: 'movie' | 'tv'; country?: string }
  ): Promise<SearchHistory> {
    const search = await this.prisma.searchHistory.create({
      data: {
        userId,
        query: data.query,
        mediaType: data.mediaType,
        country: data.country,
      },
    });

    return {
      id: search.id,
      userId: search.userId,
      query: search.query,
      mediaType: search.mediaType as 'movie' | 'tv' | undefined,
      country: search.country || undefined,
      createdAt: search.createdAt,
    };
  }

  /**
   * Delete a specific search history entry
   */
  async deleteSearchHistory(userId: string, searchId: string): Promise<void> {
    await this.prisma.searchHistory.deleteMany({
      where: {
        id: searchId,
        userId, // Ensure user owns the search
      },
    });
  }

  /**
   * Clear all search history for a user
   */
  async clearSearchHistory(userId: string): Promise<void> {
    await this.prisma.searchHistory.deleteMany({
      where: { userId },
    });
  }
}

