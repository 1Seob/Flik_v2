import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewDto, ReviewListDto } from './dto/review.dto';
import { CreateReviewPayload } from './payload/create-review.payload';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { UpdateReviewPayload } from './payload/update-review.paylaod';
import { MyReviewListDto } from './dto/my-review.dto';

@Controller('reviews')
@ApiTags('Review API')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '리뷰 생성' })
  @ApiCreatedResponse({ type: ReviewDto })
  async createReview(
    @Body() payload: CreateReviewPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ReviewDto> {
    return this.reviewService.createReview(payload, user);
  }

  @Get()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: MyReviewListDto })
  @ApiOperation({
    summary: '유저의 리뷰들 조회',
    description: '최신 리뷰가 리스트의 앞쪽에 오도록 정렬',
  })
  async getUserReviews(
    @CurrentUser() user: UserBaseInfo,
  ): Promise<MyReviewListDto> {
    return this.reviewService.getUserReviews(user);
  }

  @Get(':id')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '책의 리뷰들 조회',
    description: '최신 리뷰가 리스트의 앞쪽에 오도록 정렬',
  })
  @ApiOkResponse({ type: ReviewListDto })
  async getReviewsByBookId(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ReviewListDto> {
    return this.reviewService.getReviewsByBookId(id, user);
  }

  @Put(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '리뷰 수정' })
  async updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateReviewPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ReviewDto> {
    return this.reviewService.updateReview(id, payload, user);
  }

  @Post(':id/like')
  @Version('1')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '리뷰에 좋아요 누르기 (다시 누르면 취소)' })
  @ApiNoContentResponse()
  async toggleReviewLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.reviewService.toggleReviewLike(id, user);
  }

  @Delete(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '리뷰 삭제' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.reviewService.deleteReview(id, user);
  }
}
