import { Logger } from '@nestjs/common';
import { RETRY_CONFIG } from '@movtime/config';

/**
 * Retry utility with exponential backoff
 * 
 * Handles transient failures with exponential backoff strategy.
 * Useful for external API calls that might fail temporarily.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    logger?: Logger;
  }
): Promise<T> {
  const {
    maxAttempts = RETRY_CONFIG.MAX_ATTEMPTS,
    initialDelay = RETRY_CONFIG.INITIAL_DELAY,
    maxDelay = RETRY_CONFIG.MAX_DELAY,
    backoffFactor = RETRY_CONFIG.BACKOFF_FACTOR,
    logger,
  } = options || {};

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        break;
      }

      if (logger) {
        logger.warn(
          `Attempt ${attempt}/${maxAttempts} failed: ${error.message}. Retrying in ${delay}ms...`
        );
      }

      await sleep(delay);
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

