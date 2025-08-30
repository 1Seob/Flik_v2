import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookRepository } from './book.repository';
import { BookDto, BookListDto } from './dto/book.dto';
import { SaveBookPayload } from './payload/save-book.payload';
import { SaveBookData } from './type/save-book-data.type';
import { parsePagesFromJson } from './parsing';
import { PatchUpdateBookPayload } from './payload/patch-update-book.payload';
import { UpdateBookData } from './type/update-book-data.type';
import axios from 'axios';
import { PageListDto } from 'src/page/dto/page.dto';
import { redis } from 'src/search/redis.provider';
import { BookSearchQuery } from 'src/search/query/book-search-query';
import { SearchRepository } from 'src/search/search.repository';

@Injectable()
export class BookService {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly searchRepository: SearchRepository,
  ) {}

  private readonly baseUrl = 'https://www.aladin.co.kr/ttb/api/ItemSearch.aspx';
  private readonly ttbKey = process.env.ALADIN_TTB_KEY;
  private readonly NONE_SENTINEL = '__none__'; // 존재하지 않음을 표시하는 센티넬 값 (부정 캐시)
  private readonly NEGATIVE_TTL_SEC = 60 * 60 * 24 * 7; // 부정 캐시 TTL (없음이 확인된 케이스는 7일 캐시)

  async getBookById(bookId: number): Promise<BookDto> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    const url = await this.getBookCoverImage(bookId);

    return BookDto.from(book, url);
  }

  /*
  async saveBook(fileName: string, payload: SaveBookPayload): Promise<BookDto> {
    const isBookExist = await this.bookRepository.getBookByTitleAndAuthor(
      payload.title,
      payload.author,
    );
    if (isBookExist) {
      throw new ConflictException('이미 존재하는 책입니다.');
    }

    const paragraphs = parsePagesFromJson(fileName);
    const data: SaveBookData = {
      title: payload.title,
      author: payload.author,
      isbn: payload.isbn ?? null,
      totalPagesCount: paragraphs.length,
    };

    const book = await this.bookRepository.saveBook(data, paragraphs);
    return BookDto.from(book);
  }
    */

  async deleteBook(bookId: number): Promise<void> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    await this.bookRepository.deleteBook(bookId);
  }

  async getBookPages(bookId: number): Promise<PageListDto> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    const url = await this.getBookCoverImage(bookId);
    const pages = await this.bookRepository.getBookPages(bookId);
    return PageListDto.from(
      BookDto.from(book, url),
      book.totalPagesCount,
      pages,
    );
  }

  async patchUpdateBook(
    bookId: number,
    payload: PatchUpdateBookPayload,
  ): Promise<BookDto> {
    if (payload.title === null) {
      throw new BadRequestException('title은 null이 될 수 없습니다.');
    }
    if (payload.author === null) {
      throw new BadRequestException('author은 null이 될 수 없습니다.');
    }

    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    const url = await this.getBookCoverImage(bookId);

    const data: UpdateBookData = {
      title: payload.title,
      author: payload.author,
      isbn: payload.isbn ?? null,
      totalPagesCount: payload.totalPages,
    };

    const updatedBook = await this.bookRepository.updateBook(bookId, data);
    return BookDto.from(updatedBook, url);
  }

  async saveBookToUser(bookId: number, userId: string): Promise<BookDto> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    const url = await this.getBookCoverImage(bookId);

    await this.bookRepository.saveBookToUser(userId, bookId);
    return BookDto.from(book, url);
  }

  async unsaveBookFromUser(bookId: number, userId: string): Promise<void> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    const isSaved = await this.bookRepository.isBookSavedByUser(userId, bookId);
    if (!isSaved) {
      throw new BadRequestException('유저가 보관한 책이 아닙니다.');
    }

    await this.bookRepository.unsaveBookFromUser(userId, bookId);
  }

  async getSavedBooksByUser(userId: string): Promise<BookListDto> {
    const savedBooks = await this.bookRepository.getSavedBooksByUser(userId);
    const urls: (string | null)[] = await Promise.all(
      savedBooks.map((book) => this.getBookCoverImage(book.id)),
    );
    return BookListDto.from(savedBooks, urls);
  }

  private async checkImageExists(url: string): Promise<boolean> {
    try {
      const res = await axios.head(url);
      return res.status >= 200 && res.status < 400;
    } catch {
      return false;
    }
  }

  async getBookCoverImage(bookId: number): Promise<string | null> {
    const cacheKey = `book:cover:${bookId}`;

    // 1) 캐시 조회
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      return cached === this.NONE_SENTINEL ? null : cached;
    }

    // 2) DB 조회
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) throw new NotFoundException('책을 찾을 수 없습니다.');
    if (!book.isbn) {
      // ISBN이 없으면 커버도 없음 → 부정 캐시
      await redis.set(
        cacheKey,
        this.NONE_SENTINEL,
        'EX',
        this.NEGATIVE_TTL_SEC,
      );
      return null;
    }

    // 3) Aladin API 호출
    const params = new URLSearchParams({
      ttbkey: this.ttbKey as string,
      Query: book.isbn,
      QueryType: 'ISBN',
      MaxResults: '1',
      output: 'js',
      Cover: 'Big',
    });
    const url = `${this.baseUrl}?${params.toString()}`;

    try {
      const res = await axios.get(url, { responseType: 'text' });
      // Aladin JS 포맷 응답 파싱
      const data = new Function(`return ${res.data}`)();
      const cover = data?.item?.[0]?.cover ?? null;

      if (cover && (await this.checkImageExists(cover))) {
        // 4) 성공 시: 영구 저장
        await redis.set(cacheKey, cover);
        return cover;
      }

      // 커버가 없으면 부정 캐시
      await redis.set(
        cacheKey,
        this.NONE_SENTINEL,
        'EX',
        this.NEGATIVE_TTL_SEC,
      );
      return null;
    } catch (err) {
      if (err instanceof Error) {
        console.error(
          `[Aladin] API 요청 실패 (ISBN=${book.isbn}):`,
          err.message,
        );
      } else {
        console.error(`[Aladin] API 요청 실패 (ISBN=${book.isbn}):`, err);
      }
      return null;
    }
  }

  async incrementBookViews(bookId: number): Promise<void> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    await this.bookRepository.incrementBookViews(bookId, book.title);
  }

  async updateBookPages(bookId: number, fileName: string): Promise<void> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    const pages = parsePagesFromJson(fileName);
    await this.bookRepository.updateBookPages(bookId, pages);
  }

  async getBooks(query: BookSearchQuery): Promise<BookListDto> {
    const books = await this.searchRepository.getBooks(query);

    const urls: (string | null)[] = await Promise.all(
      books.map((book) => this.getBookCoverImage(book.id)),
    );

    return BookListDto.from(books, urls);
  }
}
