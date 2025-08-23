import { ApiProperty } from '@nestjs/swagger';
import { ParticipantData } from '../type/participant-data.type';

export class ParticipantDto {
  @ApiProperty({
    description: '참여자 ID',
  })
  id!: number;

  @ApiProperty({
    description: '참여자 이름',
  })
  nickname!: string;

  @ApiProperty({
    description: '최대 페이지',
  })
  maxPageRead!: number;

  @ApiProperty({
    description: '마지막 로그인 시간',
  })
  lastLoginAt!: Date;

  static from(data: ParticipantData): ParticipantDto {
    return {
      id: data.id,
      nickname: data.name,
      maxPageRead: data.maxPageRead,
      lastLoginAt: data.lastLoginAt,
    };
  }

  static fromArray(data: ParticipantData[]): ParticipantDto[] {
    return data.map((item) => ParticipantDto.from(item));
  }
}

export class ParticipantListDto {
  @ApiProperty({
    description: '참여자 목록',
    type: [ParticipantDto],
  })
  participants!: ParticipantDto[];

  static from(data: ParticipantData[]): ParticipantListDto {
    return {
      participants: ParticipantDto.fromArray(data),
    };
  }
}
