import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { TmdbModule } from '../services/tmdb/tmdb.module';
import { WatchProvidersModule } from '../watch-providers/watch-providers.module';

@Module({
  imports: [TmdbModule, WatchProvidersModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}

