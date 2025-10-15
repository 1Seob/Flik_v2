import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookRepository } from './book.repository';
import { BookDto } from './dto/book.dto';
import axios from 'axios';
import { PageListDto } from 'src/sentence-like/dto/page.dto';
import { BookSearchQuery } from 'src/search/query/book-search-query';
import { SearchRepository } from 'src/search/search.repository';
import { RecentBookListDto } from './dto/recent-book.dto';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { DetailedBookDto } from './dto/detailed-book.dto';
import { ids, getRandomNIdsUnique } from '../common/id.store';
import { BasicBookDto, BasicBookListDto } from './dto/basic-book.dto';
import { SimpleBookListDto } from './dto/simple-book.dto';
import { AiBookDto } from './dto/ai-book.dto';
import { redis } from 'src/search/redis.provider';
import { BookData } from './type/book-data.type';
import { DownloadedBookDto } from 'src/book/dto/downloaded-book.dto';

@Injectable()
export class BookService {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly searchRepository: SearchRepository,
  ) {}

  private readonly baseUrl = 'https://www.aladin.co.kr/ttb/api/ItemSearch.aspx';
  private readonly ttbKey = process.env.ALADIN_TTB_KEY;
  private readonly naverApiUrl =
    'https://openapi.naver.com/v1/search/book_adv.json';
  private readonly naverClientId = process.env.NAVER_CLIENT_ID;
  private readonly naverClientSecret = process.env.NAVER_CLIENT_SECRET;
  private readonly googleApiKey = process.env.GOOGLE_API_KEY;

  async getBookById(bookId: number): Promise<BookDto> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    const url = await this.getBookCoverImageUrlByNaverSearchApi(book.isbn);

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

  async getBookPages(bookId: number): Promise<PageListDto> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    const url = await this.getBookCoverImageUrlByNaverSearchApi(book.isbn);
    const pages = await this.bookRepository.getBookPages(bookId);
    return PageListDto.from(
      DownloadedBookDto.from(book, url),
      book.totalPagesCount,
      pages,
    );
  }

  private async checkImageExists(url: string): Promise<boolean> {
    try {
      const res = await axios.head(url);
      return res.status >= 200 && res.status < 400;
    } catch {
      return false;
    }
  }

  async getBookCoverImageUrlByAladinOpenApi(
    isbn: string | null,
  ): Promise<string | null> {
    if (!isbn) {
      return null;
    }

    // Aladin API 호출
    const params = new URLSearchParams({
      ttbkey: this.ttbKey as string,
      Query: isbn,
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
        return cover;
      }

      return null;
    } catch (err) {
      if (err instanceof Error) {
        console.error(`[Aladin] API 요청 실패 (ISBN=${isbn}):`, err.message);
      } else {
        console.error(`[Aladin] API 요청 실패 (ISBN=${isbn}):`, err);
      }
      return null;
    }
  }

  async getBookCoverImageUrlByNaverSearchApi(
    isbn: string | null,
  ): Promise<string | null> {
    if (!isbn) {
      return null;
    }
    try {
      const headers = {
        'X-Naver-Client-Id': this.naverClientId,
        'X-Naver-Client-Secret': this.naverClientSecret,
      };

      const response = await axios.get(this.naverApiUrl, {
        headers,
        params: { d_isbn: isbn },
      });

      const book = response.data.items?.[0];

      if (!book || !book.image) {
        console.log(`No image found for ISBN: ${isbn}`);
        return null;
      }

      return book.image;
    } catch (err) {
      if (err instanceof Error) {
        console.error(`[Naver] API 요청 실패 (ISBN=${isbn}):`, err.message);
      } else {
        console.error(`[Naver] API 요청 실패 (ISBN=${isbn}):`, err);
      }
      return null;
    }
  }

  async getBookCoverImageUrlByGoogleBooksApi(
    isbn: string | null,
  ): Promise<string | null> {
    if (!isbn) {
      return null;
    }

    const cacheKey = `book:cover:${isbn}`;

    // 1) 캐시 조회
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1&key=${this.googleApiKey}`;

    try {
      const res = await axios.get(googleUrl);
      const links = res.data?.items?.[0]?.volumeInfo?.imageLinks;

      if (!links) return null;

      // 아무 해상도나 우선 반환
      for (const key in links) {
        if (typeof links[key] === 'string') {
          await redis.set(cacheKey, links[key], 'EX', 23 * 60 * 60); // 23시간 캐시
          return links[key];
        }
      }

      return null;
    } catch (err) {
      if (err instanceof Error) {
        console.error(
          `[GoogleBooks] API 요청 실패 (ISBN=${isbn}):`,
          err.message,
        );
      } else {
        console.error(`[GoogleBooks] API 요청 실패 (ISBN=${isbn}):`, err);
      }
      return null;
    }
  }

  async getBooks(query: BookSearchQuery): Promise<BasicBookListDto> {
    const books = await this.searchRepository.getBooks(query);

    const urls: (string | null)[] = await Promise.all(
      books.map((book) => this.getBookCoverImageUrlByNaverSearchApi(book.isbn)),
    );

    return BasicBookListDto.from(books, urls);
  }

  async getRecentBooks(user: UserBaseInfo): Promise<RecentBookListDto> {
    const [books, pages] = await this.bookRepository.findRecentBooksAndPages(
      user.id,
      10,
    );

    if (books.length === 0) {
      return { recentBooks: [] };
    }

    const urls: (string | null)[] = await Promise.all(
      books.map((book) => this.getBookCoverImageUrlByNaverSearchApi(book.isbn)),
    );

    return RecentBookListDto.from(books, pages, urls);
  }

  async getDetailedBookById(bookId: number): Promise<DetailedBookDto> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    const averageRating =
      await this.bookRepository.getAverageRatingByBookId(bookId);
    const url = await this.getBookCoverImageUrlByNaverSearchApi(book.isbn);
    const topReviews = await this.bookRepository.getTopReviewsByBookId(bookId);

    const otherBooksByAuthor = await this.bookRepository.getOtherBooksByAuthor(
      book.author,
      bookId,
      4,
    );
    const otherBooksByAuthorUrl: (string | null)[] = await Promise.all(
      otherBooksByAuthor.map((b) =>
        this.getBookCoverImageUrlByNaverSearchApi(b.isbn),
      ),
    );
    let similarBooks: BookData[] = [];
    if (otherBooksByAuthor.length < 4) {
      const needed = 4 - otherBooksByAuthor.length;
      const randomBookIds = getRandomNIdsUnique(needed, ids);
      similarBooks = await this.bookRepository.getBooksByIds(randomBookIds);
    }

    const similarBooksUrls: (string | null)[] = await Promise.all(
      similarBooks.map((b) =>
        this.getBookCoverImageUrlByNaverSearchApi(b.isbn),
      ),
    );
    const summary = await this.bookRepository.getSummaryByBookId(bookId);
    const firstPage = await this.bookRepository.getFirstPageOfBook(bookId);
    const firstPageContent = firstPage?.content ?? '';
    return DetailedBookDto.from(
      book,
      topReviews,
      topReviews.map((r) => r.nickname),
      similarBooks,
      otherBooksByAuthor,
      averageRating ?? 0,
      summary ?? firstPageContent,
      url,
      similarBooksUrls,
      otherBooksByAuthorUrl,
    );
  }

  async getBookSuggestions(): Promise<SimpleBookListDto> {
    const randomBookIds = getRandomNIdsUnique(6, ids);
    const books = await this.bookRepository.getBooksByIds(randomBookIds);
    const urls: (string | null)[] = await Promise.all(
      books.map((book) => this.getBookCoverImageUrlByNaverSearchApi(book.isbn)),
    );
    return SimpleBookListDto.from(books, urls);
  }

  async getAiBook(): Promise<AiBookDto> {
    const book = await this.bookRepository.getAiBook();
    console.log(book);
    if (!book) {
      throw new NotFoundException('AI 요약 책을 찾을 수 없습니다.');
    }
    const url = await this.getBookCoverImageUrlByNaverSearchApi(book.isbn);
    return AiBookDto.from(book, url);
  }
}
