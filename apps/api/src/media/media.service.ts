import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TmdbService } from '../services/tmdb/tmdb.service';
import type { MediaDetails, SearchResult } from '@movtime/types';
import { ERROR_CODES } from '@movtime/config';

/**
 * Media Service
 * 
 * Business logic for movies and TV shows.
 * Orchestrates calls to external APIs and handles error cases.
 */
@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(private readonly tmdbService: TmdbService) {}

  /**
   * Search for media
   */
  async search(query: string, options: { page?: number } = {}): Promise<SearchResult> {
    try {
      return await this.tmdbService.search(query, { page: options.page });
    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get movie details
   */
  async getMovieDetails(
    movieId: number,
    options: { language?: string } = {}
  ): Promise<MediaDetails> {
    try {
      const movie = await this.tmdbService.getMovieDetails(movieId, options);

      // Ensure we have valid data
      if (!movie || !movie.id) {
        throw new NotFoundException({
          code: ERROR_CODES.NOT_FOUND,
          message: `Movie with ID ${movieId} not found`,
        });
      }

      return movie;
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException({
          code: ERROR_CODES.NOT_FOUND,
          message: `Movie with ID ${movieId} not found`,
        });
      }
      this.logger.error(`Failed to get movie details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get TV show details
   */
  async getTvDetails(tvId: number, options: { language?: string } = {}): Promise<MediaDetails> {
    try {
      const tv = await this.tmdbService.getTvDetails(tvId, options);

      if (!tv || !tv.id) {
        throw new NotFoundException({
          code: ERROR_CODES.NOT_FOUND,
          message: `TV show with ID ${tvId} not found`,
        });
      }

      return tv;
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException({
          code: ERROR_CODES.NOT_FOUND,
          message: `TV show with ID ${tvId} not found`,
        });
      }
      this.logger.error(`Failed to get TV details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get popular movies
   */
  async getPopularMovies(options: { page?: number; region?: string } = {}): Promise<SearchResult> {
    try {
      return await this.tmdbService.getPopularMovies(options);
    } catch (error) {
      this.logger.error(`Failed to get popular movies: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get popular TV shows
   */
  async getPopularTv(options: { page?: number } = {}): Promise<SearchResult> {
    try {
      return await this.tmdbService.getPopularTv(options);
    } catch (error) {
      this.logger.error(`Failed to get popular TV: ${error.message}`);
      throw error;
    }
  }
}

