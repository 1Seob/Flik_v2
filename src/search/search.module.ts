import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchRepository } from './search.repository';
import { BadWordsFilterService } from 'src/user/bad-words-filter.service';

@Module({
  providers: [SearchService, SearchRepository, BadWordsFilterService],
  exports: [SearchRepository, SearchService],
})
export class SearchModule {}
