import { SetMetadata } from '@nestjs/common';

export const CACHE_TTL_KEY = 'cache_ttl';
export const CACHE_KEY_KEY = 'cache_key';

/**
 * Cache Decorator
 * 
 * Marks a route handler for caching with optional TTL and key.
 * 
 * @param ttl - Time to live in seconds (default: 3600)
 * @param key - Custom cache key (optional)
 */
export const CacheTTL = (ttl: number, key?: string) => {
  const decorators = [SetMetadata(CACHE_TTL_KEY, ttl)];
  if (key) {
    decorators.push(SetMetadata(CACHE_KEY_KEY, key));
  }
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    decorators.forEach((decorator) => decorator(target, propertyKey, descriptor));
  };
};

