import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { IsString, IsBoolean, IsOptional, IsNumber, IsEnum, MinLength, MaxLength, IsInt, Min } from 'class-validator';

class CreateListDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

class AddListItemDto {
  @IsNumber()
  @IsInt()
  @Min(1)
  mediaId: number;

  @IsEnum(['movie', 'tv'])
  mediaType: 'movie' | 'tv';
}

/**
 * Lists Controller
 * 
 * Handles user-created lists (Watchlist, Custom lists, etc.).
 */
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get(':userId')
  async getUserLists(@Param('userId') userId: string) {
    return this.listsService.getUserLists(userId);
  }

  @Get(':userId/:listId')
  async getList(@Param('userId') userId: string, @Param('listId') listId: string) {
    return this.listsService.getList(userId, listId);
  }

  @Post(':userId')
  async createList(@Param('userId') userId: string, @Body() dto: CreateListDto) {
    return this.listsService.createList(userId, dto);
  }

  @Put(':userId/:listId')
  async updateList(
    @Param('userId') userId: string,
    @Param('listId') listId: string,
    @Body() dto: Partial<CreateListDto>
  ) {
    return this.listsService.updateList(userId, listId, dto);
  }

  @Delete(':userId/:listId')
  async deleteList(@Param('userId') userId: string, @Param('listId') listId: string) {
    return this.listsService.deleteList(userId, listId);
  }

  @Post(':userId/:listId/items')
  async addListItem(
    @Param('userId') userId: string,
    @Param('listId') listId: string,
    @Body() dto: AddListItemDto
  ) {
    return this.listsService.addListItem(userId, listId, dto.mediaId, dto.mediaType);
  }

  @Delete(':userId/:listId/items/:mediaId/:mediaType')
  async removeListItem(
    @Param('userId') userId: string,
    @Param('listId') listId: string,
    @Param('mediaId', ParseIntPipe) mediaId: number,
    @Param('mediaType') mediaType: 'movie' | 'tv'
  ) {
    return this.listsService.removeListItem(userId, listId, mediaId, mediaType);
  }
}

