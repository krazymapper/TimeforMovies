import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TmdbService } from '../services/tmdb/tmdb.service';
import { WatchmodeService } from '../services/watchmode/watchmode.service';
import type { WatchProvider } from '@movtime/types';
import { CacheTTL } from '../common/decorators/cache.decorator';
import { CACHE_CONFIG } from '@movtime/config';

interface TMDBWatchProvidersResponse {
  id: number;
  results: {
    [countryCode: string]: {
      link?: string;
      flatrate?: Array<{ logo_path: string; provider_id: number; provider_name: string; display_priority: number }>;
      rent?: Array<{ logo_path: string; provider_id: number; provider_name: string; display_priority: number }>;
      buy?: Array<{ logo_path: string; provider_id: number; provider_name: string; display_priority: number }>;
      ads?: Array<{ logo_path: string; provider_id: number; provider_name: string; display_priority: number }>;
      free?: Array<{ logo_path: string; provider_id: number; provider_name: string; display_priority: number }>;
    };
  };
}

/**
 * Watch Providers Service
 * 
 * Aggregates watch provider data from TMDB and Watchmode APIs.
 * Handles merging data from multiple sources and country-specific filtering.
 */
@Injectable()
export class WatchProvidersService {
  private readonly logger = new Logger(WatchProvidersService.name);
  private httpClient: any;

  constructor(
    private configService: ConfigService,
    private tmdbService: TmdbService,
    private watchmodeService: WatchmodeService
  ) {}

  /**
   * Get watch providers for a movie
   */
  @CacheTTL(CACHE_CONFIG.PROVIDERS_TTL)
  async getMovieProviders(movieId: number, country: string = 'FR'): Promise<WatchProvider[]> {
    try {
      // Get from TMDB (primary source)
      const tmdbProviders = await this.getTmdbProviders(movieId, 'movie', country);

      // Merge with Watchmode if available (optional enhancement)
      // const watchmodeProviders = await this.watchmodeService.getWatchProviders(movieId, 'movie', country);

      return this.deduplicateProviders(tmdbProviders);
    } catch (error) {
      this.logger.error(`Failed to get movie providers: ${error.message}`);
      return [];
    }
  }

  /**
   * Get watch providers for a TV show
   */
  @CacheTTL(CACHE_CONFIG.PROVIDERS_TTL)
  async getTvProviders(tvId: number, country: string = 'FR'): Promise<WatchProvider[]> {
    try {
      const tmdbProviders = await this.getTmdbProviders(tvId, 'tv', country);
      return this.deduplicateProviders(tmdbProviders);
    } catch (error) {
      this.logger.error(`Failed to get TV providers: ${error.message}`);
      return [];
    }
  }

  /**
   * Get providers from TMDB API
   */
  private async getTmdbProviders(
    id: number,
    mediaType: 'movie' | 'tv',
    country: string
  ): Promise<WatchProvider[]> {
    // This would need to call TMDB watch/providers endpoint
    // For now, return empty array - will be implemented when HTTP client is properly set up
    // TMDB endpoint: `/movie/${id}/watch/providers` or `/tv/${id}/watch/providers`

    const providers: WatchProvider[] = [];

    // Example implementation structure:
    // const response = await this.httpClient.get<TMDBWatchProvidersResponse>(
    //   `/${mediaType}/${id}/watch/providers`
    // );
    // const countryData = response.results[country.toUpperCase()];
    // if (countryData) {
    //   if (countryData.flatrate) {
    //     providers.push(...countryData.flatrate.map(p => ({
    //       providerId: p.provider_id,
    //       providerName: p.provider_name,
    //       logoPath: p.logo_path,
    //       displayPriority: p.display_priority,
    //       type: 'flatrate' as const,
    //       link: countryData.link,
    //     })));
    //   }
    //   // Similar for rent, buy, ads, free...
    // }

    return providers;
  }

  /**
   * Deduplicate providers by providerId
   */
  private deduplicateProviders(providers: WatchProvider[]): WatchProvider[] {
    const seen = new Map<number, WatchProvider>();
    for (const provider of providers) {
      const existing = seen.get(provider.providerId);
      if (!existing || provider.displayPriority < existing.displayPriority) {
        seen.set(provider.providerId, provider);
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.displayPriority - b.displayPriority);
  }
}

