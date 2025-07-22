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
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BookService } from './book.service';
import {
  ApiConsumes,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BookDto } from './dto/book.dto';
import { SaveBookPayload } from './payload/save-book.payload';
import { PatchUpdateBookPayload } from './payload/patch-update-book.payload';
import { BookListDto } from './dto/book.dto';
import { BookQuery } from './query/book.query';
import { MetadataListDto } from './dto/metadata.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserBaseInfo } from '../auth/type/user-base-info.type';

@Controller('books')
@ApiTags('Book API')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get('metadata')
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

  @Get('streak')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저의 연속 독서 일수 반환' })
  @ApiOkResponse({ schema: { example: 3 } })
  async getReadingStreak(@CurrentUser() user: UserBaseInfo): Promise<number> {
    return this.bookService.getReadingStreak(user.id);
  }

  @Get(':bookId')
  @ApiOperation({ summary: '책 정보 가져오기' })
  @ApiOkResponse({ type: BookDto })
  async getBookById(
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<BookDto> {
    return this.bookService.getBookById(bookId);
  }

  @Get()
  @ApiOperation({ summary: '책 제목과 작가로 책 검색 (둘 중 하나로도 가능)' })
  @ApiOkResponse({ type: BookListDto })
  async getBooks(@Query() query: BookQuery): Promise<BookListDto> {
    return this.bookService.getBooks(query);
  }

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

  @Get(':bookId/paragraphs/count')
  @ApiOperation({ summary: '책 전체 문단 수 반환' })
  @ApiOkResponse({ type: Number })
  async getParagraphCountByBookId(
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<number> {
    return this.bookService.getParagraphCountByBookId(bookId);
  }

  @Get(':bookId/paragraphs/per-day')
  @ApiOperation({ summary: '책 1일 읽어야 할 문단 수 반환 (30일 기준)' })
  @ApiOkResponse({ type: Number })
  async getParagraphsPerDay(
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<number> {
    return this.bookService.getParagraphsPerDay(bookId);
  }

  @Post('save/:fileName')
  @ApiOperation({ summary: 'DB에 책 추가' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: BookDto })
  @UseInterceptors(FileInterceptor('coverImage'))
  async saveBook(
    @Param('fileName') fileName: string,
    @Body() payload: SaveBookPayload,
    @UploadedFile() coverImageFile?: Express.Multer.File,
  ): Promise<BookDto> {
    return this.bookService.saveBook(fileName, payload, coverImageFile);
  }
  // 프로젝트 루트 디렉토리에 있는 원문 텍스트 파일의 이름을 fileName으로 받습니다. ex) Frankenstein.txt

  @Patch(':bookId')
  @ApiOperation({ summary: '책 정보 수정 (표지 이미지 포함)' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: BookDto })
  @UseInterceptors(FileInterceptor('coverImage'))
  async updateBook(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() payload: PatchUpdateBookPayload,
    @UploadedFile() coverImageFile?: Express.Multer.File,
  ): Promise<BookDto> {
    return this.bookService.patchUpdateBook(bookId, payload, coverImageFile);
  }

  @Delete(':bookId')
  @HttpCode(204)
  @ApiOperation({ summary: 'DB에서 책 삭제' })
  @ApiNoContentResponse()
  async deleteBook(
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<void> {
    return this.bookService.deleteBook(bookId);
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
  @Post(':bookId/save')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '책 보관하기' })
  @ApiNoContentResponse()
  async saveBookToUser(
    @Param('bookId', ParseIntPipe) bookId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.bookService.saveBookToUser(bookId, user.id);
  }

  @Delete(':bookId/save')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '책 보관 해제하기' })
  @ApiNoContentResponse()
  async unsaveBookFromUser(
    @Param('bookId', ParseIntPipe) bookId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.bookService.unsaveBookFromUser(bookId, user.id);
  }

  @Get('saved/:userId')
  @ApiOperation({ summary: '유저가 보관한 책 ID 리스트 반환하기' })
  @ApiOkResponse({ type: [Number] })
  async getSavedBookIdsByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<number[]> {
    return this.bookService.getSavedBookIdsByUser(userId);
  }

  @Get(':bookId/continue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '마지막 읽은 문단 순서 조회' })
  @ApiOkResponse({ schema: { example: { lastReadParagraphOrder: 12 } } })
  async getLastReadParagraph(
    @Param('bookId', ParseIntPipe) bookId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<{ lastReadParagraphOrder: number }> {
    return this.bookService.getLastReadParagraph(bookId, user.id);
  }

  @Patch(':bookId/paragraphs/:order')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '마지막 읽은 문단 순서 업데이트' })
  @ApiOkResponse({ description: '업데이트 성공' })
  async updateLastReadParagraph(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('order', ParseIntPipe) order: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.bookService.updateLastReadParagraph(bookId, user.id, order);
  }

  @Get(':bookId/chapters/:day')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '지정한 날짜에 해당하는 문단 리스트 조회 (챕터 이동)',
  })
  @ApiOkResponse({ type: [String] })
  async getParagraphsForDay(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('day', ParseIntPipe) day: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<string[]> {
    return this.bookService.getParagraphsForDay(bookId, user.id, day);
  }
}
