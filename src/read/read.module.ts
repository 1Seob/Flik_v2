import { Module } from '@nestjs/common';
import { ReadController } from './read.controller';
import { ReadService } from './read.service';
import { ReadRepository } from './read.repository';

@Module({
  providers: [ReadService, ReadRepository],
  controllers: [ReadController],
})
export class ReadModule {}
