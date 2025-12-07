import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ERROR_CODES } from '@movtime/config';
import type { Favorite } from '@movtime/types';

/**
 * Favorites Service
 * 
 * Manages user favorites with duplicate prevention and validation.
 */
@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all favorites for a user
   */
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f) => ({
      id: f.id,
      userId: f.userId,
      mediaId: f.mediaId,
      mediaType: f.mediaType as 'movie' | 'tv',
      createdAt: f.createdAt,
    }));
  }

  /**
   * Add a favorite
   */
  async addFavorite(userId: string, mediaId: number, mediaType: 'movie' | 'tv'): Promise<Favorite> {
    try {
      // Check if already exists (unique constraint will also catch this)
      const existing = await this.prisma.favorite.findUnique({
        where: {
          userId_mediaId_mediaType: {
            userId,
            mediaId,
            mediaType,
          },
        },
      });

      if (existing) {
        throw new ConflictException({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'This item is already in favorites',
        });
      }

      const favorite = await this.prisma.favorite.create({
        data: {
          userId,
          mediaId,
          mediaType,
        },
      });

      return {
        id: favorite.id,
        userId: favorite.userId,
        mediaId: favorite.mediaId,
        mediaType: favorite.mediaType as 'movie' | 'tv',
        createdAt: favorite.createdAt,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        // Prisma unique constraint violation
        throw new ConflictException({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'This item is already in favorites',
        });
      }
      this.logger.error(`Failed to add favorite: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove a favorite
   */
  async removeFavorite(userId: string, mediaId: number, mediaType: 'movie' | 'tv'): Promise<void> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_mediaId_mediaType: {
          userId,
          mediaId,
          mediaType,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'Favorite not found',
      });
    }

    await this.prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });
  }

  /**
   * Check if an item is in favorites
   */
  async isFavorite(userId: string, mediaId: number, mediaType: 'movie' | 'tv'): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_mediaId_mediaType: {
          userId,
          mediaId,
          mediaType,
        },
      },
    });

    return !!favorite;
  }
}

