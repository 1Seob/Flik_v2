import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReadRepository } from './read.repository';
import { CreateReadingStartLogPayload } from './payload/create-reading-start-log.payload';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { CreateReadingEndLogPayload } from './payload/create-reading-end-log.payload';
import { ReadingLogDto, ReadingLogListDto } from './dto/reading-log.dto';
import { DateQuery } from './query/date.query';
import { ReadingProgressListDto } from './dto/reading-progress.dto';
import { endOfDay, startOfDay } from 'date-fns';
import { BookData } from 'src/book/type/book-data.type';
import { ReadingProgressData } from './type/reading-progress-data.type';
import { ReadingLogData } from './type/reading-log-data.type';

@Injectable()
export class ReadService {
  constructor(private readonly readRepository: ReadRepository) {}

  async createReadingStartLog(
    payload: CreateReadingStartLogPayload,
    user: UserBaseInfo,
  ): Promise<ReadingLogDto> {
    const book = await this.readRepository.getBookById(payload.bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    const page = await this.readRepository.getPageById(payload.pageId);
    if (!page) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }

    if (payload.bookId !== page.bookId) {
      throw new BadRequestException('책 ID가 일치하지 않습니다.');
    }
    if (payload.pageNumber !== page.number) {
      throw new BadRequestException('페이지 번호가 일치하지 않습니다.');
    }

    if (payload.participantId) {
      const challenge = await this.readRepository.getChallengeByParticipantId(
        payload.participantId,
      );
      if (!challenge) {
        throw new NotFoundException('챌린지를 찾을 수 없습니다.');
      }
      if (challenge.bookId !== book.id) {
        throw new BadRequestException('챌린지와 책이 일치하지 않습니다.');
      }
      const isUserParticipating = await this.readRepository.isUserParticipating(
        challenge.id,
        user.id,
      );
      if (!isUserParticipating) {
        throw new BadRequestException(
          '사용자가 챌린지에 참여하고 있지 않습니다.',
        );
      }
    }

    const data = await this.readRepository.createReadingStartLog(payload, user);
    return ReadingLogDto.from(data);
  }

  async createReadingEndLog(
    payload: CreateReadingEndLogPayload,
    user: UserBaseInfo,
  ): Promise<ReadingLogDto> {
    const book = await this.readRepository.getBookById(payload.bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    const page = await this.readRepository.getPageById(payload.pageId);
    if (!page) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }

    if (payload.bookId !== book.id) {
      throw new BadRequestException('책 ID가 일치하지 않습니다.');
    }
    if (payload.pageNumber !== page.number) {
      throw new BadRequestException('페이지 번호가 일치하지 않습니다.');
    }

    if (payload.participantId) {
      const challenge = await this.readRepository.getChallengeByParticipantId(
        payload.participantId,
      );
      if (!challenge) {
        throw new NotFoundException('챌린지를 찾을 수 없습니다.');
      }
      if (challenge.bookId !== book.id) {
        throw new BadRequestException('챌린지와 책이 일치하지 않습니다.');
      }
      const isUserParticipating = await this.readRepository.isUserParticipating(
        challenge.id,
        user.id,
      );
      if (!isUserParticipating) {
        throw new BadRequestException(
          '사용자가 챌린지에 참여하고 있지 않습니다.',
        );
      }
    }

    const data = await this.readRepository.createReadingEndLog(payload, user);
    return ReadingLogDto.from(data);
  }

  async getReadingLog(id: number): Promise<ReadingLogDto> {
    const log = await this.readRepository.getReadingLog(id);
    if (!log) {
      throw new NotFoundException('존재하지 않는 읽기 로그입니다.');
    }
    return ReadingLogDto.from(log);
  }

  async deleteReadingLog(id: number): Promise<void> {
    const log = await this.readRepository.getReadingLog(id);
    if (!log) {
      throw new NotFoundException('존재하지 않는 읽기 로그입니다.');
    }
    await this.readRepository.deleteReadingLog(id);
  }

  async getReadingLogsByBookId(
    bookId: number,
    user: UserBaseInfo,
  ): Promise<ReadingLogListDto> {
    const logs = await this.readRepository.getReadingLogsByBookId(bookId, user);
    return ReadingLogListDto.from(logs);
  }

  async getReadingProgressLogsByDate(
    dateQuery: DateQuery,
    user: UserBaseInfo,
  ): Promise<ReadingProgressListDto> {
    const kstStart = startOfDay(
      new Date(dateQuery.year, dateQuery.month - 1, dateQuery.day),
    );
    const kstEnd = endOfDay(
      new Date(dateQuery.year, dateQuery.month - 1, dateQuery.day),
    );
    const [normalLogs, challengeLogs] = await Promise.all([
      this.readRepository.getNormalLogsWithBookByDate(kstStart, kstEnd, user),
      this.readRepository.getChallengeLogsWithBookByDate(
        kstStart,
        kstEnd,
        user,
      ),
    ]);

    const normalProgress = this.processLogsToProgressData(normalLogs, false);
    const challengeProgress = this.processLogsToProgressData(
      challengeLogs,
      true,
    );

    return ReadingProgressListDto.from([
      ...normalProgress,
      ...challengeProgress,
    ]);
  }

  private processLogsToProgressData(
    logsWithBook: (ReadingLogData & { book: BookData })[],
    isChallenge: boolean,
  ): ReadingProgressData[] {
    // 책 ID를 키로 사용하여 최대 페이지 번호와 책 정보를 저장할 Map
    const progressMap = new Map<number, { book: BookData; maxPage: number }>();

    for (const log of logsWithBook) {
      // 이미 맵에 해당 책이 있는지 확인
      const existingEntry = progressMap.get(log.bookId);

      if (existingEntry) {
        // 있다면, 현재 로그의 페이지 번호와 기존 최대 페이지 번호를 비교하여 더 큰 값으로 업데이트
        existingEntry.maxPage = Math.max(existingEntry.maxPage, log.pageNumber);
      } else {
        // 없다면, 새로운 엔트리로 추가
        progressMap.set(log.bookId, {
          book: log.book,
          maxPage: log.pageNumber,
        });
      }
    }

    // Map의 데이터를 ReadingProgressData 형식의 배열로 변환
    const readingProgressList: ReadingProgressData[] = [];
    for (const { book, maxPage } of progressMap.values()) {
      // 달성률 계산 (전체 페이지가 0인 경우 0으로 처리)
      const progress =
        book.totalPagesCount > 0 ? (maxPage / book.totalPagesCount) * 100 : 0;

      readingProgressList.push({
        book: book,
        maxPageRead: maxPage,
        progress: Math.min(progress, 100), // 100%를 넘지 않도록 처리
        challengeParticipation: isChallenge, // 요구사항에 따라 false로 고정
      });
    }
    return readingProgressList;
  }
}
