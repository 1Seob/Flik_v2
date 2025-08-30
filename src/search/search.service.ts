import { Injectable } from '@nestjs/common';
import { SearchRepository } from './search.repository';

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  async getAutocompleteSuggestions(
    query: string,
  ): Promise<{ lexical: string[]; views: string[] }> {
    // lexical 목록 5개와 views 목록 5개를 가져옵니다.
    // 이 과정에서 중복이 발생할 수 있음
    const { lexical, views } =
      await this.searchRepository.searchAutocomplete(query);

    return {
      lexical: lexical, // 사전식 정렬 목록
      views: views, // 조회수 순 정렬 목록
    };
  }
}
