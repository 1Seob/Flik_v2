import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookRepository } from './book.repository';
import { HistoryRepository } from './history.repository';
import { BookService } from './book.service';
import { CreateBookCompletionData } from './type/history/create-book-completion-data.type';
import { CompletedBookDto } from './dto/history/completed-book.dto';
import { CompletedBookData } from './type/history/completed-book-data.type';
import { ToggleCompletedBookPayload } from './payload/toggle-completed-book.payload';
import { PatchUpdateBookCompletionPayload } from './payload/patch-update-book-completion.payload';
import { UpdateBookCompletionData } from './type/history/update-book-completion-data.type';
import { fromZonedTime } from 'date-fns-tz';
import { from } from 'rxjs';

@Injectable()
export class HistoryService {
  constructor(
    private readonly historyRepository: HistoryRepository,
    private readonly bookService: BookService,
    private readonly bookRepository: BookRepository,
  ) {}

  /*
  async getUserHistory(userId: string): Promise<HistoryDto> {
    const readingBooksData =
      await this.historyRepository.getReadingBooks(userId);
    const completedBooksData =
      await this.historyRepository.getCompletedBooks(userId);

    return {
      readingBooks: ReadingBookDto.fromArray(readingBooksData),
      completedBooks: BasicBookDto.fromArray(completedBooksData),
    };
  } */

  async completeBook(
    bookId: number,
    payload: ToggleCompletedBookPayload,
    userId: string,
  ): Promise<CompletedBookDto> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    const firstLog = await this.historyRepository.findFirstLogByUserAndBook(
      userId,
      bookId,
    );
    if (!firstLog) {
      throw new BadRequestException('해당 책에 대한 독서 기록이 없습니다.');
    }
    if (!firstLog.startedAt) {
      throw new BadRequestException('독서 기록의 시작일이 없습니다.');
    }

    const isBookCompletionExists =
      await this.historyRepository.isBookCompletionExists(userId, bookId);

    if (!payload.completed) {
      if (!isBookCompletionExists) {
        throw new BadRequestException('완독 처리된 책이 아닙니다.');
      }
      await this.historyRepository.deleteBookCompletion(userId, bookId);
      const data: CompletedBookData = {
        id: null,
        book: book,
        startedAt: null,
        endedAt: null,
        completed: false,
      };
      const url = await this.bookService.getBookCoverImageUrlByNaverSearchApi(
        book.isbn,
      );
      return CompletedBookDto.from(data, url);
    }

    if (isBookCompletionExists) {
      throw new BadRequestException('이미 완독 처리된 책입니다.');
    }

    const data: CreateBookCompletionData = {
      bookId: bookId,
      userId: userId,
      startedAt: firstLog.startedAt,
      completed: payload.completed,
    };

    const completedBook = await this.historyRepository.completeBook(data);
    const createdData: CompletedBookData = {
      id: completedBook.id,
      book: book,
      startedAt: completedBook.startedAt,
      endedAt: completedBook.endedAt,
      completed: true,
    };

    const url = await this.bookService.getBookCoverImageUrlByNaverSearchApi(
      book.isbn,
    );
    return CompletedBookDto.from(createdData, url);
  }

  async updateCompletedBook(
    id: number,
    payload: PatchUpdateBookCompletionPayload,
    userId: string,
  ): Promise<CompletedBookDto> {
    const completion = await this.historyRepository.getBookCompletionById(id);
    if (!completion || completion.userId !== userId) {
      throw new NotFoundException('완독 정보를 찾을 수 없습니다.');
    }
    if (completion.userId !== userId) {
      throw new ForbiddenException('유저 id가 일치하지 않습니다.');
    }

    const book = await this.bookRepository.getBookById(completion.bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    const startedAt = fromZonedTime(
      payload.startedAt ?? completion.startedAt,
      'Asia/Seoul',
    );
    const endedAt = fromZonedTime(
      payload.endedAt ?? completion.endedAt,
      'Asia/Seoul',
    );

    if (startedAt && endedAt && startedAt > endedAt) {
      throw new BadRequestException('시작일은 종료일보다 이후일 수 없습니다.');
    }

    const data: UpdateBookCompletionData = {
      startedAt: startedAt,
      endedAt: endedAt,
    };

    const updated = await this.historyRepository.updateBookCompletion(id, data);

    const url = await this.bookService.getBookCoverImageUrlByNaverSearchApi(
      book.isbn,
    );
    const updatedData: CompletedBookData = {
      id: updated.id,
      book: book,
      startedAt: updated.startedAt,
      endedAt: updated.endedAt,
      completed: true,
    };

    return CompletedBookDto.from(updatedData, url);
  }
}
