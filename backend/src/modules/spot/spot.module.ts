import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spot } from '../../entities/spot.entity';
import { SpotFavorite } from '../../entities/spot-favorite.entity';
import { SpotComment } from '../../entities/spot-comment.entity';
import { SpotReview } from '../../entities/spot-review.entity';
import { SpotService } from './spot.service';
import { SpotController } from './spot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Spot, SpotFavorite, SpotComment, SpotReview])],
  providers: [SpotService],
  controllers: [SpotController],
})
export class SpotModule {}
