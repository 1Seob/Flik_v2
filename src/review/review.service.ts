import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewRepository } from './review.repository';
import { CreateReviewPayload } from './payload/create-review.payload';
import { ReviewDto, ReviewListDto } from './dto/review.dto';
import { CreateReviewData } from './type/create-review-data.type';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { BookRepository } from 'src/book/book.repository';
import { UpdateReviewPayload } from './payload/update-review.paylaod';
import { UpdateReviewData } from './type/update-review-data.type';
import { BadWordsFilterService } from 'src/user/bad-words-filter.service';
import { MyReviewListDto } from './dto/my-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly bookRepository: BookRepository,
    private readonly badWordsFilterService: BadWordsFilterService,
  ) {}

  async createReview(
    payload: CreateReviewPayload,
    user: UserBaseInfo,
  ): Promise<ReviewDto> {
    const book = await this.bookRepository.getBookById(payload.bookId);
    if (!book) {
      throw new NotFoundException('존재하지 않는 책입니다.');
    }

    if (payload.content.length > 500) {
      throw new BadRequestException('리뷰 내용은 500자 이하여야 합니다.');
    }

    if (this.badWordsFilterService.isProfane(payload.content)) {
      throw new ConflictException(
        '리뷰 내용에 부적절한 단어가 포함되어 있습니다.',
      );
    }

    const createData: CreateReviewData = {
      userId: user.id,
      bookId: payload.bookId,
      content: payload.content,
      rating: payload.rating,
    };

    const createdReview = await this.reviewRepository.createReview(
      createData,
      user.name,
    );
    const createdReviewWithLiked = {
      ...createdReview,
      nickname: user.name,
      liked: false,
      isAuthor: true,
    };
    return ReviewDto.from(createdReviewWithLiked);
  }

  async getReviewsByBookId(
    bookId: number,
    user: UserBaseInfo,
  ): Promise<ReviewListDto> {
    const book = await this.bookRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('존재하지 않는 책입니다.');
    }
    const reviews = await this.reviewRepository.getReviewsByBookId(
      bookId,
      user.id,
    );
    return ReviewListDto.from(reviews);
  }

  async updateReview(
    id: number,
    payload: UpdateReviewPayload,
    user: UserBaseInfo,
  ): Promise<ReviewDto> {
    const review = await this.reviewRepository.getReviewById(id);
    if (!review) {
      throw new NotFoundException('존재하지 않는 리뷰입니다.');
    }

    if (review.userId !== user.id) {
      throw new ConflictException('본인이 작성한 리뷰만 수정할 수 있습니다.');
    }

    if (this.badWordsFilterService.isProfane(payload.content)) {
      throw new ConflictException(
        '리뷰 내용에 부적절한 단어가 포함되어 있습니다.',
      );
    }

    const updateData: UpdateReviewData = {
      content: payload.content,
    };

    const updatedReview = await this.reviewRepository.updateReview(
      id,
      updateData,
    );
    const updatedReviewWithLiked = {
      ...updatedReview,
      nickname: user.name,
      liked: await this.reviewRepository.isUserLikedReview(id, user.id),
      isAuthor: true,
    };
    return ReviewDto.from(updatedReviewWithLiked);
  }

  async toggleReviewLike(reviewId: number, user: UserBaseInfo): Promise<void> {
    const review = await this.reviewRepository.getReviewById(reviewId);
    if (!review) {
      throw new NotFoundException('존재하지 않는 리뷰입니다.');
    }

    await this.reviewRepository.toggleReviewLike(reviewId, user.id);
  }

  async deleteReview(id: number, user: UserBaseInfo): Promise<void> {
    const review = await this.reviewRepository.getReviewById(id);
    if (!review) {
      throw new NotFoundException('존재하지 않는 리뷰입니다.');
    }

    if (review.userId !== user.id) {
      throw new ConflictException('본인이 작성한 리뷰만 삭제할 수 있습니다.');
    }

    await this.reviewRepository.deleteReview(id);
  }

  async getUserReviews(user: UserBaseInfo): Promise<MyReviewListDto> {
    const reviews = await this.reviewRepository.getReviewsByUserId(user.id);
    return MyReviewListDto.from(reviews);
  }
}
