import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReadRepository } from './read.repository';
import { CreateReadingStartLogPayload } from './payload/create-reading-start-log.payload';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { CreateReadingEndLogPayload } from './payload/create-reading-end-log.payload';
import { ReadingLogDto } from './dto/reading-log.dto';

@Injectable()
export class ReadService {
  constructor(private readonly readRepository: ReadRepository) {}

  async createReadingStartLog(
    payload: CreateReadingStartLogPayload,
    user: UserBaseInfo,
  ): Promise<ReadingLogDto> {
    //챌린지 구현하면서 예외처리 추가 예정

    return this.readRepository.createReadingStartLog(payload, user);
  }

  async createReadingEndLog(
    payload: CreateReadingEndLogPayload,
    user: UserBaseInfo,
  ): Promise<ReadingLogDto> {
    //챌린지 구현하면서 예외처리 추가 예정

    return this.readRepository.createReadingEndLog(payload, user);
  }

  async getReadingLog(id: number): Promise<ReadingLogDto> {
    const log = await this.readRepository.getReadingLog(id);
    if (!log) {
      throw new NotFoundException('Reading log not found');
    }
    return log;
  }

  async deleteReadingLog(id: number): Promise<void> {
    const log = await this.readRepository.getReadingLog(id);
    if (!log) {
      throw new NotFoundException('Reading log not found');
    }
    await this.readRepository.deleteReadingLog(id);
  }
}
