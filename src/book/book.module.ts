import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { BookRepository } from './book.repository';
import { UserRepository } from 'src/user/user.repository';

@Module({
  providers: [BookService, BookRepository, UserRepository],
  controllers: [BookController],
})
export class BookModule {}
