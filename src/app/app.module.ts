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
import { ChallengeModule } from 'src/challenge/challenge.module';
import { redis } from 'src/search/redis.provider';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BookModule,
    PageModule,
    configModule,
    CommonModule,
    ReadModule,
    ChallengeModule,
    ReviewModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private readonly searchRepository: SearchRepository) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }

  async onModuleInit() {
    console.log('Redis 데이터 초기화 중...');
    await redis.flushall(); //모든 Redis 데이터 삭제
    console.log('Redis 데이터 초기화 완료.');

    console.log('데이터베이스에서 책 정보를 Redis로 로딩 중...');
    await this.searchRepository.loadBooksToRedis();
    console.log('Redis 로딩 완료!');
  }
}
