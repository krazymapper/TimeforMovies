import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Transform Interceptor
 * 
 * Wraps all successful responses in a standardized format.
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // If data already has a success field, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Wrap in standard response format
        return {
          success: true,
          data,
        };
      })
    );
  }
}

