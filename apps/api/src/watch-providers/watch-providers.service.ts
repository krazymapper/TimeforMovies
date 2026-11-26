import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TmdbService } from '../services/tmdb/tmdb.service';
import { WatchmodeService } from '../services/watchmode/watchmode.service';
import type { WatchProvider } from '@movtime/types';
import { CacheTTL } from '../common/decorators/cache.decorator';
import { CACHE_CONFIG, API_CONFIG } from '@movtime/config';
import { HttpClient } from '../common/utils/http-client.util';

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
export class WatchProvidersService implements OnModuleInit {
  private readonly logger = new Logger(WatchProvidersService.name);
  private tmdbHttp: HttpClient;

  constructor(
    private configService: ConfigService,
    private tmdbService: TmdbService,
    private watchmodeService: WatchmodeService
  ) {}

  onModuleInit() {
    const baseUrl = this.configService.get('TMDB_API_URL') ?? API_CONFIG.TMDB.BASE_URL;
    const apiKey = this.configService.get('TMDB_API_KEY') ?? API_CONFIG.TMDB.API_KEY;
    this.tmdbHttp = new HttpClient(
      baseUrl,
      { Authorization: `Bearer ${apiKey}` },
      this.logger
    );
  }

  /**
   * Get watch providers for a movie
   */
  @CacheTTL(CACHE_CONFIG.PROVIDERS_TTL)
  async getMovieProviders(movieId: number, country: string = 'FR'): Promise<WatchProvider[]> {
    try {
      // Get from TMDB (primary source)
      const tmdbProviders = await this.getTmdbProviders(movieId, 'movie', country);

      // Merge with Watchmode if available (optional enhancement)
      const watchmodeProviders = await this.watchmodeService.getWatchProviders(
        movieId,
        'movie',
        country
      );

      return this.deduplicateProviders([...tmdbProviders, ...watchmodeProviders]);
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
      const watchmodeProviders = await this.watchmodeService.getWatchProviders(tvId, 'tv', country);
      return this.deduplicateProviders([...tmdbProviders, ...watchmodeProviders]);
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
    const response = await this.tmdbHttp.get<TMDBWatchProvidersResponse>(
      `/${mediaType}/${id}/watch/providers`
    );
    const countryData = response.results?.[country.toUpperCase()];
    if (!countryData) return [];

    const mapBucket = (bucket: keyof typeof countryData, type: WatchProvider['type']) =>
      (countryData[bucket] as any[] ?? []).map((p: any) => ({
        providerId: p.provider_id,
        providerName: p.provider_name,
        logoPath: p.logo_path as string,
        displayPriority: p.display_priority as number,
        type,
        link: countryData.link as string,
      }));

    return [
      ...mapBucket('flatrate', 'flatrate'),
      ...mapBucket('rent', 'rent'),
      ...mapBucket('buy', 'buy'),
      ...mapBucket('ads', 'ads'),
      ...mapBucket('free', 'free'),
    ];
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

