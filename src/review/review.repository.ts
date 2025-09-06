import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateReviewData } from './type/create-review-data.type';
import { ReviewData } from './type/review-data.type';
import { UpdateReviewData } from './type/update-review-data.type';
import { ReviewWithLikedData } from './type/review-with-liked-data.type';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(data: CreateReviewData): Promise<ReviewData> {
    const review = await this.prisma.review.create({
      data: {
        userId: data.userId,
        bookId: data.bookId,
        content: data.content,
        rating: data.rating,
        createdAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        bookId: true,
        content: true,
        createdAt: true,
        rating: true,
      },
    });
    return {
      id: review.id,
      userId: review.userId,
      bookId: review.bookId,
      content: review.content,
      createdAt: review.createdAt,
      likeCount: 0, // 초기 좋아요 수는 0
      rating: review.rating.toNumber(),
    };
  }

  async getReviewsByBookId(
    bookId: number,
    userId: string,
  ): Promise<ReviewWithLikedData[]> {
    const reviews = await this.prisma.review.findMany({
      where: { bookId },
      include: {
        _count: {
          select: { likedBy: true },
        },
        likedBy: {
          where: { userId: userId }, // 현재 유저만 필터링
          select: { id: true }, // 존재 여부만 확인
        },
      },
    });

    return reviews.map((review) => ({
      id: review.id,
      userId: review.userId,
      bookId: review.bookId,
      content: review.content,
      createdAt: review.createdAt,
      likeCount: review._count.likedBy,
      liked: review.likedBy.length > 0, // 한 번에 Boolean 계산
      rating: review.rating.toNumber(),
    }));
  }

  async getReviewById(id: number): Promise<ReviewData | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        _count: {
          select: { likedBy: true },
        },
      },
    });

    if (!review) return null;

    return {
      id: review.id,
      userId: review.userId,
      bookId: review.bookId,
      content: review.content,
      createdAt: review.createdAt,
      likeCount: review._count.likedBy,
      rating: review.rating.toNumber(),
    };
  }

  async updateReview(id: number, data: UpdateReviewData): Promise<ReviewData> {
    const review = await this.prisma.review.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { likedBy: true },
        },
      },
    });

    return {
      id: review.id,
      userId: review.userId,
      bookId: review.bookId,
      content: review.content,
      createdAt: review.createdAt,
      likeCount: review._count.likedBy,
      rating: review.rating.toNumber(),
    };
  }

  async toggleReviewLike(reviewId: number, userId: string): Promise<void> {
    const like = await this.prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    if (like) {
      await this.prisma.reviewLike.delete({
        where: {
          userId_reviewId: {
            userId,
            reviewId,
          },
        },
      });
    } else {
      await this.prisma.reviewLike.create({
        data: {
          reviewId,
          userId,
        },
      });
    }
  }

  async deleteReview(id: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.reviewLike.deleteMany({
        where: { reviewId: id },
      }),
      this.prisma.review.delete({
        where: { id },
      }),
    ]);
  }

  async isUserLikedReview(reviewId: number, userId: string): Promise<boolean> {
    const like = await this.prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });
    return !!like;
  }
}
