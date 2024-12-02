import { IsString, IsEnum, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CommunityCategory {
  HISTORY = 'HISTORY',
  FOOD = 'FOOD',
  PETS = 'PETS',
  HEALTH = 'HEALTH',
  FASHION = 'FASHION',
  EXERCISE = 'EXERCISE',
  OTHERS = 'OTHERS',
}

export class CreatePostDto {
  @ApiProperty({ example: 'My Amazing Post' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'This is the content of my post...' })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiProperty({ enum: CommunityCategory })
  @IsEnum(CommunityCategory)
  category: CommunityCategory;
}

export class UpdatePostDto {
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @MinLength(10)
  @IsOptional()
  content?: string;

  @ApiProperty({ enum: CommunityCategory, required: false })
  @IsEnum(CommunityCategory)
  @IsOptional()
  category?: CommunityCategory;
}
