import { Module } from '@nestjs/common';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { ChallengeRepository } from './challenge.repository';

@Module({
  controllers: [ChallengeController],
  providers: [ChallengeService, ChallengeRepository],
})
export class ChallengeModule {}
