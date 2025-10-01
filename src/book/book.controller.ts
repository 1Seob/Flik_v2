import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  UseGuards,
  Version,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookDto } from './dto/book.dto';
import { SaveBookPayload } from './payload/save-book.payload';
import { PatchUpdateBookPayload } from './payload/patch-update-book.payload';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { PageListDto } from 'src/sentence-like/dto/page.dto';
import { UpdatePagesPayload } from './payload/update-pages-payload';
import { SearchService } from 'src/search/search.service';
import { BookSearchQuery } from 'src/search/query/book-search-query';
import { RecommendService } from './recommend.service';
import { BookRankingListDto } from './dto/book-ranking.dto';
import { RankingService } from './ranking.service';
import { RecentBookListDto } from './dto/recent-book.dto';
import { DetailedBookDto } from './dto/detailed-book.dto';
import { SimpleBookListDto } from './dto/simple-book.dto';
import { BasicBookListDto } from './dto/basic-book.dto';
import { AiBookDto, AiBookListDto } from './dto/ai-book.dto';
import { HistoryDto } from './dto/history/history.dto';
import { HistoryService } from './history.service';
import { CompletedBookDto } from './dto/history/completed-book.dto';
import { ToggleCompletedBookPayload } from './payload/toggle-completed-book.payload';
import { PatchUpdateBookCompletionPayload } from './payload/patch-update-book-completion.payload';
import { ReadingStatusDto } from './dto/history/reading-status.dto';

@Controller('books')
@ApiTags('Book API')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly searchService: SearchService,
    private readonly recommendService: RecommendService,
    private readonly rankingService: RankingService,
    private readonly historyService: HistoryService,
  ) {}

  @Get('ai')
  @Version('1')
  @ApiOperation({ summary: 'AI 요약 포함 책 제공' })
  @ApiOkResponse({ type: AiBookDto })
  async getAiBook(): Promise<AiBookDto> {
    return this.bookService.getAiBook();
  }

  @Get('autocomplete')
  @Version('1')
  @ApiOperation({ summary: '자동완성 검색어 조회' })
  @ApiOkResponse({ type: [String] })
  async getAutocomplete(@Query() query: BookSearchQuery) {
    return this.searchService.getAutocompleteSuggestions(query.query);
  }

  @Get('history')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '유저 히스토리 조회',
    description: '가장 최근의 기록이 리스트의 앞쪽에 오도록 정렬되어 있습니다.',
  })
  @ApiOkResponse({ type: HistoryDto })
  async getUserHistory(@CurrentUser() user: UserBaseInfo): Promise<HistoryDto> {
    return this.historyService.getUserHistory(user.id);
  }

  @Get('ranking')
  @Version('1')
  @ApiOkResponse({ type: BookRankingListDto })
  @ApiOperation({ summary: '책 랭킹 조회' })
  async getBookRankings(): Promise<BookRankingListDto> {
    return this.rankingService.getBookRankings();
  }

  @Get('recent')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '유저가 최근에 읽은 책들 조회(최대 10권)',
    description:
      '가장 최근에 읽은 책이 리스트의 앞쪽에 오도록 정렬되어 있습니다.',
  })
  @ApiOkResponse({ type: RecentBookListDto })
  async getRecentBooks(
    @CurrentUser() user: UserBaseInfo,
  ): Promise<RecentBookListDto> {
    return this.bookService.getRecentBooks(user);
  }

  @Get('recommend')
  @Version('1')
  @ApiOkResponse({ type: AiBookListDto })
  @ApiOperation({ summary: '추천 책 조회' })
  async getRecommendedBooks(): Promise<AiBookListDto> {
    return this.recommendService.getRecommendedBooks();
  }

  @Get('save')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '유저가 북마크한 책 반환',
    description: '가장 최신 기록이 리스트의 앞쪽에 오도록 정렬되어 있습니다.',
  })
  @ApiOkResponse({ type: BasicBookListDto })
  async getSavedBooksByUser(
    @CurrentUser() user: UserBaseInfo,
  ): Promise<BasicBookListDto> {
    return this.bookService.getSavedBooksByUser(user.id);
  }

  @Get('search')
  @Version('1')
  @ApiOperation({ summary: '책 검색' })
  @ApiOkResponse({ type: BasicBookListDto })
  async getBooks(@Query() query: BookSearchQuery): Promise<BasicBookListDto> {
    return this.bookService.getBooks(query);
  }

  @Get('suggestions')
  @Version('1')
  @ApiOperation({ summary: '(검색 결과 없을 때) 추천 책 조회' })
  @ApiOkResponse({ type: SimpleBookListDto })
  async getBookSuggestions(): Promise<SimpleBookListDto> {
    return this.bookService.getBookSuggestions();
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: '책 조회' })
  @ApiOkResponse({ type: BookDto })
  async getBookById(@Param('id', ParseIntPipe) id: number): Promise<BookDto> {
    return this.bookService.getBookById(id);
  }

  @Post(':id/complete')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '책 완독 처리 (토글 형식)',
    description:
      'completed 필드를 true로 보내면 완독 처리, false로 보내면 완독 해제',
  })
  @ApiOkResponse({ type: CompletedBookDto })
  async completeBook(
    @Body() payload: ToggleCompletedBookPayload,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<CompletedBookDto> {
    return this.historyService.completeBook(id, payload, user.id);
  }

  @Patch(':id/completed')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '책 완독 정보(시작일, 종료일) 수정',
  })
  @ApiOkResponse({ type: CompletedBookDto })
  async updateCompletedBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: PatchUpdateBookCompletionPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<CompletedBookDto> {
    return this.historyService.updateCompletedBook(id, payload, user.id);
  }

  @Get(':id/detail')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: DetailedBookDto })
  @ApiOperation({ summary: '책 상세 조회' })
  async getDetailedBookById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<DetailedBookDto> {
    return this.bookService.getDetailedBookById(id, user.id);
  }

  @Get(':id/status')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ReadingStatusDto })
  @ApiOperation({
    summary: '책 독서 현황 조회',
    description:
      '페이지 번호가 낮은 문장 좋아요부터 리스트의 앞쪽에 오도록 정렬되어 있습니다.',
  })
  async getReadingStatusByBookId(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ReadingStatusDto> {
    return this.historyService.getReadingStatusByBookId(id, user.id);
  }

  @Get(':id/pages/download')
  @Version('1')
  @ApiOkResponse({ type: PageListDto })
  @ApiOperation({ summary: '책 원문 다운로드' })
  async getBookPages(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PageListDto> {
    return this.bookService.getBookPages(id);
  }

  /*
  @Post('save/:fileName')
  @Version('1')
  @ApiOperation({ summary: 'DB에 책 추가' })
  @ApiOkResponse({ type: BookDto })
  async saveBook(
    @Param('fileName') fileName: string,
    @Body() payload: SaveBookPayload,
  ): Promise<BookDto> {
    return this.bookService.saveBook(fileName, payload);
  }
  // 프로젝트 루트 디렉토리에 있는 원문 텍스트 파일의 이름을 fileName으로 받습니다. ex) Frankenstein.txt
  */

  @Post(':id/save')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '책 북마크' })
  @ApiOkResponse({ type: BookDto })
  async saveBookToUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<BookDto> {
    return this.bookService.saveBookToUser(id, user.id);
  }

  @Delete(':id/save')
  @Version('1')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '책 북마크 해제' })
  @ApiNoContentResponse()
  async unsaveBookFromUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.bookService.unsaveBookFromUser(id, user.id);
  }
}
