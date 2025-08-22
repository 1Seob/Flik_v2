import { Module } from '@nestjs/common';
import { ChallengeRepository } from './challenge.repository';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { BadWordsFilterService } from 'src/user/bad-words-filter.service';

@Module({
  providers: [ChallengeRepository, ChallengeService, BadWordsFilterService],
  controllers: [ChallengeController],
})
export class ChallengeModule {}
