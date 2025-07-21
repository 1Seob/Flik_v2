import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookRepository } from './book.repository';
import { UserRepository } from 'src/user/user.repository';
import { BookDto, BookListDto } from './dto/book.dto';
import { SaveBookPayload } from './payload/save-book.payload';
import { SaveBookData } from './type/save-book-data.type';
import { parsing, distributeParagraphs } from './parsing';
import { PatchUpdateBookPayload } from './payload/patch-update-book.payload';
import { UpdateBookData } from './type/update-book-data.type';
import { BookQuery } from './query/book.query';
import { MetadataListDto } from './dto/metadata.dto';
import { SupabaseService } from 'src/common/services/supabase.service';

@Injectable()
export class BookService {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly userRepository: UserRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getBookById(bookId: number): Promise<BookDto> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    return BookDto.from(book);
  }

  async saveBook(
    fileName: string,
    payload: SaveBookPayload,
    coverImageFile?: Express.Multer.File,
  ): Promise<BookDto> {
    const isBookExist = await this.bookRepository.getBookByTitleAndAuthor(
      payload.title,
      payload.author,
    );
    if (isBookExist) {
      throw new ConflictException('이미 존재하는 책입니다.');
    }

    let coverImageUrl: string | undefined = undefined;

    if (coverImageFile) {
      const { data, error } = await this.supabaseService.uploadImage(
        'book-covers',
        coverImageFile.originalname,
        coverImageFile.buffer,
      );
      if (error) {
        throw new BadRequestException('이미지 업로드 실패');
      }
      coverImageUrl = data?.path
        ? this.supabaseService.getPublicUrl('book-covers', data.path)
        : undefined;
    }

    const paragraphs = parsing(fileName);
    const data: SaveBookData = {
      title: payload.title,
      author: payload.author,
      coverImageUrl,
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

  async patchUpdateBook(
    bookId: number,
    payload: PatchUpdateBookPayload,
    coverImageFile?: Express.Multer.File, // 표지 이미지 파일
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

    let coverImageUrl = book.coverImageUrl;

    // 파일 업로드 전, coverImageFile이 제대로 전달되는지 확인
    console.log('📂 파일 업로드 요청 받음:', coverImageFile);

    if (coverImageFile) {
      // 기존 표지 이미지가 있다면 Supabase에서 삭제
      if (book.coverImageUrl) {
        await this.supabaseService.deleteImage(
          'book-covers',
          book.coverImageUrl,
        );
      }

      // Supabase 업로드 실행 전, 파일 이름과 버퍼 확인
      console.log('📂 업로드할 파일 이름:', coverImageFile.originalname);
      console.log('📂 업로드할 파일 크기:', coverImageFile.size);

      // 새 표지 이미지 업로드
      const { data, error } = await this.supabaseService.uploadImage(
        'book-covers',
        coverImageFile.originalname,
        coverImageFile.buffer,
      );

      if (error) {
        console.error('⚠️ Supabase 업로드 실패:', error);
        throw new BadRequestException('이미지 업로드 실패');
      }

      coverImageUrl = data?.path
        ? this.supabaseService.getPublicUrl('book-covers', data.path)
        : undefined;
    }

    const data: UpdateBookData = {
      title: payload.title,
      author: payload.author,
      coverImageUrl,
    };

    const updatedBook = await this.bookRepository.updateBook(bookId, data);
    return BookDto.from(updatedBook);
  }

  async getBooks(query: BookQuery): Promise<BookListDto> {
    const books = await this.bookRepository.getBooks(query);
    return BookListDto.from(books);
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

    const count = await this.bookRepository.getParagraphCountByBookId(bookId);
    return count;
  }

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

  async saveBookToUser(bookId: number, userId: number): Promise<void> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    await this.bookRepository.saveBookToUser(userId, bookId);
  }

  async unsaveBookFromUser(bookId: number, userId: number): Promise<void> {
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

  async getSavedBookIdsByUser(userId: number): Promise<number[]> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return this.bookRepository.getSavedBookIdsByUser(userId);
  }
}
