import { Module } from '@nestjs/common';
import { WatchProvidersService } from './watch-providers.service';
import { TmdbModule } from '../services/tmdb/tmdb.module';
import { WatchmodeModule } from '../services/watchmode/watchmode.module';

@Module({
  imports: [TmdbModule, WatchmodeModule],
  providers: [WatchProvidersService],
  exports: [WatchProvidersService],
})
export class WatchProvidersModule {}

