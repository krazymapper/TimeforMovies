import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CACHE_TTL_KEY, CACHE_KEY_KEY } from '../decorators/cache.decorator';

/**
 * Cache Interceptor
 * 
 * Implements intelligent caching based on decorators.
 * Respects cache TTL and keys defined via decorators.
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.reflector.get<string>(CACHE_KEY_KEY, context.getHandler());
    const cacheTTL = this.reflector.get<number>(CACHE_TTL_KEY, context.getHandler());

    // If no cache decorator, skip caching
    if (!cacheKey && !cacheTTL) {
      return next.handle();
    }

    // Generate cache key from decorator or request
    const key = cacheKey || this.generateCacheKey(request);

    // Try to get from cache
    const cached = await this.cacheManager.get(key);
    if (cached) {
      return of(cached);
    }

    // If not cached, execute handler and cache response
    return next.handle().pipe(
      tap(async (response) => {
        const ttl = cacheTTL || 3600; // Default 1 hour
        await this.cacheManager.set(key, response, ttl * 1000); // TTL in milliseconds
      })
    );
  }

  private generateCacheKey(request: any): string {
    const { method, url, query, params } = request;
    const queryString = JSON.stringify({ ...query, ...params });
    return `cache:${method}:${url}:${queryString}`;
  }
}

