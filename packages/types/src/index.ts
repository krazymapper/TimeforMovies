// Movie/TV Show types
export interface MediaItem {
  id: number;
  title: string;
  originalTitle?: string;
  overview: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  mediaType: 'movie' | 'tv';
  popularity: number;
  voteAverage: number;
  voteCount: number;
  genres?: Genre[];
  runtime?: number; // minutes
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  firstAirDate?: string;
  lastAirDate?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character?: string;
  profilePath?: string;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profilePath?: string;
}

export interface MediaDetails extends MediaItem {
  cast: Cast[];
  crew: Crew[];
  trailer?: Trailer;
  watchProviders: WatchProvider[];
  similar: MediaItem[];
  recommendations: MediaItem[];
  productionCompanies: ProductionCompany[];
  budget?: number;
  revenue?: number;
  status: string;
  tagline?: string;
  spokenLanguages: Language[];
  originCountry?: string[];
}

export interface Trailer {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface WatchProvider {
  providerId: number;
  providerName: string;
  logoPath: string;
  displayPriority: number;
  type: 'flatrate' | 'rent' | 'buy' | 'ads' | 'free';
  link?: string;
  price?: number;
  currency?: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logoPath?: string;
  originCountry: string;
}

export interface Language {
  iso_639_1: string;
  name: string;
  englishName: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  createdAt: Date;
  media?: MediaItem;
}

export interface List {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  items: ListItem[];
}

export interface ListItem {
  id: string;
  listId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  addedAt: Date;
  media?: MediaItem;
}

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  mediaType?: 'movie' | 'tv';
  country?: string;
  createdAt: Date;
}

// Search types
export interface SearchResult {
  items: MediaItem[];
  totalResults: number;
  page: number;
  totalPages: number;
}

export interface SearchFilters {
  query?: string;
  mediaType?: 'movie' | 'tv' | 'all';
  genre?: number;
  year?: number;
  sortBy?: 'popularity' | 'release_date' | 'vote_average' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  country?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Country/Region types
export interface Country {
  code: string;
  name: string;
  flag?: string;
}

// Cache types
export interface CacheOptions {
  ttl?: number; // seconds
  key: string;
  tags?: string[];
}

