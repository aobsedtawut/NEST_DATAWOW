import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { Comment as CommentModel } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('post/:postId')
  @ApiOperation({ summary: 'Get comments by post ID' })
  async getCommentsByPostId(@Param('postId') postId: string) {
    return this.commentsService.getCommentsByPostId(Number(postId));
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.createComment(createCommentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments' })
  async getAllComments(): Promise<CommentModel[]> {
    return this.commentsService.comments({});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comment by ID' })
  async getCommentById(@Param('id') id: string): Promise<CommentModel> {
    return this.commentsService.comment({ id: Number(id) });
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async updateComment(
    @Param('id') id: string,
    @Body() commentData: { content?: string },
  ): Promise<CommentModel> {
    return this.commentsService.updateComment({
      where: { id: Number(id) },
      data: commentData,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async deleteComment(@Param('id') id: string): Promise<CommentModel> {
    return this.commentsService.deleteComment({ id: Number(id) });
  }
}
