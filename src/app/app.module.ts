import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
