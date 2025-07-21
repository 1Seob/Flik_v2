import { Injectable, NotFoundException } from '@nestjs/common';
import { ParagraphRepository } from './paragrpah.repository';
import { ParagraphDto } from './dto/paragraph.dto';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class ParagraphService {
  constructor(
    private readonly paragraphRepository: ParagraphRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async getParagraph(paragraphId: number): Promise<ParagraphDto> {
    const paragraph = await this.paragraphRepository.getParagraph(paragraphId);

    if (!paragraph) {
      throw new NotFoundException('문단을 찾을 수 없습니다.');
    }

    return ParagraphDto.from(paragraph);
  }

  async toggleParagraphLike(
    paragraphId: number,
    user: UserBaseInfo,
  ): Promise<void> {
    const paragraph = await this.paragraphRepository.getParagraph(paragraphId);
    if (!paragraph) {
      throw new NotFoundException('문단을 찾을 수 없습니다.');
    }
    await this.paragraphRepository.toggleParagraphLike(paragraphId, user.id);
  }

  async getParagraphLikeCount(paragraphId: number): Promise<number> {
    const paragraph = await this.paragraphRepository.getParagraph(paragraphId);
    if (!paragraph) {
      throw new NotFoundException('문단을 찾을 수 없습니다.');
    }
    return this.paragraphRepository.getParagraphLikeCount(paragraphId);
  }

  async getLikedParagraphIdsByUser(userId: number): Promise<number[]> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return this.paragraphRepository.getLikedParagraphIdsByUser(userId);
  }
}
