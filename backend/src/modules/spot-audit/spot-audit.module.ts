import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spot } from '../../entities/spot.entity';
import { SpotReview } from '../../entities/spot-review.entity';
import { SpotAuditService } from './spot-audit.service';
import { SpotAuditController } from './spot-audit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Spot, SpotReview])],
  providers: [SpotAuditService],
  controllers: [SpotAuditController],
  exports: [SpotAuditService],
})
export class SpotAuditModule {}