import {
  Body,
  Controller,
  Post,
  Get,
  Version,
  UseGuards,
  ParseIntPipe,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReadService } from './read.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateReadingStartLogPayload } from './payload/create-reading-start-log.payload';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { CreateReadingEndLogPayload } from './payload/create-reading-end-log.payload';
import { ReadingLogDto } from './dto/reading-log.dto';
import { DateQuery } from './query/date.query';
import { ReadingProgressListDto } from './dto/reading-progress.dto';
import { CalendarQuery } from './query/calendar.query';
import { ReadingStreakDto } from './dto/reading-streak.dto';
import { LastPageDto } from './dto/last-page-dto';

@Controller('read')
@ApiTags('Read API')
export class ReadController {
  constructor(private readonly readService: ReadService) {}

  @Get('calendar')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저의 독서 캘린더 조회' })
  @ApiOkResponse({ type: [String] })
  async getReadingCalendar(
    @Query() calendarQuery: CalendarQuery,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<string[]> {
    return this.readService.getReadingCalendar(calendarQuery, user);
  }

  @Get('date')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '날짜별 읽기 진행률 조회' })
  @ApiOkResponse({ type: ReadingProgressListDto })
  async getReadingProgressLogsByDate(
    @Query() dateQuery: DateQuery,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ReadingProgressListDto> {
    return this.readService.getReadingProgressLogsByDate(dateQuery, user);
  }

  @Get('last-page/:id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '책의 마지막으로 진입한 페이지 조회 (이어읽기)' })
  @ApiOkResponse({ type: LastPageDto })
  async getLastPage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<LastPageDto> {
    return this.readService.getLastPage(id, user);
  }

  @Post('start')
  @ApiOperation({ summary: '페이지 읽기 진입 로그 생성' })
  @ApiOkResponse({ type: ReadingLogDto })
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createReadingStartLog(
    @Body() payload: CreateReadingStartLogPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ReadingLogDto> {
    return this.readService.createReadingStartLog(payload, user);
  }

  @Get('streak')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '독서 연속성(streak) 데이터 조회' })
  @ApiOkResponse({ type: ReadingStreakDto })
  async getReadingStreak(
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ReadingStreakDto> {
    return this.readService.getReadingStreak(user);
  }

  @Post('end')
  @ApiOperation({ summary: '페이지 읽기 종료 로그 생성' })
  @ApiOkResponse({ type: ReadingLogDto })
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createReadingEndLog(
    @Body() payload: CreateReadingEndLogPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ReadingLogDto> {
    return this.readService.createReadingEndLog(payload, user);
  }
}
