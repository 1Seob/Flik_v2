import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Version,
  Post,
  UseGuards,
  Body,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { PageDto } from './dto/page.dto';
import { PageService } from './page.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateSentenceLikePayload } from './payload/create-sentence-like.payload';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { SentenceLikeDto, SentenceLikeListDto } from './dto/sentence-like.dto';

@Controller('pages')
@ApiTags('Page API')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: SentenceLikeListDto })
  @ApiOperation({ summary: '문장 좋아요 조회' })
  async getSentenceLikes(
    @CurrentUser() user: UserBaseInfo,
  ): Promise<SentenceLikeListDto> {
    return this.pageService.getSentenceLikes(user);
  }

  @Post()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: SentenceLikeDto })
  @ApiOperation({ summary: '문장 좋아요 생성' })
  async createSentenceLike(
    @Body() payload: CreateSentenceLikePayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<SentenceLikeDto> {
    return this.pageService.createSentenceLike(payload, user);
  }

  @Delete(':id')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '문장 좋아요 삭제' })
  @ApiNoContentResponse()
  async deleteSentenceLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.pageService.deleteSentenceLike(id, user);
  }

  @Get(':id')
  @ApiOperation({ summary: '페이지 조회' })
  @Version('1')
  @ApiOkResponse({ type: PageDto })
  async getPage(@Param('id', ParseIntPipe) pageId: number): Promise<PageDto> {
    return this.pageService.getPageById(pageId);
  }
}
