import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookRepository } from './book.repository';
import { UserRepository } from 'src/user/user.repository';
import { BookDto } from './dto/book.dto';
import { SaveBookPayload } from './payload/save-book.payload';
import { SaveBookData } from './type/save-book-data.type';
import { parsing, distributeParagraphs } from './parsing';
import { PatchUpdateBookPayload } from './payload/patch-update-book.payload';
import { UpdateBookData } from './type/update-book-data.type';
import { MetadataListDto } from './dto/metadata.dto';
import axios from 'axios';
import { PageListDto } from 'src/page/dto/page.dto';

@Injectable()
export class BookService {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly userRepository: UserRepository,
  ) {}

  private readonly baseUrl = 'https://www.aladin.co.kr/ttb/api/ItemSearch.aspx';
  private readonly ttbKey = process.env.ALADIN_TTB_KEY;
  private readonly apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  async getBookById(bookId: number): Promise<BookDto> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    return BookDto.from(book);
  }

  async saveBook(fileName: string, payload: SaveBookPayload): Promise<BookDto> {
    const isBookExist = await this.bookRepository.getBookByTitleAndAuthor(
      payload.title,
      payload.author,
    );
    if (isBookExist) {
      throw new ConflictException('이미 존재하는 책입니다.');
    }

    const paragraphs = parsing(fileName);
    const data: SaveBookData = {
      title: payload.title,
      author: payload.author,
      isbn: payload.isbn ?? null,
      totalPagesCount: paragraphs.length,
    };

    const book = await this.bookRepository.saveBook(data, paragraphs);
    return BookDto.from(book);
  }

  async deleteBook(bookId: number): Promise<void> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    await this.bookRepository.deleteBook(bookId);
  }

  /*
  async getBookParagraphs(bookId: number, userId: number): Promise<string[][]> {
    const paragraphs = await this.bookRepository.getParagraphsByBookId(bookId);
    if (paragraphs.length === 0) {
      throw new NotFoundException('책의 문단을 찾을 수 없습니다.');
    }

    await this.bookRepository.createUserBookIfNotExists(userId, bookId);
    const contents = paragraphs.map((p) => p.content);
    const indices = contents.map((_, i) => i);
    const distributed = distributeParagraphs(indices);

    return distributed.map((dayIndices) =>
      dayIndices.map((index) => contents[index]),
    );
  }
  */

  async getBookParagraphs(
    bookId: number,
    userId: string,
  ): Promise<PageListDto> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    const pages = await this.bookRepository.getBookPages(bookId);
    return PageListDto.from(pages);
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

    const data: UpdateBookData = {
      title: payload.title,
      author: payload.author,
      isbn: payload.isbn ?? null,
      totalPagesCount: payload.totalPagesCount,
    };

    const updatedBook = await this.bookRepository.updateBook(bookId, data);
    return BookDto.from(updatedBook);
  }

  /*
  async toggleBookLike(bookId: number, user: UserBaseInfo): Promise<void> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    await this.bookRepository.toggleBookLike(bookId, user.id);
  }

  async getLikedBookIdsByUser(userId: number): Promise<number[]> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return this.bookRepository.getLikedBookIdsByUser(userId);
  }

  */

  async getBooksMetadata(
    offset: number,
    limit: number,
  ): Promise<MetadataListDto> {
    const books = await this.bookRepository.getBooksMetadata(offset, limit);
    return MetadataListDto.from(books);
  }

  async getParagraphCountByBookId(bookId: number): Promise<number> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    const count = await this.bookRepository.getPageCountByBookId(bookId);
    return count;
  }

  /*
  async getParagraphsPerDay(bookId: number): Promise<number> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    const count = await this.bookRepository.getParagraphCountByBookId(bookId);
    const indices = Array.from({ length: count }, (_, i) => i);
    const distributed = distributeParagraphs(indices);
    const perDayCounts = distributed.map((day) => day.length);

    // 가장 많이 할당된 날의 문단 수
    return Math.max(...perDayCounts);
  }
  */

  async saveBookToUser(bookId: number, userId: string): Promise<void> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    await this.bookRepository.saveBookToUser(userId, bookId);
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

  async getSavedBookIdsByUser(userId: string): Promise<number[]> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return this.bookRepository.getSavedBookIdsByUser(userId);
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
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    if (!book.isbn) {
      return null; // ISBN이 없으면 커버 이미지도 없음
    }

    // Aladin API로 커버 이미지 가져오기
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
      const data = new Function(`return ${res.data}`)();
      const cover = data?.item?.[0]?.cover ?? null;

      if (cover && (await this.checkImageExists(cover))) {
        return cover;
      }
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
    }

    // Google Books API로 대체
    const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}&maxResults=1&key=${this.apiKey}`;

    try {
      const res = await axios.get(googleUrl);
      const links = res.data?.items?.[0]?.volumeInfo?.imageLinks;

      if (!links) return null;

      // 아무 해상도나 우선 반환
      for (const key in links) {
        if (typeof links[key] === 'string') return links[key];
      }

      return null;
    } catch (err) {
      if (err instanceof Error) {
        console.error(
          `[GoogleBooks] API 요청 실패 (ISBN=${book.isbn}):`,
          err.message,
        );
      } else {
        console.error(`[GoogleBooks] API 요청 실패 (ISBN=${book.isbn}):`, err);
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
}
