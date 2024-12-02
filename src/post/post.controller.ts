import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreatePostDto,
  CommunityCategory,
  UpdatePostDto,
} from './dto/create-post.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postsService: PostService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Req() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(req.user.id, createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'Returns all posts' })
  @ApiQuery({ name: 'category', enum: CommunityCategory, required: false })
  @ApiQuery({ name: 'authorId', type: Number, required: false })
  findAll(
    @Query('category') category?: CommunityCategory,
    @Query('authorId') authorId?: string,
  ) {
    return this.postsService.findAll({
      category,
      authorId: authorId ? parseInt(authorId) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, req.user.id, updatePostDto);
  }
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.postsService.remove(id, req.user.id);
  }
}
