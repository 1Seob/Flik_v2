import { Controller, Get, Param, ParseIntPipe, Version } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { PageDto } from './dto/page.dto';
import { PageService } from './page.service';

@Controller('pages')
@ApiTags('Page API')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get(':id')
  @ApiOperation({ summary: '페이지 조회' })
  @Version('1')
  @ApiOkResponse({ type: PageDto })
  async getPage(@Param('id', ParseIntPipe) pageId: number): Promise<PageDto> {
    return this.pageService.getPage(pageId);
  }
}
