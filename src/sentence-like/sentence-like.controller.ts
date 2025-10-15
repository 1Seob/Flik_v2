import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Version,
  Post,
  UseGuards,
  Body,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { SentenceLikeService } from './sentence-like.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateSentenceLikePayload } from './payload/create-sentence-like.payload';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { SentenceLikeDto, SentenceLikeListDto } from './dto/sentence-like.dto';

@Controller('sentence-likes')
@ApiTags('SentenceLike API')
export class SentenceLikeController {
  constructor(private readonly sentenceLikeService: SentenceLikeService) {}

  @Post()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: SentenceLikeDto })
  @ApiOperation({ summary: '문장 좋아요 생성' })
  async createSentenceLike(
    @Body() payload: CreateSentenceLikePayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<SentenceLikeDto> {
    return this.sentenceLikeService.createSentenceLike(payload, user);
  }

  @Get('book/:id')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SentenceLikeListDto })
  @ApiOperation({
    summary: '책에 대한 유저의 문장 좋아요들 조회',
    description:
      'id는 책 ID입니다. 인덱스가 있는 이유는 실제 페이지의 text와 일치하는 지 체크하기 위함입니다.',
  })
  async getUserSentenceLikesByBookId(
    @Param('id', ParseIntPipe) bookId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<SentenceLikeListDto> {
    return this.sentenceLikeService.getUserSentenceLikesByBookId(bookId, user);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: '문장 좋아요 조회' })
  @ApiOkResponse({ type: SentenceLikeDto })
  async getSentenceLikeById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SentenceLikeDto> {
    return this.sentenceLikeService.getSentenceLikeById(id);
  }

  @Delete(':id')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '문장 좋아요 삭제' })
  @ApiNoContentResponse()
  async deleteSentenceLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.sentenceLikeService.deleteSentenceLike(id, user);
  }
}
