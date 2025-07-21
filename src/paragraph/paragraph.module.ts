import { Module } from '@nestjs/common';
import { ParagraphService } from './paragraph.service';
import { ParagraphController } from './paragraph.controller';
import { ParagraphRepository } from './paragrpah.repository';
import { UserRepository } from 'src/user/user.repository';

@Module({
  providers: [ParagraphService, ParagraphRepository, UserRepository],
  controllers: [ParagraphController],
})
export class ParagraphModule {}
