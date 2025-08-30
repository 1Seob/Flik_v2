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
import { UpdateChallengePayload } from './payload/update-challenge.payload';
import { UpdateChallengeData } from './type/update-challenge-data.type';
import { ChallengeCompleteLogListDto } from './dto/challenge-complete-log.dto';
import { ChallengeCompleteLogData } from './type/challenge-complete-log-data.type';
import { format } from 'date-fns';
import { ChallengeHistoryListDto } from './dto/challenge-history.dto';
import { ParticipantData } from './type/participant-data.type';
import { ChallengeData } from './type/challenge-data.type';
import { ChallengeHistoryData } from './type/challenge-history-data.type';

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

  async joinChallenge(
    id: number,
    user: UserBaseInfo,
  ): Promise<ChallengeListDto> {
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
    return this.getUserActiveChallenges(user);
  }

  async leaveChallenge(
    id: number,
    user: UserBaseInfo,
  ): Promise<ChallengeListDto> {
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
    return this.getUserActiveChallenges(user);
  }

  async getUserActiveChallenges(user: UserBaseInfo): Promise<ChallengeListDto> {
    const challenges = await this.challengeRepository.getUserActiveChallenges(
      user.id,
    );
    return ChallengeListDto.from(challenges);
  }

  async updateChallenge(
    id: number,
    payload: UpdateChallengePayload,
    user: UserBaseInfo,
  ): Promise<ChallengeDto> {
    if (payload.name === null) {
      throw new BadRequestException('챌린지 이름은 null이 될 수 없습니다.');
    }
    if (payload.name && this.badWordsFilterService.isProfane(payload.name)) {
      throw new ConflictException(
        '챌린지 이름에 부적절한 단어가 포함되어 있습니다.',
      );
    }
    if (
      payload.name &&
      this.badWordsFilterService.hasConsecutiveSpecialChars(payload.name)
    ) {
      throw new ConflictException(
        '챌린지 이름에 연속된 특수문자가 포함되어 있습니다.',
      );
    }
    if (
      payload.name &&
      this.badWordsFilterService.startsOrEndsWithSpecialChar(payload.name)
    ) {
      throw new ConflictException(
        '챌린지 이름은 특수문자로 시작하거나 끝날 수 없습니다.',
      );
    }

    const challenge = await this.challengeRepository.getChallengeById(id);
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }
    if (challenge.hostId !== user.id) {
      throw new ForbiddenException('챌린지 주최자만 수정할 수 있습니다.');
    }

    const data: UpdateChallengeData = {
      name: payload.name,
    };
    const updatedChallenge = await this.challengeRepository.updateChallenge(
      id,
      data,
    );
    return ChallengeDto.from(updatedChallenge);
  }

  async getChallengeCompleteLogs(
    id: number,
    user: UserBaseInfo,
  ): Promise<ChallengeCompleteLogListDto> {
    const challenge = await this.challengeRepository.getChallengeById(id);
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    const isUserParticipating =
      await this.challengeRepository.isUserParticipating(id, user.id);
    if (!isUserParticipating) {
      throw new ForbiddenException('챌린지에 참여하지 않은 유저입니다.');
    }

    if (challenge.endTime < new Date()) {
      throw new ForbiddenException('챌린지가 이미 종료되었습니다.');
    }

    const participantId =
      await this.challengeRepository.getParticipantIdByUserIdAndChallengeId(
        id,
        user.id,
      );

    const logs =
      await this.challengeRepository.findChallengeExitLogs(participantId);

    const dailyProgress = new Map<string, Set<number>>();

    for (const log of logs) {
      if (!log.endedAt) {
        continue;
      }

      const dateKey = format(log.endedAt, 'yyyy-MM-dd');

      // `Set`이 없는 경우 새로 생성하는 로직을 추가
      if (!dailyProgress.has(dateKey)) {
        dailyProgress.set(dateKey, new Set<number>());
      }

      // `!`를 추가하여 get()의 결과가 null 또는 undefined가 아님을 TypeScript에 알려줌
      dailyProgress.get(dateKey)!.add(log.pageNumber);
    }

    const progressData: ChallengeCompleteLogData[] = [];
    for (const [dateString, pages] of dailyProgress.entries()) {
      progressData.push({
        date: dateString,
        pagesRead: pages.size,
      });
    }

    // 문자열로 날짜를 비교. 'YYYY-MM-DD' 형식은 문자열 정렬이 시간순 정렬과 동일함
    progressData.sort((a, b) => a.date.localeCompare(b.date));

    return ChallengeCompleteLogListDto.from(progressData);
  }

  // challenge.service.ts
  async getUserChallengeHistory(
    user: UserBaseInfo,
  ): Promise<ChallengeHistoryListDto> {
    // 1) 유저의 Join + Challenge/User 기본정보
    const joins = await this.challengeRepository.findUserJoinsWithChallenge(
      user.id,
    );
    if (joins.length === 0) {
      return ChallengeHistoryListDto.from([]);
    }

    // 2) Join.id 기준으로 max(pageNumber) 집계
    const joinIds = joins.map((j) => j.id);
    const maxMap =
      await this.challengeRepository.getMaxPageReadByJoinIds(joinIds);

    // 3) DTO로 매핑(joins 순서 = 결과 순서)
    const histories: ChallengeHistoryData[] = joins.map((j) => {
      const challengeData: ChallengeData = {
        id: j.challenge.id,
        name: j.challenge.name,
        hostId: j.challenge.hostId,
        bookId: j.challenge.bookId,
        visibility: j.challenge.visibility,
        startTime: j.challenge.startTime,
        endTime: j.challenge.endTime,
        completedAt: j.challenge.completedAt,
        cancelledAt: j.challenge.cancelledAt,
      };

      const participantData: ParticipantData = {
        id: j.id, // ChallengeJoin 레코드 ID를 "참여자 ID"로 사용
        name: j.user.name,
        maxPageRead: maxMap.get(j.id) ?? 0,
        lastLoginAt: j.user.lastLoginAt,
      };

      return {
        challengeData,
        participantData,
        participantStatus: j.status,
      };
    });

    return ChallengeHistoryListDto.from(histories);
  }
}
