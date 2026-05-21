import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EarnPointsDto {
  @ApiPropertyOptional({ description: '积分动作类型' })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiPropertyOptional({ description: '积分数量（可选，默认从配置获取）' })
  @IsInt()
  @Min(0)
  @IsOptional()
  points?: number;

  @ApiPropertyOptional({ description: '关联业务ID' })
  @IsString()
  @IsOptional()
  refId?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class SpendPointsDto {
  @ApiPropertyOptional({ description: '积分动作类型' })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiPropertyOptional({ description: '消耗积分数量' })
  @IsInt()
  @Min(1)
  @IsOptional()
  points?: number;

  @ApiPropertyOptional({ description: '关联业务ID' })
  @IsString()
  @IsOptional()
  refId?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class PointRecordQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}
