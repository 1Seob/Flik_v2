import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SentenceLikeRepository } from './sentence-like.repository';
import { PageDto } from './dto/page.dto';
import { CreateSentenceLikePayload } from './payload/create-sentence-like.payload';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { SentenceLikeDto, SentenceLikeListDto } from './dto/sentence-like.dto';

@Injectable()
export class SentenceLikeService {
  constructor(
    private readonly sentenceLikeRepository: SentenceLikeRepository,
  ) {}

  async getPageById(pageId: number): Promise<PageDto> {
    const page = await this.sentenceLikeRepository.getPageById(pageId);

    if (!page) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }

    const book = await this.sentenceLikeRepository.getBookById(page.bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    return PageDto.from(page);
  }

  async createSentenceLike(
    payload: CreateSentenceLikePayload,
    user: UserBaseInfo,
  ): Promise<SentenceLikeDto> {
    const book = await this.sentenceLikeRepository.getBookById(payload.bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    const page = await this.sentenceLikeRepository.getPageById(payload.pageId);
    if (!page) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }
    if (payload.bookId !== page.bookId) {
      throw new BadRequestException('책 ID가 일치하지 않습니다.');
    }
    const isSentenceExists =
      await this.sentenceLikeRepository.getSentenceLikeByPageIdAndUserId(
        payload.pageId,
        payload.text,
        user.id,
      );
    if (isSentenceExists) {
      throw new BadRequestException('이미 좋아요를 눌렀습니다.');
    }
    const data = await this.sentenceLikeRepository.createSentenceLike(
      payload,
      user,
    );
    return SentenceLikeDto.from(data);
  }

  async deleteSentenceLike(id: number, user: UserBaseInfo): Promise<void> {
    const like = await this.sentenceLikeRepository.getSentenceLikeById(id);
    if (!like) {
      throw new NotFoundException('문장 좋아요를 찾을 수 없습니다.');
    }

    if (like.userId !== user.id) {
      throw new BadRequestException('본인의 좋아요만 삭제할 수 있습니다.');
    }

    return this.sentenceLikeRepository.deleteSentenceLike(id);
  }
}
