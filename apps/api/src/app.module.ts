import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MediaModule } from './media/media.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ListsModule } from './lists/lists.module';
import { SearchModule } from './search/search.module';
import { WatchProvidersModule } from './watch-providers/watch-providers.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    // Configuration module with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    // Redis cache (with fallback to in-memory)
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
          return {
            store: redisStore,
            url: redisUrl,
            ttl: 3600, // default 1 hour
          };
        }
        // Fallback to in-memory cache if Redis is not available
        return {
          ttl: 3600,
          max: 100,
        };
      },
    }),
    // Sentry (optional, only if DSN is provided)
    ...(process.env.SENTRY_DSN
      ? [
          SentryModule.forRoot({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.SENTRY_ENVIRONMENT || 'development',
            tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
          }),
        ]
      : []),
    // Application modules
    PrismaModule,
    MediaModule,
    FavoritesModule,
    ListsModule,
    SearchModule,
    WatchProvidersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}

