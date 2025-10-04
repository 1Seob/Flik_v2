import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { LibraryRepository } from './library.repository';
import { BookModule } from 'src/book/book.module';

@Module({
  providers: [LibraryService, LibraryRepository],
  imports: [BookModule],
  controllers: [LibraryController],
})
export class LibraryModule {}
