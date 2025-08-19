import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Version,
  UseGuards,
  ParseIntPipe,
  Param,
  HttpCode,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { ReadService } from './read.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateReadingStartLogPayload } from './payload/create-reading-start-log.payload';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { CreateReadingEndLogPayload } from './payload/create-reading-end-log.payload';
import { ReadingLogDto } from './dto/reading-log.dto';

@Controller('read')
@ApiTags('Read API')
export class ReadController {
  constructor(private readonly readService: ReadService) {}

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

  @Get(':id')
  @ApiOperation({ summary: '읽기 로그 조회' })
  @ApiOkResponse({ type: ReadingLogDto })
  @Version('1')
  async getReadingLog(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReadingLogDto> {
    return this.readService.getReadingLog(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '읽기 로그 삭제' })
  @ApiNoContentResponse()
  @HttpCode(204)
  @Version('1')
  async deleteReadingLog(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.readService.deleteReadingLog(id);
  }
}
