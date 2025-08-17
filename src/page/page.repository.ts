import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { PageData } from './type/page-type';

@Injectable()
export class PageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPage(pageId: number): Promise<PageData | null> {
    return this.prisma.page.findUnique({
      where: {
        id: pageId,
      },
    });
  }
}
