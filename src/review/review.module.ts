import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewRepository } from './review.repository';
import { BookRepository } from '../book/book.repository';
import { BadWordsFilterService } from 'src/auth/bad-words-filter.service';

@Module({
  controllers: [ReviewController],
  providers: [
    ReviewService,
    ReviewRepository,
    BookRepository,
    BadWordsFilterService,
  ],
})
export class ReviewModule {}
