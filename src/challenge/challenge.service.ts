import { Injectable, NotFoundException } from '@nestjs/common';
import { ChallengeRepository } from './challenge.repository';
import { ChallengeType } from './enums/challenge-type.enum';
import { CreateChallengePayload } from './dto/create-challenge.payload';
import {
  ChallengeStatus,
  ChallengeStatusDto,
  ChallengeStatusListDto,
} from './dto/challenge-status.dto';
import { addDays, endOfDay } from 'date-fns';

@Injectable()
export class ChallengeService {
  constructor(private readonly challengeRepository: ChallengeRepository) {}

  async setChallenge(
    userId: number,
    bookId: number,
    payload: CreateChallengePayload,
  ) {
    const count = await this.challengeRepository.getUserChallengeCount(userId);
    if (payload.challengeType !== ChallengeType.NONE && count >= 5) {
      throw new NotFoundException('챌린지는 최대 5개까지 설정할 수 있습니다.');
    }
    return this.challengeRepository.updateChallenge(
      userId,
      bookId,
      payload.challengeType,
    );
  }

  async getChallengeStatus(
    userId: number,
    bookId: number,
  ): Promise<ChallengeStatusDto> {
    const data = await this.challengeRepository.getChallenge(userId, bookId);

    if (
      !data ||
      !data.challengeStartDate ||
      !data.challengeType ||
      data.challengeType === ChallengeType.NONE
    ) {
      throw new NotFoundException('챌린지가 없습니다.');
    }
    const totalParagraphNumber =
      await this.challengeRepository.getTotalBookParagraphs(bookId);

    /* const start = new Date(data.challengeStartDate);
    const now = new Date();

    const duration = data.challengeType === ChallengeType.WEEKLY ? 7 : 28;
    const dueDate = addDays(data.challengeStartDate, duration);
    const endOfDueDay = endOfDay(dueDate);
    console.log(
      `Challenge duration: ${duration} days, End of due day: ${endOfDueDay}`,
    );
    const dDay = Math.max(
      0,
      Math.ceil(
        (start.getTime() + 86400000 * duration - now.getTime()) / 86400000,
      ),
    );

    

    const progress = Math.floor(
      (lastReadParagraphOrder / totalParagraphNumber) * duration,
    );

    let status: ChallengeStatus;
    let successDate: Date | null = null;
    let failedDate: Date | null = null;
    if (now > endOfDueDay) {
      status = 'FAILED';
      failedDate = now;
    } else if (progress === duration) {
      status = 'SUCCESS';
      successDate = now;
    } else {
      status = 'ONGOING';
    }

    return {
      dDay,
      status,
      progress,
      startDate: data.challengeStartDate,
      successDate,
      failedDate,
    }; */
    return buildChallengeStatus({
      bookId,
      challengeStartDate: data.challengeStartDate,
      challengeType: ChallengeType[data.challengeType],
      lastReadParagraphOrder: data.lastReadParagraphOrder,
      totalParagraphNumber,
    });
  }

  async getActiveChallenges(userId: number): Promise<ChallengeStatusListDto> {
    /* const challenges = await this.challengeRepository.getActiveChallenges(userId);
    return { challenges }; */
    const challenges =
      await this.challengeRepository.getActiveChallenges(userId);

    const challengeStatusList = await Promise.all(
      challenges.map(async (challenge) => {
        if (!challenge.challengeStartDate || !challenge.challengeType) {
          throw new NotFoundException('챌린지 정보가 없습니다.');
        }
        const lastRead = challenge.lastReadParagraphOrder;
        const total = await this.challengeRepository.getTotalBookParagraphs(
          challenge.bookId,
        );

        return buildChallengeStatus({
          bookId: challenge.bookId,
          challengeStartDate: challenge.challengeStartDate,
          challengeType: ChallengeType[challenge.challengeType],
          lastReadParagraphOrder: lastRead,
          totalParagraphNumber: total,
        });
      }),
    );
    return { challenges: challengeStatusList };
  }

  async getUserChallengeCount(userId: number) {
    return this.challengeRepository.getUserChallengeCount(userId);
  }

  async deleteChallenge(userId: number, bookId: number) {
    const challenge = await this.challengeRepository.getChallenge(
      userId,
      bookId,
    );
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }
    return this.challengeRepository.deleteChallenge(userId, bookId);
  }
}

function buildChallengeStatus(params: {
  bookId: number;
  challengeStartDate: Date;
  challengeType: ChallengeType;
  lastReadParagraphOrder: number;
  totalParagraphNumber: number;
  now?: Date;
}): ChallengeStatusDto {
  const {
    challengeStartDate,
    challengeType,
    lastReadParagraphOrder,
    totalParagraphNumber,
    now = new Date(),
  } = params;

  if (!challengeStartDate || challengeType === ChallengeType.NONE) {
    throw new Error('Invalid challenge data');
  }

  const duration = challengeType === ChallengeType.WEEKLY ? 7 : 28;
  const dueDate = addDays(challengeStartDate, duration);
  const endOfDueDay = endOfDay(dueDate);
  const dDay = Math.max(
    0,
    Math.ceil(
      (challengeStartDate.getTime() + 86400000 * duration - now.getTime()) /
        86400000,
    ),
  );

  const progress = Math.floor(
    ((lastReadParagraphOrder + 1) / totalParagraphNumber) * duration,
  );

  let status: ChallengeStatus;
  let successDate: Date | null = null;
  let failedDate: Date | null = null;

  if (now > endOfDueDay) {
    status = 'FAILED';
    failedDate = now;
  } else if (progress === duration) {
    status = 'SUCCESS';
    successDate = now;
  } else {
    status = 'ONGOING';
  }

  return {
    bookId: params.bookId,
    dDay,
    status,
    progress,
    startDate: challengeStartDate,
    successDate,
    failedDate,
  };
}
