import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchRepository } from './search.repository';
import { BadWordsFilterService } from 'src/auth/bad-words-filter.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, SearchRepository, BadWordsFilterService],
  exports: [SearchRepository],
})
export class SearchModule {}
