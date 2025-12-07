/**
 * API Client for Movtime Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Generic API fetch function with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      const error: ApiError = {
        code: data.error?.code || 'UNKNOWN_ERROR',
        message: data.error?.message || 'An error occurred',
        details: data.error?.details,
      };
      throw error;
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        code: 'NETWORK_ERROR',
        message: error.message,
      } as ApiError;
    }
    throw error;
  }
}

/**
 * Media API
 */
export const mediaApi = {
  search: async (query: string, page: number = 1) => {
    return fetchApi(`/media/search?query=${encodeURIComponent(query)}&page=${page}`);
  },

  getMovie: async (id: number, country: string = 'FR') => {
    return fetchApi(`/media/movie/${id}?country=${country}`);
  },

  getTv: async (id: number, country: string = 'FR') => {
    return fetchApi(`/media/tv/${id}?country=${country}`);
  },

  getPopularMovies: async (page: number = 1, country?: string) => {
    const params = new URLSearchParams({ page: page.toString() });
    if (country) params.append('country', country);
    return fetchApi(`/media/popular/movies?${params.toString()}`);
  },

  getPopularTv: async (page: number = 1) => {
    return fetchApi(`/media/popular/tv?page=${page}`);
  },
};

/**
 * Favorites API
 */
export const favoritesApi = {
  getUserFavorites: async (userId: string) => {
    return fetchApi(`/favorites/${userId}`);
  },

  addFavorite: async (userId: string, mediaId: number, mediaType: 'movie' | 'tv') => {
    return fetchApi(`/favorites/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ mediaId, mediaType }),
    });
  },

  removeFavorite: async (userId: string, mediaId: number, mediaType: 'movie' | 'tv') => {
    return fetchApi(`/favorites/${userId}/${mediaId}/${mediaType}`, {
      method: 'DELETE',
    });
  },

  isFavorite: async (userId: string, mediaId: number, mediaType: 'movie' | 'tv') => {
    return fetchApi(`/favorites/${userId}/check/${mediaId}/${mediaType}`);
  },
};

