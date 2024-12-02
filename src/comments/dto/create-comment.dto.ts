import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsInt } from 'class-validator';
export class UpdateCommentDto {
  @ApiProperty({ example: 'My Amazing Post' })
  @IsString()
  @IsOptional()
  content?: string;
}

export class CreateCommentDto {
  @ApiProperty({ example: 'My Amazing Post' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: '' })
  @IsInt()
  @IsNotEmpty()
  postId: number;

  @ApiProperty({ example: '' })
  @IsInt()
  @IsNotEmpty()
  authorId: number;
}
