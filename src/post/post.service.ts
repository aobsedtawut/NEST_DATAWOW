import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreatePostDto,
  UpdatePostDto,
  CommunityCategory,
} from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    category?: CommunityCategory;
    authorId?: number;
    skip?: number;
    take?: number;
    searchTerm?: string;
  }) {
    const { category, authorId, skip = 0, take = 10, searchTerm } = params;

    const where: Prisma.PostWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (searchTerm) {
      where.OR = [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      posts,
      metadata: {
        total,
        skip,
        take,
      },
    };
  }

  async create(authorId: number, data: CreatePostDto) {
    const postData: Prisma.PostCreateInput = {
      title: data.title,
      content: data.content,
      category: data.category,
      author: {
        connect: { id: authorId },
      },
    };

    return this.prisma.post.create({
      data: postData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async update(id: number, authorId: number, data: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const updateData: Prisma.PostUpdateInput = {
      ...(data.title && { title: data.title }),
      ...(data.content && { content: data.content }),
      ...(data.category && { category: data.category }),
    };

    return this.prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: number, authorId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id },
    });

    return {
      message: 'Post deleted successfully',
    };
  }

  async getPostsByCategory(category: CommunityCategory) {
    return this.prisma.post.findMany({
      where: { category },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getCategoryStats() {
    const stats = await this.prisma.post.groupBy({
      by: ['category'],
      _count: {
        _all: true,
      },
    });

    return stats.map((stat) => ({
      category: stat.category,
      postCount: stat._count._all,
    }));
  }
}
