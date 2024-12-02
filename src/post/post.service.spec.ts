import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommunityCategory } from './dto/create-post.dto';

describe('PostService', () => {
  let service: PostService;
  let prismaService: PrismaService;

  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'Test Content',
    category: CommunityCategory.FASHION,
    authorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: 1,
      username: 'testuser',
    },
    _count: {
      comments: 0,
    },
  };

  const mockPrismaService = {
    post: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('should return posts with metadata', async () => {
      const params = {
        category: CommunityCategory.FASHION,
        authorId: 1,
        skip: 0,
        take: 10,
        searchTerm: 'test',
      };

      mockPrismaService.post.findMany.mockResolvedValue([mockPost]);
      mockPrismaService.post.count.mockResolvedValue(1);

      const result = await service.findAll(params);

      expect(result).toEqual({
        posts: [mockPost],
        metadata: { total: 1, skip: 0, take: 10 },
      });
    });
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createDto = {
        title: 'Test Post',
        content: 'Test Content',
        category: CommunityCategory.FASHION,
      };

      mockPrismaService.post.create.mockResolvedValue(mockPost);

      const result = await service.create(1, createDto);

      expect(result).toEqual(mockPost);
    });
  });

  describe('findOne', () => {
    it('should find a post by id', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      const result = await service.findOne(1);

      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue({ authorId: 1 });
      mockPrismaService.post.update.mockResolvedValue(mockPost);

      const updateDto = { title: 'Updated Title' };
      const result = await service.update(1, 1, updateDto);

      expect(result).toEqual(mockPost);
    });

    it("should throw ForbiddenException when updating other's post", async () => {
      mockPrismaService.post.findUnique.mockResolvedValue({ authorId: 2 });

      await expect(service.update(1, 1, {})).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue({ authorId: 1 });
      mockPrismaService.post.delete.mockResolvedValue(mockPost);

      const result = await service.remove(1, 1);

      expect(result).toEqual({ message: 'Post deleted successfully' });
    });

    it("should throw ForbiddenException when deleting other's post", async () => {
      mockPrismaService.post.findUnique.mockResolvedValue({ authorId: 2 });

      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getPostsByCategory', () => {
    it('should return posts by category', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([mockPost]);

      const result = await service.getPostsByCategory(
        CommunityCategory.FASHION,
      );

      expect(result).toEqual([mockPost]);
    });
  });

  describe('getCategoryStats', () => {
    it('should return category statistics', async () => {
      const mockStats = [
        {
          category: CommunityCategory.FASHION,
          _count: { _all: 5 },
        },
      ];

      mockPrismaService.post.groupBy.mockResolvedValue(mockStats);

      const result = await service.getCategoryStats();

      expect(result).toEqual([
        {
          category: CommunityCategory.FASHION,
          postCount: 5,
        },
      ]);
    });
  });
});
