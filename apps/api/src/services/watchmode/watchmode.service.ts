import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClient } from '../../common/utils/http-client.util';
import { API_CONFIG } from '@movtime/config';
import type { WatchProvider } from '@movtime/types';

interface WatchmodeSource {
  source_id: number;
  name: string;
  type: string;
  region: string;
  ios_url?: string;
  android_url?: string;
  web_url?: string;
  format?: string;
  price?: number;
  seasons?: number;
  episodes?: number;
}

interface WatchmodeTitleResponse {
  id: number;
  title: string;
  source_data: WatchmodeSource[];
}

interface WatchmodeSearchResult {
  id: number;
  title: string;
  tmdb_id?: number;
  tmdb_type?: string;
}

interface WatchmodeSearchResponse {
  title_results: WatchmodeSearchResult[];
}

/**
 * Watchmode Service
 * 
 * Handles all interactions with Watchmode API for streaming provider data.
 * Maps Watchmode sources to our WatchProvider format.
 */
@Injectable()
export class WatchmodeService implements OnModuleInit {
  private readonly logger = new Logger(WatchmodeService.name);
  private httpClient: HttpClient;
  private apiKey: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey =
      this.configService.get<string>('WATCHMODE_API_KEY') || API_CONFIG.WATCHMODE.API_KEY;
    this.baseUrl =
      this.configService.get<string>('WATCHMODE_API_URL') || API_CONFIG.WATCHMODE.BASE_URL;

    if (!this.apiKey) {
      this.logger.warn('WATCHMODE_API_KEY is not set. Watch providers will be limited.');
    }
  }

  onModuleInit() {
    this.httpClient = new HttpClient(
      this.baseUrl,
      {
        'X-API-Key': this.apiKey,
      },
      this.logger
    );
  }

  /**
   * Find Watchmode ID from TMDB ID
   * Uses Watchmode search API with search_field=tmdb_id
   * 
   * Note: Watchmode API requires its own ID system, not TMDB IDs directly.
   * This method performs the mapping before fetching sources.
   */
  private async findWatchmodeId(tmdbId: number, mediaType: 'movie' | 'tv'): Promise<number | null> {
    if (!this.apiKey) {
      this.logger.debug('Watchmode API key not configured, skipping ID lookup');
      return null;
    }

    try {
      const searchResponse = await this.httpClient.get<WatchmodeSearchResponse>('/search/', {
        params: {
          search_field: 'tmdb_id',
          search_value: tmdbId.toString(),
          types: mediaType === 'movie' ? 'movie' : 'tv_series',
        },
      });

      // Validate response structure
      if (!searchResponse || !searchResponse.title_results) {
        this.logger.debug(`Invalid response structure from Watchmode search for TMDB ID ${tmdbId}`);
        return null;
      }

      // Find exact match by TMDB ID and type
      const match = searchResponse.title_results.find(
        (result) => result.tmdb_id === tmdbId && result.tmdb_type === mediaType
      );

      if (match && match.id) {
        this.logger.debug(`Found Watchmode ID ${match.id} for TMDB ID ${tmdbId} (${mediaType})`);
        return match.id;
      }

      // Fallback: take first result if no exact match (with warning)
      if (searchResponse.title_results.length > 0 && searchResponse.title_results[0].id) {
        this.logger.warn(
          `No exact match found for TMDB ID ${tmdbId} (${mediaType}), using first result: ${searchResponse.title_results[0].id}`
        );
        return searchResponse.title_results[0].id;
      }

      this.logger.debug(`No Watchmode results found for TMDB ID ${tmdbId} (${mediaType})`);
      return null;
    } catch (error) {
      // Don't log as error if it's just a "not found" scenario
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        this.logger.debug(`Watchmode ID not found for TMDB ID ${tmdbId} (${mediaType})`);
      } else {
        this.logger.error(`Failed to find Watchmode ID for TMDB ID ${tmdbId}: ${errorMessage}`);
      }
      return null;
    }
  }

  /**
   * Get watch providers for a movie/TV show by TMDB ID
   * First maps TMDB ID to Watchmode ID, then fetches sources
   */
  async getWatchProviders(
    tmdbId: number,
    mediaType: 'movie' | 'tv',
    region?: string
  ): Promise<WatchProvider[]> {
    try {
      // First, find the Watchmode ID corresponding to the TMDB ID
      const watchmodeId = await this.findWatchmodeId(tmdbId, mediaType);

      if (!watchmodeId) {
        this.logger.debug(`No Watchmode ID found for TMDB ID ${tmdbId} (${mediaType})`);
        return [];
      }

      const typeMap: Record<string, 'flatrate' | 'rent' | 'buy' | 'ads' | 'free'> = {
        subscription: 'flatrate',
        rental: 'rent',
        purchase: 'buy',
        ads: 'ads',
        free: 'free',
      };

      const response = await this.httpClient.get<WatchmodeTitleResponse>(
        `/title/${watchmodeId}/sources/`,
        {
          params: region ? { regions: region } : undefined,
        }
      );

      return response.source_data
        .filter((source) => !region || source.region === region)
        .map((source) => ({
          providerId: source.source_id,
          providerName: source.name,
          logoPath: null,
          displayPriority: 0,
          type: typeMap[source.type] || 'flatrate',
          link: source.web_url || source.ios_url || source.android_url,
          price: source.price,
        }));
    } catch (error) {
      this.logger.error(`Failed to get watch providers from Watchmode: ${error.message}`);
      // Return empty array on error - don't fail the entire request
      return [];
    }
  }
}

