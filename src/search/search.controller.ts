import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SearchService } from './search.service';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SearchPayload } from './payload/search-payload';

@Controller('search')
@ApiTags('Search API')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('popular')
  @ApiOperation({
    summary: '인기 검색어 중 현재 검색어와 매칭되는 것 조회 (내림차순)',
  })
  @ApiOkResponse({ type: [String] })
  async getPopular(@Body() payload: SearchPayload): Promise<string[]> {
    return await this.searchService.getMatchingPopularTerms(payload.query);
  }

  @Post('increment')
  @ApiOperation({ summary: '검색어의 검색 횟수 증가' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async incrementSearchTerm(@Body() payload: SearchPayload): Promise<void> {
    await this.searchService.incrementSearchTerm(payload.query);
  }
}
