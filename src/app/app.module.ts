import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModule } from './modules/config.module';
import { LoggerMiddleware } from '../common/middlewares/logger.middleware';
import { CommonModule } from '../common/common.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { BookModule } from '../book/book.module';
import { ReviewModule } from '../review/review.module';
import { SearchModule } from 'src/search/search.module';
import { SearchRepository } from 'src/search/search.repository';
import { SentenceLikeModule } from 'src/sentence-like/sentence-like.module';
import { ReadModule } from 'src/read/read.module';
import { redis } from 'src/search/redis.provider';
import { ScheduleModule } from '@nestjs/schedule';
import { RankingScheduler } from 'src/book/ranking.scheduler';
import { setIds } from 'src/common/id.store';
import { AdminModule } from 'src/admin/admin.module';
import { BookService } from 'src/book/book.service';
import { LibraryModule } from 'src/library/library.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BookModule,
    configModule,
    CommonModule,
    ReadModule,
    ReviewModule,
    LibraryModule,
    SearchModule,
    SentenceLikeModule,
    AdminModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, RankingScheduler],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(
    private readonly searchRepository: SearchRepository,
    private readonly bookService: BookService,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }

  async onModuleInit() {
    //ID 배열 초기화
    const bookIds = await this.searchRepository.getAllBookIds();
    setIds(bookIds);
    console.log(`총 ${bookIds.length}개의 책 ID를 메모리에 로딩했습니다.`);

    console.log('Redis 데이터 초기화 중...');
    await redis.flushall(); //모든 Redis 데이터 삭제
    console.log('Redis 데이터 초기화 완료.');

    console.log('데이터베이스에서 책 정보를 Redis로 로딩 중...');
    await this.searchRepository.loadBooksToRedis();
    console.log('Redis 로딩 완료!');
    this.warmUpCache();
  }

  private async warmUpCache() {
    // 비동기로 돌리되, 앱 부팅은 지연 안 시킴
    (async () => {
      console.log('🚀 Redis warm-up 시작');
      try {
        const isCoverImageCachingInitialized: boolean = false; // 책 표지 이미지 캐싱 초기화 여부

        if (isCoverImageCachingInitialized) {
          let urlCount = 0;

          const bookIsbns = await this.searchRepository.getAllBookIsbns();
          console.log(
            `총 ${bookIsbns.length}개의 책 ISBN을 가져왔습니다. (캐싱 대상: ${bookIsbns.filter((isbn) => isbn !== null).length}개)`,
          );
          for (const isbn of bookIsbns) {
            const url =
              await this.bookService.getBookCoverImageUrlByGoogleBooksApi(isbn);
            if (url) {
              urlCount++;
              console.log(`[Preload] cover cached for isbn=${isbn}`);
            } else console.log(`[Preload]❌ no cover found for isbn=${isbn}`);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 sleep
          }
          console.log(
            `모든 책 표지 이미지 캐싱 완료! 총 ${urlCount}개 캐시됨.`,
          );
        }
      } catch (e) {
        console.error('❌ Redis warm-up 실패:', e);
      }
    })();
  }
}
