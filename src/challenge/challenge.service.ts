import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ChallengeRepository } from './challenge.repository';
import { BadWordsFilterService } from 'src/user/bad-words-filter.service';
import { ChallengeDto, ChallengeListDto } from './dto/challenge.dto';
import { CreateChallengePayload } from './payload/create-challenge.payload';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { CreateChallengeData } from './type/create-challenge-data.type';
import { ParticipantListDto } from './dto/participant.dto';

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

    const count = await this.challengeRepository.getCurrentParticipatingCount(
      user.id,
    );
    if (count >= 5) {
      throw new ConflictException(
        '참가할 수 있는 챌린지 수(5개)를 초과하였습니다.',
      );
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

  async getChallengeParticipants(id: number): Promise<ParticipantListDto> {
    const challenge = await this.challengeRepository.getChallengeById(id);
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }
    const participants =
      await this.challengeRepository.getParticipantsByChallengeId(id);
    return ParticipantListDto.from(participants);
  }

  async joinChallenge(id: number, user: UserBaseInfo): Promise<void> {
    const challenge = await this.challengeRepository.getChallengeById(id);
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    if (challenge.startTime < new Date()) {
      throw new BadRequestException('챌린지가 이미 시작되었습니다.');
    }

    const isUserParticipating =
      await this.challengeRepository.isUserParticipating(id, user.id);
    if (isUserParticipating) {
      throw new ConflictException('이미 참가한 챌린지입니다.');
    }

    const count = await this.challengeRepository.getCurrentParticipatingCount(
      user.id,
    );
    if (count >= 5) {
      throw new ConflictException(
        '참가할 수 있는 챌린지 수(5개)를 초과하였습니다.',
      );
    }

    await this.challengeRepository.joinChallenge(id, user.id);
  }

  async leaveChallenge(id: number, user: UserBaseInfo): Promise<void> {
    const challenge = await this.challengeRepository.getChallengeById(id);
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    const isUserParticipating =
      await this.challengeRepository.isUserParticipating(id, user.id);
    if (!isUserParticipating) {
      throw new ConflictException('참가하지 않은 챌린지입니다.');
    }

    if (challenge.hostId === user.id) {
      throw new ConflictException('챌린지 주최자는 포기할 수 없습니다.');
    }

    if (new Date() < challenge.startTime) {
      //챌린지 시작 이전
      await this.challengeRepository.leaveChallenge(id, user.id);
    }
    if (challenge.startTime <= new Date()) {
      //챌린지 시작 이후
      await this.challengeRepository.updateChallengeJoinStatus(id, user.id);
    }
  }

  async getUserActiveChallenges(user: UserBaseInfo): Promise<ChallengeListDto> {
    const challenges = await this.challengeRepository.getUserActiveChallenges(
      user.id,
    );
    return ChallengeListDto.from(challenges);
  }
}
