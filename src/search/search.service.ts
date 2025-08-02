import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';
import { redis } from './redis.provider';
import { BadWordsFilterService } from 'src/auth/bad-words-filter.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly searchRepository: SearchRepository,
    private readonly badWordsFilterService: BadWordsFilterService,
  ) {}

  private readonly redisKey = 'popular_keywords';

  async incrementSearchTerm(term: string): Promise<void> {
    if (this.badWordsFilterService.isProfane(term)) {
      return; // 부적절한 단어는 검색어로 사용하지 않음
    }
    await redis.zincrby(this.redisKey, 1, term);
  }

  async getMatchingPopularTerms(query: string, limit = 10): Promise<string[]> {
    const allTerms = await redis.zrevrange(this.redisKey, 0, -1); // 인기도 내림차순 전체 조회

    // 포함된 검색어만 필터
    const matched = allTerms.filter((term) => term.includes(query));

    return matched.slice(0, limit);
  }
}
