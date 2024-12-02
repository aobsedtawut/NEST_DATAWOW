import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../prisma/prisma.service';
import { Comment, Prisma } from '@prisma/client';

describe('CommentsService', () => {
  let service: CommentsService;
  let prismaService: PrismaService;

  const mockComment = {
    id: 1,
    content: 'Test comment',
    postId: 1,
    authorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: 1,
      name: 'John Doe',
    },
  };

  const mockPrismaService = {
    comment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('comment', () => {
    it('should find a unique comment', async () => {
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);

      const result = await service.comment({ id: 1 });

      expect(result).toEqual(mockComment);
      expect(mockPrismaService.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe('comments', () => {
    it('should find many comments with filters', async () => {
      const params = {
        skip: 0,
        take: 10,
        where: { postId: 1 },
        orderBy: { createdAt: 'desc' as const },
      };

      mockPrismaService.comment.findMany.mockResolvedValue([mockComment]);

      const result = await service.comments(params);

      expect(result).toEqual([mockComment]);
      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        ...params,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe('getCommentsByPostId', () => {
    it('should find comments by post id', async () => {
      mockPrismaService.comment.findMany.mockResolvedValue([mockComment]);

      const result = await service.getCommentsByPostId(1);

      expect(result).toEqual([mockComment]);
      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        where: { postId: 1 },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const createDto = {
        content: 'Test comment',
        postId: 1,
        authorId: 1,
      };

      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const result = await service.createComment(createDto);

      expect(result).toEqual(mockComment);
      expect(mockPrismaService.comment.create).toHaveBeenCalledWith({
        data: {
          content: createDto.content,
          post: { connect: { id: createDto.postId } },
          author: { connect: { id: createDto.authorId } },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe('updateComment', () => {
    it('should update a comment', async () => {
      const params = {
        where: { id: 1 },
        data: { content: 'Updated content' },
      };

      mockPrismaService.comment.update.mockResolvedValue({
        ...mockComment,
        content: 'Updated content',
      });

      const result = await service.updateComment(params);

      expect(result.content).toBe('Updated content');
      expect(mockPrismaService.comment.update).toHaveBeenCalledWith({
        where: params.where,
        data: params.data,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      mockPrismaService.comment.delete.mockResolvedValue(mockComment);

      const result = await service.deleteComment({ id: 1 });

      expect(result).toEqual(mockComment);
      expect(mockPrismaService.comment.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  });
});
