import { Module } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { PageService } from './page.service';
import { PageRepository } from './page.repository';
import { PageController } from './page.controller';

@Module({
  providers: [PageService, PageRepository, UserRepository],
  controllers: [PageController],
})
export class PageModule {}
