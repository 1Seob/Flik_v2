import { Injectable } from '@nestjs/common';
import { LibraryRepository } from './library.repository';
import { BookService } from 'src/book/book.service';
import { BasicBookListDto } from 'src/book/dto/basic-book.dto';
import { BookDto } from 'src/book/dto/book.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class LibraryService {
  constructor(
    private readonly libraryRepository: LibraryRepository,
    private readonly bookService: BookService,
  ) {}

  async getSavedBooksByUser(userId: string): Promise<BasicBookListDto> {
    const savedBooks = await this.libraryRepository.getSavedBooksByUser(userId);
    const urls: (string | null)[] = await Promise.all(
      savedBooks.map((book) =>
        this.bookService.getBookCoverImageUrlByNaverSearchApi(book.isbn),
      ),
    );
    return BasicBookListDto.from(savedBooks, urls);
  }

  async saveBookToUser(bookId: number, userId: string): Promise<BookDto> {
    const book = await this.libraryRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    const url = await this.bookService.getBookCoverImageUrlByNaverSearchApi(
      book.isbn,
    );

    await this.libraryRepository.saveBookToUser(userId, bookId);
    return BookDto.from(book, url);
  }

  async unsaveBookFromUser(bookId: number, userId: string): Promise<void> {
    const book = await this.libraryRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    const isSaved = await this.libraryRepository.isBookSavedByUser(
      userId,
      bookId,
    );
    if (!isSaved) {
      throw new BadRequestException('유저가 보관한 책이 아닙니다.');
    }

    await this.libraryRepository.unsaveBookFromUser(userId, bookId);
  }
}
