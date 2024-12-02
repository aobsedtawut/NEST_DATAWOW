import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Comment, Prisma } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async comment(
    commentWhereUniqueInput: Prisma.CommentWhereUniqueInput,
  ): Promise<Comment | null> {
    return this.prisma.comment.findUnique({
      where: commentWhereUniqueInput,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async comments(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CommentWhereUniqueInput;
    where?: Prisma.CommentWhereInput;
    orderBy?: Prisma.CommentOrderByWithRelationInput;
  }): Promise<Comment[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.comment.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: {
        postId: postId,
      },
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
  }

  async createComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    const { content, postId, authorId } = createCommentDto;
    return this.prisma.comment.create({
      data: {
        content,
        post: { connect: { id: postId } },
        author: { connect: { id: authorId } },
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
  }

  async updateComment(params: {
    where: Prisma.CommentWhereUniqueInput;
    data: Prisma.CommentUpdateInput;
  }): Promise<Comment> {
    const { where, data } = params;
    return this.prisma.comment.update({
      data,
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteComment(where: Prisma.CommentWhereUniqueInput): Promise<Comment> {
    return this.prisma.comment.delete({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
