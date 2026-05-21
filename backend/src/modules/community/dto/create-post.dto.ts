import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: '内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '图片URLs', type: [String] })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ description: '标签鱼种', type: [String] })
  @IsArray()
  @IsOptional()
  taggedSpecies?: string[];

  @ApiPropertyOptional({ description: '标签钓点', type: [String] })
  @IsArray()
  @IsOptional()
  taggedSpots?: string[];

  @ApiPropertyOptional({ description: '视频URL' })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ description: '内容类型', default: 'text' })
  @IsString()
  @IsOptional()
  contentType?: string;
}