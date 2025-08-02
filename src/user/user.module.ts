import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { BadWordsFilterService } from '../auth/bad-words-filter.service';

@Module({
  providers: [UserService, UserRepository, BadWordsFilterService],
  controllers: [UserController],
})
export class UserModule {}
