import { IsNotEmpty, IsString, IsPhoneNumber, IsOptional } from 'class-validator';

export class SendCodeDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsString()
  @IsPhoneNumber('CN', { message: '请输入有效的中国手机号' })
  phone: string;
}

export class LoginDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsString()
  @IsPhoneNumber('CN', { message: '请输入有效的中国手机号' })
  phone: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString()
  code: string;
}

export class RegisterDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsString()
  @IsPhoneNumber('CN', { message: '请输入有效的中国手机号' })
  phone: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  frequent_spot?: string;

  @IsOptional()
  @IsString()
  frequentSpot?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}