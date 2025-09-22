import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { PageData } from './type/page-type';
import { BookData } from 'src/book/type/book-data.type';
import { CreateSentenceLikePayload } from './payload/create-sentence-like.payload';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { SentenceLikeData } from './type/sentence-like-type';

@Injectable()
export class PageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getBookById(bookId: number): Promise<BookData | null> {
    return this.prisma.book.findUnique({
      where: {
        id: bookId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        views: true,
        totalPagesCount: true,
      },
    });
  }

  async getPageById(pageId: number): Promise<PageData | null> {
    return this.prisma.page.findUnique({
      where: {
        id: pageId,
      },
    });
  }

  async createSentenceLike(
    payload: CreateSentenceLikePayload,
    user: UserBaseInfo,
  ): Promise<SentenceLikeData> {
    return this.prisma.sentenceLike.create({
      data: {
        userId: user.id,
        bookId: payload.bookId,
        pageId: payload.pageId,
        text: payload.text,
        startIndex: payload.startIndex,
        endIndex: payload.endIndex,
      },
    });
  }

  async getSentenceLikeById(id: number): Promise<SentenceLikeData | null> {
    return this.prisma.sentenceLike.findUnique({
      where: {
        id,
      },
    });
  }

  async deleteSentenceLike(id: number): Promise<void> {
    await this.prisma.sentenceLike.delete({
      where: {
        id,
      },
    });
  }

  async getSentenceLikeByPageIdAndUserId(
    pageId: number,
    text: string,
    userId: string,
  ): Promise<SentenceLikeData | null> {
    return this.prisma.sentenceLike.findFirst({
      where: {
        pageId,
        text,
        userId,
      },
    });
  }

  async getSentenceLikesByUserId(userId: string): Promise<SentenceLikeData[]> {
    return this.prisma.sentenceLike.findMany({
      where: {
        userId,
      },
    });
  }
}
