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
import {
  ReadingProgressDto,
  ReadingProgressListDto,
} from './dto/reading-progress.dto';
import {
  endOfDay,
  endOfMonth,
  formatISO,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  subDays,
} from 'date-fns';
import { BookData } from 'src/book/type/book-data.type';
import { ReadingProgressData } from './type/reading-progress-data.type';
import { ReadingLogData } from './type/reading-log-data.type';
import { CalendarQuery } from './query/calendar.query';
import { ReadingStreakDto } from './dto/reading-streak.dto';
import { format, toZonedTime } from 'date-fns-tz';
import { ReadingStreakData } from './type/reading-streak-data.type';
import { CreateReadingStartLogData } from './type/create-reading-start-log-data.typte';
import { CreateReadingEndLogData } from './type/create-reading-end-log-data.type';
import { LastPageDto } from './dto/last-page-dto';
import { PageData } from 'src/sentence-like/type/page-type';

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

    const createData: CreateReadingStartLogData = {
      userId: user.id,
      bookId: payload.bookId,
      pageId: payload.pageId,
      pageNumber: payload.pageNumber,
    };

    const log = await this.readRepository.createReadingStartLog(createData);
    return ReadingLogDto.from(log);
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

    const createData: CreateReadingEndLogData = {
      userId: user.id,
      bookId: payload.bookId,
      pageId: payload.pageId,
      pageNumber: payload.pageNumber,
      durationSec: payload.durationSec,
    };

    const log = await this.readRepository.createReadingEndLog(createData);
    return ReadingLogDto.from(log);
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
    const normalLogs = await this.readRepository.getNormalLogsWithBookByDate(
      kstStart,
      kstEnd,
      user,
    );

    const normalProgress = this.processLogsToProgressData(normalLogs);

    return ReadingProgressListDto.from(normalProgress);
  }

  async getReadingCalendar(
    calendarQuery: CalendarQuery,
    user: UserBaseInfo,
  ): Promise<string[]> {
    // 1. 해당 월의 시작일과 종료일 계산
    const monthStart = startOfMonth(
      new Date(calendarQuery.year, calendarQuery.month - 1),
    );
    const monthEnd = endOfMonth(monthStart);

    // 2. 해당 월의 로그 중 날짜 필드만 조회
    const logs = await this.readRepository.getMonthlyReadingLogs(
      monthStart,
      monthEnd,
      user,
    );
    const readingDaysSet = new Set<string>();
    const monthInterval = { start: monthStart, end: monthEnd };

    for (const log of logs) {
      if (log.startedAt && isWithinInterval(log.startedAt, monthInterval)) {
        // "YYYY-MM-DD" 형식으로 변환하여 Set에 추가
        readingDaysSet.add(
          formatISO(log.startedAt, { representation: 'date' }),
        );
      }
      if (log.endedAt && isWithinInterval(log.endedAt, monthInterval)) {
        readingDaysSet.add(formatISO(log.endedAt, { representation: 'date' }));
      }
    }

    // 4. Set을 배열로 변환하고 정렬하여 반환
    return Array.from(readingDaysSet).sort();
  }

  private processLogsToProgressData(
    logsWithBook: (ReadingLogData & { book: BookData })[],
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
        lastPageNumber: maxPage,
      });
    }
    return readingProgressList;
  }

  async getReadingStreak(user: UserBaseInfo): Promise<ReadingStreakDto> {
    const KOREA_TIMEZONE = 'Asia/Seoul';
    const streakData = await this.readRepository.getReadingStreak(user);
    if (!streakData) {
      await this.readRepository.initReadingStreak(user.id);
    }
    // 긴 스트릭을 커버하기 위해 충분한 기간(400일)의 데이터를 조회
    const readingDates = await this.readRepository.findUniqueReadingDates(
      user.id,
      400,
    );

    if (readingDates.length === 0) {
      const data: ReadingStreakData = {
        currentStreak: 0,
        readToday: false,
        longestStreak: streakData ? streakData.days : 0,
        lastUpdatedAt: streakData ? streakData.updatedAt : new Date(0),
      };
      return ReadingStreakDto.from(data);
    }

    const readingDateSet = new Set(
      readingDates.map((date) => {
        // 함수 호출을 'toZonedTime'으로 변경합니다.
        const kstDate = toZonedTime(date, KOREA_TIMEZONE);
        return format(kstDate, 'yyyy-MM-dd');
      }),
    );

    const today = toZonedTime(new Date(), KOREA_TIMEZONE);
    const todayStr = format(today, 'yyyy-MM-dd');
    const readToday = readingDateSet.has(todayStr);

    let currentStreak = 0;
    // 연속일 계산 시작점: 오늘 읽었으면 오늘부터, 안 읽었으면 어제부터 확인
    let dateToCheck = readToday ? today : subDays(today, 1);

    while (readingDateSet.has(format(dateToCheck, 'yyyy-MM-dd'))) {
      currentStreak++;
      dateToCheck = subDays(dateToCheck, 1);
    }
    // 현재 연속일이 기존 기록보다 길면 업데이트
    if (streakData && currentStreak > streakData.days) {
      const updatedData = await this.readRepository.updateReadingStreak(
        user.id,
        currentStreak,
      );
      const data: ReadingStreakData = {
        currentStreak: currentStreak,
        readToday: readToday,
        longestStreak: updatedData.days,
        lastUpdatedAt: updatedData.updatedAt,
      };
      return ReadingStreakDto.from(data);
    }

    const data: ReadingStreakData = {
      currentStreak: currentStreak,
      readToday: readToday,
      longestStreak: streakData ? streakData.days : currentStreak,
      lastUpdatedAt: streakData ? streakData.updatedAt : new Date(0),
    };
    return ReadingStreakDto.from(data);
  }

  async getLastPage(bookId: number, user: UserBaseInfo): Promise<LastPageDto> {
    const book = await this.readRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    await this.readRepository.incrementBookViews(bookId, book.title);

    const likedSentences = await this.readRepository.getLikedSentencesByBookId(
      bookId,
      user.id,
    );

    const lastPage = await this.readRepository.getLastNormalPage(
      bookId,
      user.id,
    );
    if (!lastPage) {
      const firstPage = await this.readRepository.getFirstPageOfBook(bookId);
      if (!firstPage) {
        throw new NotFoundException('책의 첫 페이지를 찾을 수 없습니다.');
      }
      return LastPageDto.from(firstPage, likedSentences);
    }
    return LastPageDto.from(lastPage, likedSentences);
  }

  async getReadingProgressByBookId(
    bookId: number,
    user: UserBaseInfo,
  ): Promise<ReadingProgressDto> {
    const book = await this.readRepository.getBookById(bookId);
    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }
    const lastPage = await this.readRepository.getLastNormalPage(
      bookId,
      user.id,
    );
    if (!lastPage) {
      return ReadingProgressDto.from({
        book: book,
        lastPageNumber: 0,
      } as ReadingProgressData);
    }
    const data: ReadingProgressData = {
      book: book,
      lastPageNumber: lastPage.number,
    };
    return ReadingProgressDto.from(data);
  }

  async getReadingProgress(
    user: UserBaseInfo,
  ): Promise<ReadingProgressListDto> {
    const lastPages = await this.readRepository.getAllLastNormalPagesWithBooks(
      user.id,
    );
    if (lastPages.length === 0) {
      return ReadingProgressListDto.from([]);
    }
    const data: ReadingProgressData[] = lastPages.map((lastPage) => {
      return {
        book: lastPage.book,
        lastPageNumber: lastPage.number,
      };
    });
    return ReadingProgressListDto.from(data);
  }
}
