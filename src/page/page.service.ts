import { Injectable, NotFoundException } from '@nestjs/common';
import { PageRepository } from './page.repository';
import { PageDto } from './dto/page.dto';

@Injectable()
export class PageService {
  constructor(private readonly pageRepository: PageRepository) {}

  async getPage(pageId: number): Promise<PageDto> {
    const page = await this.pageRepository.getPage(pageId);

    if (!page) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }

    const book = await this.pageRepository.getBookById(page.bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    return PageDto.from(page);
  }
}
