import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { IsNumber, IsEnum, IsInt, Min } from 'class-validator';

class AddFavoriteDto {
  @IsNumber()
  @IsInt()
  @Min(1)
  mediaId: number;

  @IsEnum(['movie', 'tv'])
  mediaType: 'movie' | 'tv';
}

/**
 * Favorites Controller
 * 
 * Handles user favorites (requires authentication in production).
 * For now, accepts userId as query parameter for development.
 */
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get(':userId')
  async getUserFavorites(@Param('userId') userId: string) {
    return this.favoritesService.getUserFavorites(userId);
  }

  @Post(':userId')
  async addFavorite(
    @Param('userId') userId: string,
    @Body() dto: AddFavoriteDto
  ) {
    return this.favoritesService.addFavorite(userId, dto.mediaId, dto.mediaType);
  }

  @Delete(':userId/:mediaId/:mediaType')
  async removeFavorite(
    @Param('userId') userId: string,
    @Param('mediaId', ParseIntPipe) mediaId: number,
    @Param('mediaType') mediaType: 'movie' | 'tv'
  ) {
    return this.favoritesService.removeFavorite(userId, mediaId, mediaType);
  }

  @Get(':userId/check/:mediaId/:mediaType')
  async isFavorite(
    @Param('userId') userId: string,
    @Param('mediaId', ParseIntPipe) mediaId: number,
    @Param('mediaType') mediaType: 'movie' | 'tv'
  ) {
    return this.favoritesService.isFavorite(userId, mediaId, mediaType);
  }
}

