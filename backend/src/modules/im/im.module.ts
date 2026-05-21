import { Module } from '@nestjs/common';
import { ImService } from './im.service';
import { ImController } from './im.controller';

@Module({
  providers: [ImService],
  controllers: [ImController],
  exports: [ImService],
})
export class ImModule {}
