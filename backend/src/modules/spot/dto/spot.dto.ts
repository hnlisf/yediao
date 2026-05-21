import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsBoolean, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpotType, DifficultyLevel } from '../../../entities/spot.entity';
import { Type } from 'class-transformer';

export class CreateSpotDto {
  @ApiProperty({ description: '钓点名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '经度' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: '纬度' })
  @IsNumber()
  latitude: number;

  @ApiPropertyOptional({ description: '类型', enum: SpotType })
  @IsEnum(SpotType)
  @IsOptional()
  type?: SpotType;

  @ApiPropertyOptional({ description: '省份' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ description: '城市' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: '区县' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: '鱼种', type: [String] })
  @IsArray()
  @IsOptional()
  fishSpecies?: string[];

  @ApiPropertyOptional({ description: '水深(米)' })
  @IsNumber()
  @IsOptional()
  depth?: number;

  @ApiPropertyOptional({ description: '水温(℃)' })
  @IsNumber()
  @IsOptional()
  waterTemp?: number;

  @ApiPropertyOptional({ description: '推荐饵料', type: [String] })
  @IsArray()
  @IsOptional()
  baits?: string[];

  @ApiPropertyOptional({ description: '推荐钓法', type: [String] })
  @IsArray()
  @IsOptional()
  fishingMethods?: string[];

  @ApiPropertyOptional({ description: '照片URLs', type: [String] })
  @IsArray()
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional({ description: '评分', type: Number })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ description: '鱼种类型', type: [String] })
  @IsArray()
  @IsOptional()
  fishTypes?: string[];

  @ApiPropertyOptional({ description: '最佳季节' })
  @IsString()
  @IsOptional()
  seasonalBest?: string;

  @ApiPropertyOptional({ description: '难度', enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ description: '配套设施', type: [String] })
  @IsArray()
  @IsOptional()
  facilities?: string[];

  @ApiPropertyOptional({ description: '注意事项', type: [String] })
  @IsArray()
  @IsOptional()
  cautions?: string[];

  @ApiPropertyOptional({ description: '详细介绍' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '停车信息' })
  @IsString()
  @IsOptional()
  parkingInfo?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '价格区间' })
  @IsString()
  @IsOptional()
  priceRange?: string;

  @ApiPropertyOptional({ description: '收费说明' })
  @IsString()
  @IsOptional()
  priceNote?: string;

  @ApiPropertyOptional({ description: '营业时间' })
  @IsString()
  @IsOptional()
  businessHours?: string;
}

export class SpotFilterDto {
  @ApiPropertyOptional({ description: '省份' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ description: '城市' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: '区县' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ description: '类型', enum: SpotType })
  @IsEnum(SpotType)
  @IsOptional()
  type?: SpotType;

  @ApiPropertyOptional({ description: '难度', enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ description: '配套设施', type: [String] })
  @IsArray()
  @IsOptional()
  facilities?: string[];

  @ApiPropertyOptional({ description: '鱼种' })
  @IsString()
  @IsOptional()
  fishSpecies?: string;

  @ApiPropertyOptional({ description: '排序字段', default: 'createdAt', enum: ['createdAt', 'favoriteCount', 'commentCount', 'rating', 'avgRating', 'browseCount'] })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ description: '排序方向', default: 'DESC', enum: ['ASC', 'DESC'] })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class NearbyQueryDto {
  @ApiProperty({ description: '纬度' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ description: '经度' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @ApiPropertyOptional({ description: '半径(米)', default: 5000 })
  @IsNumber()
  @IsOptional()
  @Min(100)
  @Max(50000)
  radius?: number;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class CommentDto {
  @ApiProperty({ description: '评论内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '父评论ID（回复）' })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class ReviewSpotDto {
  @ApiProperty({ description: '审核动作', enum: ['approve', 'reject'] })
  @IsString()
  action: string;

  @ApiPropertyOptional({ description: '审核备注' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class ReviewCommentDto {
  @ApiProperty({ description: '审核动作', enum: ['approve', 'reject'] })
  @IsString()
  action: string;

  @ApiPropertyOptional({ description: '审核备注' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateSpotDto {
  @ApiPropertyOptional({ description: '钓点名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '类型', enum: SpotType })
  @IsEnum(SpotType)
  @IsOptional()
  type?: SpotType;

  @ApiPropertyOptional({ description: '省份' })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({ description: '城市' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: '区县' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: '鱼种', type: [String] })
  @IsArray()
  @IsOptional()
  fishSpecies?: string[];

  @ApiPropertyOptional({ description: '水深(米)' })
  @IsNumber()
  @IsOptional()
  depth?: number;

  @ApiPropertyOptional({ description: '水温(℃)' })
  @IsNumber()
  @IsOptional()
  waterTemp?: number;

  @ApiPropertyOptional({ description: '推荐饵料', type: [String] })
  @IsArray()
  @IsOptional()
  baits?: string[];

  @ApiPropertyOptional({ description: '推荐钓法', type: [String] })
  @IsArray()
  @IsOptional()
  fishingMethods?: string[];

  @ApiPropertyOptional({ description: '照片URLs', type: [String] })
  @IsArray()
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional({ description: '鱼种类型', type: [String] })
  @IsArray()
  @IsOptional()
  fishTypes?: string[];

  @ApiPropertyOptional({ description: '最佳季节' })
  @IsString()
  @IsOptional()
  seasonalBest?: string;

  @ApiPropertyOptional({ description: '难度', enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ description: '配套设施', type: [String] })
  @IsArray()
  @IsOptional()
  facilities?: string[];

  @ApiPropertyOptional({ description: '注意事项', type: [String] })
  @IsArray()
  @IsOptional()
  cautions?: string[];

  @ApiPropertyOptional({ description: '详细介绍' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '停车信息' })
  @IsString()
  @IsOptional()
  parkingInfo?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: '价格区间' })
  @IsString()
  @IsOptional()
  priceRange?: string;

  @ApiPropertyOptional({ description: '收费说明' })
  @IsString()
  @IsOptional()
  priceNote?: string;

  @ApiPropertyOptional({ description: '营业时间' })
  @IsString()
  @IsOptional()
  businessHours?: string;

  @ApiPropertyOptional({ description: '是否公开' })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
