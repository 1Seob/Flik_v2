import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Version,
  Post,
  UseGuards,
  Delete,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { BasicBookListDto } from 'src/book/dto/basic-book.dto';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { BookDto } from 'src/book/dto/book.dto';

@Controller('library')
@ApiTags('Library API')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('books')
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
    return this.libraryService.getSavedBooksByUser(user.id);
  }

  @Post('books/:id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '책 북마크' })
  @ApiOkResponse({ type: BookDto })
  async saveBookToUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<BookDto> {
    return this.libraryService.saveBookToUser(id, user.id);
  }

  @Delete('books/:id')
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
    return this.libraryService.unsaveBookFromUser(id, user.id);
  }
}
