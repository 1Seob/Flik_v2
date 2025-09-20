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
import { BookDto, BookListDto } from './dto/book.dto';
import { SaveBookPayload } from './payload/save-book.payload';
import { PatchUpdateBookPayload } from './payload/patch-update-book.payload';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { PageListDto } from 'src/page/dto/page.dto';
import { UpdatePagesPayload } from './payload/update-pages-payload';
import { SearchService } from 'src/search/search.service';
import { BookSearchQuery } from 'src/search/query/book-search-query';
import { RecommendService } from './recommend.service';
import { BookRankingListDto } from './dto/book-ranking.dto';
import { RankingService } from './ranking.service';
import { RecentBookListDto } from './dto/recent-book.dto';

@Controller('books')
@ApiTags('Book API')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly searchService: SearchService,
    private readonly recommendService: RecommendService,
    private readonly rankingService: RankingService,
  ) {}

  @Post()
  @Version('1')
  @ApiOperation({ summary: '책 페이지 업데이트' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async updateBookPages(@Body() payload: UpdatePagesPayload): Promise<void> {
    return this.bookService.updateBookPages(payload.bookId, payload.fileName);
  }

  @Get('autocomplete')
  @Version('1')
  @ApiOperation({ summary: '자동완성 검색어 조회' })
  @ApiOkResponse({ type: [String] })
  async getAutocomplete(@Query() query: BookSearchQuery) {
    return this.searchService.getAutocompleteSuggestions(query.query);
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
  @ApiOperation({ summary: '유저가 최근에 읽은 책들 조회(최대 10권)' })
  @ApiOkResponse({ type: RecentBookListDto })
  async getRecentBooks(
    @CurrentUser() user: UserBaseInfo,
  ): Promise<RecentBookListDto> {
    return this.bookService.getRecentBooks(user);
  }

  @Get('recommend')
  @Version('1')
  @ApiOkResponse({ type: BookListDto })
  @ApiOperation({ summary: '추천 책 조회' })
  async getRecommendedBooks(): Promise<BookListDto> {
    return this.recommendService.getRecommendedBooks();
  }

  @Get('save')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '유저가 북마크한 책 반환' })
  @ApiOkResponse({ type: BookListDto })
  async getSavedBooksByUser(
    @CurrentUser() user: UserBaseInfo,
  ): Promise<BookListDto> {
    return this.bookService.getSavedBooksByUser(user.id);
  }

  @Get('search')
  @Version('1')
  @ApiOperation({ summary: '책 검색' })
  @ApiOkResponse({ type: BookListDto })
  async getBooks(@Query() query: BookSearchQuery): Promise<BookListDto> {
    return this.bookService.getBooks(query);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: '책 조회' })
  @ApiOkResponse({ type: BookDto })
  async getBookById(@Param('id', ParseIntPipe) id: number): Promise<BookDto> {
    return this.bookService.getBookById(id);
  }

  @Post(':id/views')
  @Version('1')
  @ApiOperation({ summary: '책 조회수 증가' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async incrementBookViews(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.bookService.incrementBookViews(id);
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

  @Patch(':id')
  @Version('1')
  @ApiOperation({ summary: '책 정보 수정' })
  @ApiOkResponse({ type: BookDto })
  async updateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: PatchUpdateBookPayload,
  ): Promise<BookDto> {
    return this.bookService.patchUpdateBook(id, payload);
  }

  @Delete(':id')
  @Version('1')
  @HttpCode(204)
  @ApiOperation({ summary: 'DB에서 책 삭제' })
  @ApiNoContentResponse()
  async deleteBook(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.bookService.deleteBook(id);
  }

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
