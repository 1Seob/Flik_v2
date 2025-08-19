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
import { SearchPayload } from 'src/search/payload/search-payload';
import { SearchService } from 'src/search/search.service';
import { BookSearchQuery } from 'src/search/query/book-search-query';

@Controller('books')
@ApiTags('Book API')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly searchService: SearchService,
  ) {}

  @Post()
  @Version('1')
  @ApiOperation({ summary: '책 페이지 업데이트' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async updateBookPages(@Body() payload: UpdatePagesPayload): Promise<void> {
    return this.bookService.updateBookPages(payload.bookId, payload.fileName);
  }

  @Post('autocomplete')
  @Version('1')
  @ApiOperation({ summary: '자동완성 검색어 조회' })
  @ApiOkResponse({ type: [String] })
  async getAutocomplete(@Body() searchPayload: SearchPayload) {
    const { query } = searchPayload;
    if (!query) {
      return { lexical: [], views: [] };
    }
    const suggestions =
      await this.searchService.getAutocompleteSuggestions(query);
    return suggestions;
  }

  @Get('search')
  @Version('1')
  @ApiOperation({ summary: '책 검색' })
  @ApiOkResponse({ type: BookListDto })
  async getBooks(@Query() query: BookSearchQuery): Promise<BookListDto> {
    return this.searchService.getBooks(query);
  }

  /*
  @Get('v1/metadata')
  @ApiOperation({ summary: '책 메타데이터 가져오기' })
  @ApiQuery({
    name: 'offset',
    type: Number,
    description: '가져올 시작 위치입니다 (0부터 시작)',
  })
  @ApiQuery({ name: 'limit', type: Number, description: '가져올 개수입니다' })
  @ApiOkResponse({ type: MetadataListDto })
  async getBooksMetadata(
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<MetadataListDto> {
    return this.bookService.getBooksMetadata(offset, limit);
  }
    */

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: '책 정보 가져오기' })
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
    await this.bookService.incrementBookViews(id);
  }

  /*
  @Get(':bookId/paragraphs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '책 문단을 30일 분량으로 가져오기' })
  @ApiOkResponse({
    type: String,
    isArray: true,
    description: '30일 분량으로 나눠진 문단 리스트 배열',
  })
  async getBookParagraphs(
    @Param('bookId', ParseIntPipe) bookId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<string[][]> {
    return this.bookService.getBookParagraphs(bookId, user.id);
  }
  */

  @Get(':id/pages/download')
  @Version('1')
  @ApiOkResponse({ type: PageListDto })
  @ApiOperation({ summary: '책 원문 다운로드' })
  async getBookPages(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PageListDto> {
    return this.bookService.getBookPages(id);
  }

  @Get(':id/pages/count')
  @Version('1')
  @ApiOperation({ summary: '책 전체 페이지 수 반환' })
  @ApiOkResponse({ type: Number })
  async getPageCountByBookId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<number> {
    return this.bookService.getPageCountByBookId(id);
  }

  /*
  @Get(':bookId/paragraphs/per-day')
  @ApiOperation({ summary: '책 1일 읽어야 할 문단 수 반환 (30일 기준)' })
  @ApiOkResponse({ type: Number })
  async getParagraphsPerDay(
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<number> {
    return this.bookService.getParagraphsPerDay(bookId);
  }
  */

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

  /*
  @Post(':bookId/like')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '책에 좋아요 누르기 (다시 누르면 취소)' })
  @ApiNoContentResponse()
  async toggleBookLike(
    @Param('bookId', ParseIntPipe) bookId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.bookService.toggleBookLike(bookId, user);
  }

  @Get('likes/:userId')
  @ApiOperation({ summary: '유저가 좋아요한 책 ID 리스트 반환' })
  @ApiOkResponse({ type: [Number] })
  async getLikedBooks(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<number[]> {
    return this.bookService.getLikedBookIdsByUser(userId);
  }

  */
  @Post(':id/save')
  @Version('1')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '책 보관하기' })
  @ApiNoContentResponse()
  async saveBookToUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.bookService.saveBookToUser(id, user.id);
  }

  @Delete(':id/save')
  @Version('1')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '책 보관 해제하기' })
  @ApiNoContentResponse()
  async unsaveBookFromUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.bookService.unsaveBookFromUser(id, user.id);
  }

  /*
  @Get('v1/saved/:userId')
  @ApiOperation({ summary: '유저가 보관한 책 ID 리스트 반환하기' })
  @ApiOkResponse({ type: [Number] })
  async getSavedBookIdsByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<number[]> {
    return this.bookService.getSavedBookIdsByUser(userId);
  }
    */

  @Get(':id/cover')
  @Version('1')
  @ApiOperation({ summary: '책 커버 이미지 URL 가져오기' })
  async getBookCoverImage(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<string | null> {
    return this.bookService.getBookCoverImage(id);
  }
}
