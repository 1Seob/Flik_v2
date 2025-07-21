import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ParagraphService } from './paragraph.service';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ParagraphDto } from './dto/paragraph.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { ApiTags } from '@nestjs/swagger';

@Controller('paragraphs')
@ApiTags('Paragraph API')
export class ParagraphController {
  constructor(private readonly paragraphService: ParagraphService) {}

  @Get(':id')
  @ApiOperation({ summary: '문단 조회' })
  @ApiOkResponse({ type: ParagraphDto })
  async getParagraph(
    @Param('id', ParseIntPipe) paragraphId: number,
  ): Promise<ParagraphDto> {
    return this.paragraphService.getParagraph(paragraphId);
  }

  @Post(':paragraphId/like')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '문단에 좋아요 누르기(다시 누르면 취소)' })
  @ApiNoContentResponse()
  async toggleParagraphLike(
    @Param('paragraphId', ParseIntPipe) paragraphId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.paragraphService.toggleParagraphLike(paragraphId, user);
  }

  @Get(':paragraphId/like/count')
  @ApiOperation({ summary: '문단 좋아요 개수 확인' })
  @ApiOkResponse({ type: Number })
  async getParagraphLikeCount(
    @Param('paragraphId', ParseIntPipe) paragraphId: number,
  ): Promise<number> {
    return this.paragraphService.getParagraphLikeCount(paragraphId);
  }

  @Get('likes/:userId')
  @ApiOperation({ summary: '유저가 좋아요한 문단 ID 리스트 반환' })
  @ApiOkResponse({ type: [Number] })
  async getLikedParagraphs(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<number[]> {
    return this.paragraphService.getLikedParagraphIdsByUser(userId);
  }
}
