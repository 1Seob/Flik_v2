import { Injectable } from '@nestjs/common';

@Injectable()
export class BadWordsFilterService {
  private readonly badWordsKo = require('badwords-ko');
  private readonly filterKo = new this.badWordsKo();

  private readonly badWordsNext = require('bad-words-next');
  private readonly en = require('bad-words-next/lib/en');
  private readonly filterEn = new this.badWordsNext({ data: this.en });

  isProfane(content: string): boolean {
    return this.filterKo.isProfane(content) || this.filterEn.check(content);
  }
}
