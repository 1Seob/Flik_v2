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
import { PageModule } from 'src/page/page.module';
import { ReadModule } from 'src/read/read.module';
import { redis } from 'src/search/redis.provider';
import { ScheduleModule } from '@nestjs/schedule';
import { RankingScheduler } from 'src/book/ranking.scheduler';
import { setIds } from 'src/common/id.store';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BookModule,
    PageModule,
    configModule,
    CommonModule,
    ReadModule,
    ReviewModule,
    SearchModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, RankingScheduler],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private readonly searchRepository: SearchRepository) {}

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
  }
}
