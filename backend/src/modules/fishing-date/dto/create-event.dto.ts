import { IsString, IsOptional, IsNumber, IsDateString, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '钓点ID' })
  @IsString()
  @IsOptional()
  spotId?: string;

  @ApiPropertyOptional({ description: '地点名称' })
  @IsString()
  @IsOptional()
  locationName?: string;

  @ApiPropertyOptional({ description: '经度' })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ description: '纬度' })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ description: '开始时间' })
  @IsDateString()
  startTime: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ description: '人数上限', default: 2 })
  @IsNumber()
  @Min(2)
  @IsOptional()
  maxParticipants?: number;
}