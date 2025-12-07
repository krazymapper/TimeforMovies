import { Module } from '@nestjs/common';
import { WatchmodeService } from './watchmode.service';

@Module({
  providers: [WatchmodeService],
  exports: [WatchmodeService],
})
export class WatchmodeModule {}

