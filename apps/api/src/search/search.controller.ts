import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UserEndpointsGuard } from '../common/guards/user-endpoints.guard';
import { SearchService } from './search.service';
import { IsString, IsEnum, IsOptional, MinLength, Length } from 'class-validator';

class SaveSearchDto {
  @IsString()
  @MinLength(1)
  query: string;

  @IsEnum(['movie', 'tv'])
  @IsOptional()
  mediaType?: 'movie' | 'tv';

  @IsString()
  @Length(2, 2)
  @IsOptional()
  country?: string;
}

/**
 * Search Controller
 * 
 * Handles search functionality and search history.
 */
@Controller('search')
@UseGuards(UserEndpointsGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('history/:userId')
  async getSearchHistory(@Param('userId') userId: string) {
    return this.searchService.getSearchHistory(userId);
  }

  @Post('history/:userId')
  async saveSearch(@Param('userId') userId: string, @Body() dto: SaveSearchDto) {
    return this.searchService.saveSearch(userId, dto);
  }

  @Delete('history/:userId/:searchId')
  async deleteSearchHistory(
    @Param('userId') userId: string,
    @Param('searchId') searchId: string
  ) {
    return this.searchService.deleteSearchHistory(userId, searchId);
  }

  @Delete('history/:userId')
  async clearSearchHistory(@Param('userId') userId: string) {
    return this.searchService.clearSearchHistory(userId);
  }
}

