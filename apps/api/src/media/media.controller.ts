import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { WatchProvidersService } from '../watch-providers/watch-providers.service';
import { CacheTTL } from '../common/decorators/cache.decorator';
import { CACHE_CONFIG } from '@movtime/config';
// Simple query DTO - validation handled at service level
interface GetMediaQueryDto {
  country?: string;
  language?: string;
}

/**
 * Media Controller
 * 
 * Handles HTTP requests for movie and TV show data.
 * Includes caching, validation, and error handling.
 */
@Controller('media')
@UseInterceptors(CacheInterceptor)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly watchProvidersService: WatchProvidersService
  ) {}

  @Get('search')
  async search(@Query('query') query: string, @Query('page') page?: number) {
    if (!query) {
      throw new Error('Query parameter is required');
    }
    return this.mediaService.search(query, { page: page || 1 });
  }

  @Get('movie/:id')
  @CacheTTL(CACHE_CONFIG.DEFAULT_TTL)
  async getMovie(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetMediaQueryDto
  ) {
    const movie = await this.mediaService.getMovieDetails(id, {
      language: query.language,
    });

    // Get watch providers
    const providers = await this.watchProvidersService.getMovieProviders(
      id,
      query.country
    );
    movie.watchProviders = providers;

    return movie;
  }

  @Get('tv/:id')
  @CacheTTL(CACHE_CONFIG.DEFAULT_TTL)
  async getTv(@Param('id', ParseIntPipe) id: number, @Query() query: GetMediaQueryDto) {
    const tv = await this.mediaService.getTvDetails(id, {
      language: query.language,
    });

    // Get watch providers
    const providers = await this.watchProvidersService.getTvProviders(
      id,
      query.country
    );
    tv.watchProviders = providers;

    return tv;
  }

  @Get('popular/movies')
  @CacheTTL(CACHE_CONFIG.POPULAR_TTL)
  async getPopularMovies(
    @Query('page') page?: number,
    @Query('country') country?: string
  ) {
    return this.mediaService.getPopularMovies({
      page: page || 1,
      region: country,
    });
  }

  @Get('popular/tv')
  @CacheTTL(CACHE_CONFIG.POPULAR_TTL)
  async getPopularTv(@Query('page') page?: number) {
    return this.mediaService.getPopularTv({ page: page || 1 });
  }
}

