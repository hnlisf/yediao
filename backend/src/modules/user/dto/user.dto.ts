import { IsString, IsOptional, IsInt, Min, Max, IsArray, IsBoolean, IsEnum, Matches, IsNotEmpty, Length } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

// ============ Profile Completeness ============

export class ProfileCompletenessDto {
  @ApiProperty({ description: '总分', example: 65 })
  total: number;

  @ApiProperty({ description: '各项完成情况' })
  breakdown: {
    nickname: { filled: boolean; points: number; maxPoints: number };
    avatar: { filled: boolean; points: number; maxPoints: number };
    phone: { filled: boolean; points: number; maxPoints: number };
    fishingAge: { filled: boolean; points: number; maxPoints: number };
    frequentSpot: { filled: boolean; points: number; maxPoints: number };
    skilledFish: { filled: boolean; points: number; maxPoints: number };
  };

  @ApiProperty({ description: '建议完善项', example: ['完善昵称', '上传头像'] })
  suggestions: string[];
}

// ============ Update Profile ============

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '昵称' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: '钓龄' })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  fishingAge?: number;

  @ApiPropertyOptional({ description: '常驻扎钓点', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  frequentSpot?: string[];

  @ApiPropertyOptional({ description: '擅长鱼种', type: [String] })
  @IsArray()
  @IsOptional()
  skilledFish?: string[];
}

// ============ Bind Phone (OAuth) ============

export class BindPhoneDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @ApiProperty({ description: '验证码', example: '123456' })
  @IsString()
  @Length(6, 6, { message: '验证码必须为6位' })
  code: string;
}

// ============ Privacy Settings ============

export class UpdatePrivacyDto {
  @ApiPropertyOptional({ description: '是否公开钓龄' })
  @IsBoolean()
  @IsOptional()
  showFishingAge?: boolean;

  @ApiPropertyOptional({ description: '是否公开常驻扎钓点' })
  @IsBoolean()
  @IsOptional()
  showFrequentSpot?: boolean;

  @ApiPropertyOptional({ description: '是否公开擅长鱼种' })
  @IsBoolean()
  @IsOptional()
  showSkilledFish?: boolean;

  @ApiPropertyOptional({ description: '是否接收推送' })
  @IsBoolean()
  @IsOptional()
  allowPush?: boolean;

  @ApiPropertyOptional({ description: '是否公开动态' })
  @IsBoolean()
  @IsOptional()
  showPosts?: boolean;

  @ApiPropertyOptional({ description: '是否公开渔友' })
  @IsBoolean()
  @IsOptional()
  showFriends?: boolean;
}

export class PrivacySettingsDto {
  @ApiPropertyOptional({ description: '是否公开钓龄' })
  @IsBoolean()
  @IsOptional()
  showFishingAge?: boolean;

  @ApiPropertyOptional({ description: '是否公开常驻扎钓点' })
  @IsBoolean()
  @IsOptional()
  showFrequentSpot?: boolean;

  @ApiPropertyOptional({ description: '是否公开擅长鱼种' })
  @IsBoolean()
  @IsOptional()
  showSkilledFish?: boolean;

  @ApiPropertyOptional({ description: '是否接收推送' })
  @IsBoolean()
  @IsOptional()
  allowPush?: boolean;

  @ApiPropertyOptional({ description: '是否公开动态' })
  @IsBoolean()
  @IsOptional()
  showPosts?: boolean;

  @ApiPropertyOptional({ description: '是否公开渔友' })
  @IsBoolean()
  @IsOptional()
  showFriends?: boolean;
}
