import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api',
  jwtSecret: process.env.JWT_SECRET || 'yediao-secret-key-2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // 阿里云OSS
  ossAccessKeyId: process.env.OSS_ACCESS_KEY_ID,
  ossAccessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  ossBucket: process.env.OSS_BUCKET || 'yediao-app',
  ossRegion: process.env.OSS_REGION || 'oss-cn-hangzhou',
  ossEndpoint: process.env.OSS_ENDPOINT,
  // 百度EasyDL
  easydlApiKey: process.env.EASYDL_API_KEY,
  easydlSecretKey: process.env.EASYDL_SECRET_KEY,
  // 融云IM
  rongcloudAppKey: process.env.RONGCLOUD_APP_KEY,
  rongcloudAppSecret: process.env.RONGCLOUD_APP_SECRET,
  // 高德地图
  amapKey: process.env.AMAP_KEY,
}));
