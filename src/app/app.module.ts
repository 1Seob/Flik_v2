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
import { ParagraphModule } from '../paragraph/paragraph.module';
import { BookReadModule } from '../bookread/bookread.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { ReviewModule } from '../review/review.module';
import { SearchModule } from 'src/search/search.module';
import { SearchRepository } from 'src/search/search.repository';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BookModule,
    ParagraphModule,
    configModule,
    CommonModule,
    BookReadModule,
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
    console.log('데이터베이스에서 책 정보를 Redis로 로딩 중...');
    await this.searchRepository.loadBooksToRedis();
    console.log('Redis 로딩 완료!');
  }
}
