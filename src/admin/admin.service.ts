import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { parsePagesFromJson } from 'src/book/parsing';
import { PatchUpdateBookPayload } from 'src/book/payload/patch-update-book.payload';
import { BookDto } from 'src/book/dto/book.dto';
import { UpdateBookData } from 'src/book/type/update-book-data.type';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async updateBookPages(bookId: number, fileName: string): Promise<void> {
    const book = await this.adminRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    const pages = parsePagesFromJson(fileName);
    await this.adminRepository.updateBookPages(bookId, pages);
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

    const book = await this.adminRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    const data: UpdateBookData = {
      title: payload.title,
      author: payload.author,
      isbn: payload.isbn ?? null,
      totalPagesCount: payload.totalPages,
    };

    const updatedBook = await this.adminRepository.updateBook(bookId, data);
    return BookDto.from(updatedBook, null);
  }

  async deleteBook(bookId: number): Promise<void> {
    const book = await this.adminRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    await this.adminRepository.deleteBook(bookId);
  }
}
