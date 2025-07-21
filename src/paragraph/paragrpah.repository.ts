import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { ParagraphData } from './type/paragraph-type';

@Injectable()
export class ParagraphRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getParagraph(paragraphId: number): Promise<ParagraphData | null> {
    return this.prisma.paragraph.findUnique({
      where: {
        id: paragraphId,
      },
    });
  }

  async toggleParagraphLike(
    paragraphId: number,
    userId: number,
  ): Promise<void> {
    const like = await this.prisma.paragraphLike.findUnique({
      where: {
        userId_paragraphId: {
          userId,
          paragraphId,
        },
      },
    });
    if (like) {
      await this.prisma.paragraphLike.delete({
        where: {
          userId_paragraphId: {
            userId,
            paragraphId,
          },
        },
      });
    } else {
      await this.prisma.paragraphLike.create({
        data: {
          paragraphId,
          userId,
        },
      });
    }
  }

  async getParagraphLikeCount(paragraphId: number): Promise<number> {
    return this.prisma.paragraphLike.count({
      where: {
        paragraphId,
      },
    });
  }

  async getLikedParagraphIdsByUser(userId: number): Promise<number[]> {
    const likes = await this.prisma.paragraphLike.findMany({
      where: { userId },
      select: { paragraphId: true },
    });
    return likes.map((like) => like.paragraphId);
  }
}
