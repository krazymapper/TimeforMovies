import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClient } from '../../common/utils/http-client.util';
import { API_CONFIG, CACHE_CONFIG } from '@movtime/config';
import type {
  MediaItem,
  MediaDetails,
  Cast,
  Crew,
  Trailer,
  Genre,
  SearchResult,
} from '@movtime/types';

interface TMDBMovieResponse {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  budget?: number;
  revenue?: number;
  status?: string;
  tagline?: string;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }>;
  spoken_languages?: Array<{ iso_639_1: string; name: string; english_name: string }>;
  origin_country?: string[];
  belongs_to_collection?: { id: number; name: string };
}

interface TMDBSeriesResponse {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date?: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }>;
  spoken_languages?: Array<{ iso_639_1: string; name: string; english_name: string }>;
  origin_country?: string[];
}

interface TMDBCreditsResponse {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }>;
  crew: Array<{
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }>;
}

interface TMDBSearchResponse {
  page: number;
  results: Array<TMDBMovieResponse | TMDBSeriesResponse>;
  total_results: number;
  total_pages: number;
}

interface TMDBSimilarResponse {
  page: number;
  results: Array<TMDBMovieResponse | TMDBSeriesResponse>;
}

interface TMDBSimilarResponse {
  page: number;
  results: Array<TMDBMovieResponse | TMDBSeriesResponse>;
}

/**
 * TMDB Service
 * 
 * Handles all interactions with The Movie Database (TMDB) API.
 * Includes retry logic, error handling, and response transformation.
 */
@Injectable()
export class TmdbService implements OnModuleInit {
  private readonly logger = new Logger(TmdbService.name);
  private httpClient: HttpClient;
  private apiKey: string;
  private baseUrl: string;
  private imageBaseUrl: string;
  private language: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TMDB_API_KEY') || API_CONFIG.TMDB.API_KEY;
    this.baseUrl = this.configService.get<string>('TMDB_API_URL') || API_CONFIG.TMDB.BASE_URL;
    this.imageBaseUrl = API_CONFIG.TMDB.IMAGE_BASE_URL;
    this.language = API_CONFIG.TMDB.DEFAULT_LANGUAGE;

    if (!this.apiKey) {
      this.logger.warn('TMDB_API_KEY is not set. TMDB features will not work.');
    }
  }

  onModuleInit() {
    this.httpClient = new HttpClient(
      this.baseUrl,
      {
        Authorization: `Bearer ${this.apiKey}`,
      },
      this.logger
    );
  }

  /**
   * Search for movies and TV shows
   */
  async search(
    query: string,
    options: {
      page?: number;
      language?: string;
      includeAdult?: boolean;
      region?: string;
    } = {}
  ): Promise<SearchResult> {
    const { page = 1, language = this.language, includeAdult = false, region } = options;

    try {
      // Search movies
      const moviesResponse = await this.httpClient.get<TMDBSearchResponse>(
        '/search/movie',
        {
          params: {
            query,
            page,
            language,
            include_adult: includeAdult,
            region,
          },
        }
      );

      // Search TV shows
      const tvResponse = await this.httpClient.get<TMDBSearchResponse>('/search/tv', {
        params: {
          query,
          page,
          language,
          include_adult: includeAdult,
        },
      });

      // Merge results
      const allResults = [
        ...moviesResponse.results.map((item) => this.transformToMediaItem(item, 'movie')),
        ...tvResponse.results.map((item) => this.transformToMediaItem(item, 'tv')),
      ];

      return {
        items: allResults,
        totalResults: moviesResponse.total_results + tvResponse.total_results,
        page,
        totalPages: Math.max(moviesResponse.total_pages, tvResponse.total_pages),
      };
    } catch (error) {
      this.logger.error(`Failed to search TMDB: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get movie details
   */
  async getMovieDetails(
    movieId: number,
    options: { language?: string; appendToResponse?: string } = {}
  ): Promise<MediaDetails> {
    const { language = this.language, appendToResponse = 'credits,videos,similar,recommendations' } =
      options;

    try {
      const [movie, credits, videos, similar, recommendations] = await Promise.all([
        this.httpClient.get<TMDBMovieResponse>(`/movie/${movieId}`, {
          params: { language },
        }),
        this.httpClient.get<TMDBCreditsResponse>(`/movie/${movieId}/credits`, {
          params: { language },
        }),
        this.httpClient.get<{ results: Array<{ key: string; name: string; site: string; type: string; official: boolean }> }>(
          `/movie/${movieId}/videos`,
          {
            params: { language },
          }
        ),
        this.httpClient.get<TMDBSimilarResponse>(`/movie/${movieId}/similar`, {
          params: { language, page: 1 },
        }),
        this.httpClient.get<TMDBSimilarResponse>(`/movie/${movieId}/recommendations`, {
          params: { language, page: 1 },
        }),
      ]);

      return this.transformToMediaDetails(movie, 'movie', {
        credits,
        videos: videos.results,
        similar: similar.results,
        recommendations: recommendations.results,
      });
    } catch (error) {
      this.logger.error(`Failed to get movie details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get TV show details
   */
  async getTvDetails(
    tvId: number,
    options: { language?: string } = {}
  ): Promise<MediaDetails> {
    const { language = this.language } = options;

    try {
      const [tv, credits, videos, similar, recommendations] = await Promise.all([
        this.httpClient.get<TMDBSeriesResponse>(`/tv/${tvId}`, {
          params: { language },
        }),
        this.httpClient.get<TMDBCreditsResponse>(`/tv/${tvId}/credits`, {
          params: { language },
        }),
        this.httpClient.get<{ results: Array<{ key: string; name: string; site: string; type: string; official: boolean }> }>(
          `/tv/${tvId}/videos`,
          {
            params: { language },
          }
        ),
        this.httpClient.get<TMDBSimilarResponse>(`/tv/${tvId}/similar`, {
          params: { language, page: 1 },
        }),
        this.httpClient.get<TMDBSimilarResponse>(`/tv/${tvId}/recommendations`, {
          params: { language, page: 1 },
        }),
      ]);

      return this.transformToMediaDetails(tv, 'tv', {
        credits,
        videos: videos.results,
        similar: similar.results,
        recommendations: recommendations.results,
      });
    } catch (error) {
      this.logger.error(`Failed to get TV details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get popular movies
   */
  async getPopularMovies(options: { page?: number; language?: string; region?: string } = {}): Promise<SearchResult> {
    const { page = 1, language = this.language, region } = options;

    try {
      const response = await this.httpClient.get<TMDBSearchResponse>('/movie/popular', {
        params: { page, language, region },
      });

      return {
        items: response.results.map((item) => this.transformToMediaItem(item, 'movie')),
        totalResults: response.total_results,
        page: response.page,
        totalPages: response.total_pages,
      };
    } catch (error) {
      this.logger.error(`Failed to get popular movies: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get popular TV shows
   */
  async getPopularTv(options: { page?: number; language?: string } = {}): Promise<SearchResult> {
    const { page = 1, language = this.language } = options;

    try {
      const response = await this.httpClient.get<TMDBSearchResponse>('/tv/popular', {
        params: { page, language },
      });

      return {
        items: response.results.map((item) => this.transformToMediaItem(item, 'tv')),
        totalResults: response.total_results,
        page: response.page,
        totalPages: response.total_pages,
      };
    } catch (error) {
      this.logger.error(`Failed to get popular TV: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get image URL
   */
  getImageUrl(path: string | null | undefined, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!path) {
      return null;
    }
    return `${this.imageBaseUrl}/${size}${path}`;
  }

  /**
   * Transform TMDB response to MediaItem
   */
  private transformToMediaItem(
    item: TMDBMovieResponse | TMDBSeriesResponse,
    mediaType: 'movie' | 'tv'
  ): MediaItem {
    const isMovie = mediaType === 'movie';
    const movieItem = item as TMDBMovieResponse;
    const tvItem = item as TMDBSeriesResponse;

    return {
      id: item.id,
      title: isMovie ? movieItem.title : tvItem.name,
      originalTitle: isMovie ? movieItem.original_title : tvItem.original_name,
      overview: item.overview,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      releaseDate: isMovie ? movieItem.release_date : tvItem.first_air_date,
      mediaType,
      popularity: item.popularity,
      voteAverage: item.vote_average,
      voteCount: item.vote_count,
      genres: item.genres?.map((g) => ({ id: g.id, name: g.name })),
      runtime: isMovie ? movieItem.runtime : undefined,
      numberOfSeasons: !isMovie ? tvItem.number_of_seasons : undefined,
      numberOfEpisodes: !isMovie ? tvItem.number_of_episodes : undefined,
      firstAirDate: !isMovie ? tvItem.first_air_date : undefined,
      lastAirDate: !isMovie ? tvItem.last_air_date : undefined,
    };
  }

  /**
   * Transform TMDB response to MediaDetails
   */
  private transformToMediaDetails(
    item: TMDBMovieResponse | TMDBSeriesResponse,
    mediaType: 'movie' | 'tv',
    additional: {
      credits: TMDBCreditsResponse;
      videos: Array<{ key: string; name: string; site: string; type: string; official: boolean }>;
      similar: Array<TMDBMovieResponse | TMDBSeriesResponse>;
      recommendations: Array<TMDBMovieResponse | TMDBSeriesResponse>;
    }
  ): MediaDetails {
    const base = this.transformToMediaItem(item, mediaType);
    const isMovie = mediaType === 'movie';
    const movieItem = item as TMDBMovieResponse;
    const tvItem = item as TMDBSeriesResponse;

    // Find official trailer
    const trailerVideo = additional.videos.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
    ) || additional.videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer');

    return {
      ...base,
      cast: additional.credits.cast.map((c) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profilePath: c.profile_path,
        order: c.order,
      })),
      crew: additional.credits.crew.map((c) => ({
        id: c.id,
        name: c.name,
        job: c.job,
        department: c.department,
        profilePath: c.profile_path,
      })),
      trailer: trailerVideo
        ? {
            id: trailerVideo.key,
            key: trailerVideo.key,
            name: trailerVideo.name,
            site: trailerVideo.site,
            type: trailerVideo.type,
            official: trailerVideo.official,
          }
        : undefined,
      watchProviders: [], // Will be populated by WatchProvidersService
      similar: additional.similar.map((item) =>
        this.transformToMediaItem(item, item.release_date ? 'movie' : 'tv')
      ),
      recommendations: additional.recommendations.map((item) =>
        this.transformToMediaItem(item, item.release_date ? 'movie' : 'tv')
      ),
      productionCompanies: item.production_companies?.map((pc) => ({
        id: pc.id,
        name: pc.name,
        logoPath: pc.logo_path,
        originCountry: pc.origin_country,
      })),
      budget: isMovie ? movieItem.budget : undefined,
      revenue: isMovie ? movieItem.revenue : undefined,
      status: item.status || 'unknown',
      tagline: item.tagline,
      spokenLanguages: item.spoken_languages || [],
      originCountry: item.origin_country,
    };
  }
}

