import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchPayload } from './payload/search-payload';
import { BookListDto } from 'src/book/dto/book.dto';
import { BookSearchQuery } from './query/book-search-query';

@Controller('search')
@ApiTags('Search API')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('v1/autocomplete')
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

  @Get('v1/search')
  @ApiOperation({ summary: '책 검색' })
  @ApiOkResponse({ type: BookListDto })
  async getBooks(@Query() query: BookSearchQuery): Promise<BookListDto> {
    return this.searchService.getBooks(query);
  }
}
