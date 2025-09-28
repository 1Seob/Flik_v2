import { Module } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { SentenceLikeService } from './sentence-like.service';
import { SentenceLikeRepository } from './sentence-like.repository';
import { SentenceLikeController } from './sentence-like.controller';

@Module({
  providers: [SentenceLikeService, SentenceLikeRepository, UserRepository],
  controllers: [SentenceLikeController],
})
export class SentenceLikeModule {}
