import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ERROR_CODES } from '@movtime/config';
import type { List, ListItem } from '@movtime/types';

/**
 * Lists Service
 * 
 * Manages user-created lists with proper authorization checks.
 */
@Injectable()
export class ListsService {
  private readonly logger = new Logger(ListsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all lists for a user
   */
  async getUserLists(userId: string): Promise<List[]> {
    const lists = await this.prisma.list.findMany({
      where: { userId },
      include: {
        items: {
          orderBy: { addedAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return lists.map(this.transformList);
  }

  /**
   * Get a specific list
   */
  async getList(userId: string, listId: string): Promise<List> {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: {
        items: {
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    if (!list) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'List not found',
      });
    }

    // Check if user has access (owner or public)
    if (list.userId !== userId && !list.isPublic) {
      throw new ForbiddenException({
        code: ERROR_CODES.FORBIDDEN,
        message: 'Access denied',
      });
    }

    return this.transformList(list);
  }

  /**
   * Create a new list
   */
  async createList(userId: string, data: { name: string; description?: string; isPublic?: boolean }): Promise<List> {
    const list = await this.prisma.list.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        isPublic: data.isPublic || false,
        items: {
          create: [],
        },
      },
      include: {
        items: true,
      },
    });

    return this.transformList(list);
  }

  /**
   * Update a list
   */
  async updateList(
    userId: string,
    listId: string,
    data: Partial<{ name: string; description: string; isPublic: boolean }>
  ): Promise<List> {
    // Verify ownership
    const existing = await this.prisma.list.findUnique({
      where: { id: listId },
    });

    if (!existing) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'List not found',
      });
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException({
        code: ERROR_CODES.FORBIDDEN,
        message: 'Access denied',
      });
    }

    const list = await this.prisma.list.update({
      where: { id: listId },
      data,
      include: {
        items: {
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    return this.transformList(list);
  }

  /**
   * Delete a list
   */
  async deleteList(userId: string, listId: string): Promise<void> {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'List not found',
      });
    }

    if (list.userId !== userId) {
      throw new ForbiddenException({
        code: ERROR_CODES.FORBIDDEN,
        message: 'Access denied',
      });
    }

    await this.prisma.list.delete({
      where: { id: listId },
    });
  }

  /**
   * Add item to list
   */
  async addListItem(userId: string, listId: string, mediaId: number, mediaType: 'movie' | 'tv'): Promise<ListItem> {
    // Verify ownership
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'List not found',
      });
    }

    if (list.userId !== userId) {
      throw new ForbiddenException({
        code: ERROR_CODES.FORBIDDEN,
        message: 'Access denied',
      });
    }

    try {
      const item = await this.prisma.listItem.create({
        data: {
          listId,
          mediaId,
          mediaType,
        },
      });

      return {
        id: item.id,
        listId: item.listId,
        mediaId: item.mediaId,
        mediaType: item.mediaType as 'movie' | 'tv',
        addedAt: item.addedAt,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Item already in list');
      }
      throw error;
    }
  }

  /**
   * Remove item from list
   */
  async removeListItem(userId: string, listId: string, mediaId: number, mediaType: 'movie' | 'tv'): Promise<void> {
    // Verify ownership
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'List not found',
      });
    }

    if (list.userId !== userId) {
      throw new ForbiddenException({
        code: ERROR_CODES.FORBIDDEN,
        message: 'Access denied',
      });
    }

    const item = await this.prisma.listItem.findUnique({
      where: {
        listId_mediaId_mediaType: {
          listId,
          mediaId,
          mediaType,
        },
      },
    });

    if (!item) {
      throw new NotFoundException({
        code: ERROR_CODES.NOT_FOUND,
        message: 'Item not found in list',
      });
    }

    await this.prisma.listItem.delete({
      where: { id: item.id },
    });
  }

  /**
   * Transform Prisma list to API format
   */
  private transformList(list: any): List {
    return {
      id: list.id,
      userId: list.userId,
      name: list.name,
      description: list.description,
      isPublic: list.isPublic,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      items: list.items.map((item: any) => ({
        id: item.id,
        listId: item.listId,
        mediaId: item.mediaId,
        mediaType: item.mediaType as 'movie' | 'tv',
        addedAt: item.addedAt,
      })),
    };
  }
}

