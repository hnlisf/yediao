import { Module } from '@nestjs/common';
import { FishSpeciesController } from './fish-species.controller';

@Module({
  controllers: [FishSpeciesController],
})
export class FishSpeciesModule {}
