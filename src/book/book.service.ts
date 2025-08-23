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

@Injectable()
export class BookService {
  constructor(private readonly bookRepository: BookRepository) {}

  private readonly baseUrl = 'https://www.aladin.co.kr/ttb/api/ItemSearch.aspx';
  private readonly ttbKey = process.env.ALADIN_TTB_KEY;

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
    const pages = await this.bookRepository.getBookPages(bookId);
    return PageListDto.from(BookDto.from(book), book.totalPagesCount, pages);
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
      totalPagesCount: payload.totalPages,
    };

    const updatedBook = await this.bookRepository.updateBook(bookId, data);
    return BookDto.from(updatedBook);
  }

  async saveBookToUser(bookId: number, userId: string): Promise<BookDto> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    await this.bookRepository.saveBookToUser(userId, bookId);
    return BookDto.from(book);
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
    return BookListDto.from(savedBooks);
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
    return null;
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
}
