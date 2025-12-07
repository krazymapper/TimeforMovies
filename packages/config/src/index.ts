// API Configuration
export const API_CONFIG = {
  TMDB: {
    BASE_URL: process.env.TMDB_API_URL || 'https://api.themoviedb.org/3',
    API_KEY: process.env.TMDB_API_KEY || '',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    DEFAULT_LANGUAGE: 'fr-FR',
    RATE_LIMIT: {
      requestsPerSecond: 40,
      requestsPer10Seconds: 400,
    },
  },
  WATCHMODE: {
    BASE_URL: process.env.WATCHMODE_API_URL || 'https://api.watchmode.com/v1',
    API_KEY: process.env.WATCHMODE_API_KEY || '',
    RATE_LIMIT: {
      requestsPerSecond: 10,
      requestsPerMinute: 600,
    },
  },
  MEILISEARCH: {
    HOST: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
    API_KEY: process.env.MEILISEARCH_MASTER_KEY || '',
    INDEXES: {
      MOVIES: 'movies',
      TV_SHOWS: 'tv_shows',
      PEOPLE: 'people',
    },
  },
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 3600, // 1 hour
  POPULAR_TTL: 1800, // 30 minutes (more popular = shorter cache)
  UNPOPULAR_TTL: 7200, // 2 hours
  SEARCH_TTL: 600, // 10 minutes
  PROVIDERS_TTL: 86400, // 24 hours (watch providers change less frequently)
} as const;

// Redis Configuration
export const REDIS_CONFIG = {
  URL: process.env.REDIS_URL || '',
  TTL: CACHE_CONFIG.DEFAULT_TTL,
} as const;

// Database Configuration
export const DB_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  CONNECTION_TIMEOUT: 30000, // 30 seconds
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// Countries supported (ISO 3166-1 alpha-2)
export const SUPPORTED_COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'AU', name: 'Australia' },
] as const;

// Media Types
export const MEDIA_TYPES = {
  MOVIE: 'movie',
  TV: 'tv',
} as const;

// Error Codes
export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000, // ms
  MAX_DELAY: 10000, // ms
  BACKOFF_FACTOR: 2,
} as const;

