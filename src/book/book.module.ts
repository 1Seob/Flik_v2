import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { BookRepository } from './book.repository';
import { SearchModule } from 'src/search/search.module';
import { SearchRepository } from 'src/search/search.repository';
import { RecommendRepository } from './recommend.repository';
import { RecommendService } from './recommend.service';

@Module({
  providers: [
    BookService,
    BookRepository,
    SearchRepository,
    RecommendRepository,
    RecommendService,
  ],
  controllers: [BookController],
  imports: [SearchModule],
  exports: [BookService],
})
export class BookModule {}
