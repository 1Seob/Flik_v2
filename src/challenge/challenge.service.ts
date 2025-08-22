import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ChallengeRepository } from './challenge.repository';
import { BadWordsFilterService } from 'src/user/bad-words-filter.service';
import { ChallengeDto } from './dto/challenge.dto';
import { CreateChallengePayload } from './payload/create-challenge.payload';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { CreateChallengeData } from './type/create-challenge-data.type';

@Injectable()
export class ChallengeService {
  constructor(
    private readonly challengeRepository: ChallengeRepository,
    private readonly badWordsFilterService: BadWordsFilterService,
  ) {}

  async createChallenge(
    payload: CreateChallengePayload,
    user: UserBaseInfo,
  ): Promise<ChallengeDto> {
    const book = await this.challengeRepository.getBookById(payload.bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    if (this.badWordsFilterService.isProfane(payload.name)) {
      throw new ConflictException(
        '챌린지 이름에 부적절한 단어가 포함되어 있습니다.',
      );
    }
    if (this.badWordsFilterService.hasConsecutiveSpecialChars(payload.name)) {
      throw new ConflictException(
        '챌린지 이름에 연속된 특수문자가 포함되어 있습니다.',
      );
    }
    if (this.badWordsFilterService.startsOrEndsWithSpecialChar(payload.name)) {
      throw new ConflictException(
        '챌린지 이름은 특수문자로 시작하거나 끝날 수 없습니다.',
      );
    }
    if (payload.startTime >= payload.endTime) {
      throw new BadRequestException('시작 시간은 종료 시간보다 빨라야 합니다.');
    }
    if (payload.startTime < new Date()) {
      throw new BadRequestException('시작 시간은 현재 시간보다 늦어야 합니다.');
    }
    const data: CreateChallengeData = {
      hostId: user.id,
      name: payload.name,
      bookId: payload.bookId,
      visibility: payload.visibility,
      startTime: payload.startTime,
      endTime: payload.endTime,
    };

    const challenge = await this.challengeRepository.createChallenge(data);
    return ChallengeDto.from(challenge);
  }

  async getChallengeById(id: number): Promise<ChallengeDto> {
    const challenge = await this.challengeRepository.getChallengeById(id);
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }
    return ChallengeDto.from(challenge);
  }

  async deleteChallenge(id: number, user: UserBaseInfo): Promise<void> {
    //챌린지 기획 확정 이후 예외 처리 수정 필요
    const challenge = await this.challengeRepository.getChallengeById(id);
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }
    if (challenge.hostId !== user.id) {
      throw new ForbiddenException('챌린지 주최자만 삭제할 수 있습니다.');
    }
    await this.challengeRepository.deleteChallenge(id);
  }
}
