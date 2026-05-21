import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiRecognition } from '../../entities/ai-recognition.entity';
import { FishSpecies } from '../../entities/fish-species.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { PointRecord } from '../../entities/point-record.entity';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AiRecognition, FishSpecies, AuditLog, PointRecord])],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}
