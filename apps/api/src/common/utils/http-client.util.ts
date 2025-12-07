import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { Logger } from '@nestjs/common';
import { retryWithBackoff } from './retry.util';

/**
 * HTTP Client Utility
 * 
 * Wrapper around axios with retry logic, error handling, and rate limiting awareness.
 */
export class HttpClient {
  private client: AxiosInstance;
  private logger: Logger;

  constructor(
    baseURL: string,
    defaultHeaders?: Record<string, string>,
    logger?: Logger
  ) {
    this.logger = logger || new Logger(HttpClient.name);
    this.client = axios.create({
      baseURL,
      timeout: 10000, // 10 seconds
      headers: {
        'Content-Type': 'application/json',
        ...defaultHeaders,
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (this.isRetryableError(error)) {
          // Retry logic is handled by retryWithBackoff
          throw error;
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Make a GET request with retry logic
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return retryWithBackoff(
      async () => {
        const response = await this.client.get<T>(url, config);
        return response.data;
      },
      { logger: this.logger }
    );
  }

  /**
   * Make a POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return retryWithBackoff(
      async () => {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
      },
      { logger: this.logger }
    );
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: AxiosError): boolean {
    if (!error.response) {
      // Network error - retry
      return true;
    }

    const status = error.response.status;
    // Retry on 5xx errors and rate limiting (429)
    return status >= 500 || status === 429;
  }

  /**
   * Handle and format errors
   */
  private handleError(error: AxiosError): Error {
    if (error.response) {
      // API responded with error status
      const { status, statusText, data } = error.response;
      const message = `API Error: ${status} ${statusText}`;
      const enhancedError = new Error(message);
      (enhancedError as any).status = status;
      (enhancedError as any).data = data;
      return enhancedError;
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from API. Network error or timeout.');
    } else {
      // Error in request setup
      return new Error(`Request setup error: ${error.message}`);
    }
  }

  getInstance(): AxiosInstance {
    return this.client;
  }
}

