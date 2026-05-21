import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ProtectionLevelEnum } from '../../../entities/fish-species.entity';

export class QuerySpeciesDto {
  @ApiPropertyOptional({ description: '搜索关键词（中文名/学名/科/属）' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '保护级别' })
  @IsOptional()
  @IsEnum(ProtectionLevelEnum)
  protectionLevel?: ProtectionLevelEnum;

  @ApiPropertyOptional({ description: '科' })
  @IsOptional()
  @IsString()
  family?: string;

  @ApiPropertyOptional({ description: '活动水层' })
  @IsOptional()
  @IsString()
  waterLayer?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class QueryHistoryDto {
  @ApiPropertyOptional({ description: '鱼名筛选' })
  @IsOptional()
  @IsString()
  fishName?: string;

  @ApiPropertyOptional({ description: '是否保护鱼类', default: false })
  @IsOptional()
  @Type(() => Boolean)
  protected?: boolean;

  @ApiPropertyOptional({ description: '是否已放生', default: null })
  @IsOptional()
  @Type(() => Boolean)
  released?: boolean;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class HistoryStatsDto {
  @ApiProperty({ description: '总识别次数' })
  totalRecognitions: number;

  @ApiProperty({ description: '识别鱼种数' })
  uniqueSpecies: number;

  @ApiProperty({ description: '放生次数' })
  totalReleased: number;

  @ApiProperty({ description: '保护鱼类识别次数' })
  protectedDetections: number;

  @ApiProperty({ description: '累计积分' })
  totalPoints: number;

  @ApiProperty({ description: '本月的识别次数' })
  monthlyRecognitions: number;

  @ApiProperty({ description: '本月的放生次数' })
  monthlyReleased: number;
}
