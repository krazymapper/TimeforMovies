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
   * Get watch providers for a movie/TV show by TMDB ID
   */
  async getWatchProviders(
    tmdbId: number,
    mediaType: 'movie' | 'tv',
    region?: string
  ): Promise<WatchProvider[]> {
    try {
      // Watchmode uses their own ID system, but we can search by title
      // For production, you'd want to maintain a mapping between TMDB IDs and Watchmode IDs
      // This is a simplified version

      // Map Watchmode source types to our types
      const typeMap: Record<string, 'flatrate' | 'rent' | 'buy' | 'ads' | 'free'> = {
        subscription: 'flatrate',
        rental: 'rent',
        purchase: 'buy',
        ads: 'ads',
        free: 'free',
      };

      // In a real implementation, you'd fetch from Watchmode API
      // For now, return empty array (will be supplemented by TMDB watch providers)
      return [];

      // Example structure if Watchmode API was called:
      // const response = await this.httpClient.get<WatchmodeTitleResponse>(`/title/${watchmodeId}/sources/`);
      // return response.source_data
      //   .filter((source) => !region || source.region === region)
      //   .map((source) => ({
      //     providerId: source.source_id,
      //     providerName: source.name,
      //     logoPath: null, // Watchmode doesn't provide logo paths directly
      //     displayPriority: 0,
      //     type: typeMap[source.type] || 'flatrate',
      //     link: source.web_url || source.ios_url || source.android_url,
      //     price: source.price,
      //   }));
    } catch (error) {
      this.logger.error(`Failed to get watch providers from Watchmode: ${error.message}`);
      // Return empty array on error - don't fail the entire request
      return [];
    }
  }
}

