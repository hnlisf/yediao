import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { UploadModule } from '../modules/upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [SocialController],
  providers: [SocialService],
})
export class SocialModule {}
