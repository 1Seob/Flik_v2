import { Module } from '@nestjs/common';
import { BookReadService } from './bookread.service';
import { BookReadController } from './bookread.controller';
import { BookReadRepository } from './bookread.repository';
import { BookRepository } from 'src/book/book.repository';

@Module({
  providers: [BookReadService, BookReadRepository, BookRepository],
  controllers: [BookReadController],
})
export class BookReadModule {}
