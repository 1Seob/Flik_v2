import { Injectable } from '@nestjs/common';

@Injectable()
export class BadWordsFilterService {
  private readonly badWordsKo = require('badwords-ko');
  private readonly filterKo = new this.badWordsKo();

  private readonly badWordsNext = require('bad-words-next');
  private readonly en = require('bad-words-next/lib/en');
  private readonly filterEn = new this.badWordsNext({ data: this.en });

  private readonly RESERVED_USERNAMES = [
    'admin',
    'root',
    'support',
    'manager',
    'system',
  ];

  isProfane(content: string): boolean {
    return this.filterKo.isProfane(content) || this.filterEn.check(content);
  }

  isReservedUsername(username: string): boolean {
    return this.RESERVED_USERNAMES.includes(username.toLowerCase());
  }

  hasConsecutiveSpecialChars(username: string): boolean {
    return /[._]{2,}/.test(username); // 연속된 마침표 또는 밑줄
  }

  startsOrEndsWithSpecialChar(username: string): boolean {
    return /^[._]|[._]$/.test(username); // 시작 또는 끝이 특수문자
  }
}
