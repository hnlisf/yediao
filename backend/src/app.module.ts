import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuthModule } from './auth/auth.module';
import { OAuthModule } from './auth/oauth.module';
import { UsersModule } from './users/users.module';
import { SpotsModule } from './spots/spots.module';
import { FishSpeciesModule } from './modules/fish-species/fish-species.module';
import { FishModule } from './fish/fish.module';
import { SocialModule } from './social/social.module';
import { ChatModule } from './chat/chat.module';
import { CommonModule } from './common/common.module';
import { SpotModule } from './modules/spot/spot.module';
import { SpotAuditModule } from './modules/spot-audit/spot-audit.module';
import { UserModule } from './modules/user/user.module';
import { CommunityModule } from './modules/community/community.module';
import { FishingDateModule } from './modules/fishing-date/fishing-date.module';
import { ImModule } from './modules/im/im.module';
import { RedisModule } from './modules/redis/redis.module';
import { UploadModule } from './modules/upload/upload.module';
import { PushModule } from './modules/push/push.module';
import { AiModule } from './modules/ai/ai.module';
import { PointsModule } from './modules/points/points.module';
import { GlobalJwtAuthGuard } from './auth/guards/global-jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'yediao',
      password: process.env.DB_PASSWORD || 'yediao123',
      database: process.env.DB_NAME || 'yediao',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      namingStrategy: new SnakeNamingStrategy(),
    }),
    AuthModule,
    OAuthModule,
    UsersModule,
    SpotsModule,
    FishSpeciesModule,
    FishModule,
    SocialModule,
    ChatModule,
    CommonModule,
    SpotModule,
    SpotAuditModule,
    UserModule,
    CommunityModule,
    FishingDateModule,
    ImModule,
    RedisModule,
    UploadModule,
    PushModule,
    AiModule,
    PointsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GlobalJwtAuthGuard,
    },
  ],
})
export class AppModule {}
