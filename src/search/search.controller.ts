import { Body, Controller, Get, Post } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchPayload } from './payload/search-payload';

@Controller('search')
@ApiTags('Search API')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('autocomplete')
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
}
