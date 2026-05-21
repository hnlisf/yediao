import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FishingDate } from '../../entities/fishing-date.entity';
import { FishingDateParticipant } from '../../entities/fishing-date-participant.entity';
import { FishingDateService } from './fishing-date.service';
import { FishingDateController } from './fishing-date.controller';
import { ImModule } from '../im/im.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FishingDate, FishingDateParticipant]),
    ImModule,
  ],
  providers: [FishingDateService],
  controllers: [FishingDateController],
  exports: [FishingDateService],
})
export class FishingDateModule {}