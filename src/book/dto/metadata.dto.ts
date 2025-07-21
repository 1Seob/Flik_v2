import { ApiProperty } from '@nestjs/swagger';
import { MetadataData } from '../type/metadata-data.type';

export class MetadataDto {
  @ApiProperty({
    description: '메타데이터 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '메타데이터 제목',
    type: String,
  })
  title!: string;

  @ApiProperty({
    description: '메타데이터 내용',
    type: String,
  })
  content!: string;

  static from(data: MetadataData): MetadataDto {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
    };
  }

  static fromArray(data: MetadataData[]): MetadataDto[] {
    return data.map((metadata) => MetadataDto.from(metadata));
  }
}

export class MetadataListDto {
  @ApiProperty({
    description: '메타데이터 목록',
    type: [MetadataDto],
  })
  metadata!: MetadataDto[];

  static from(data: MetadataData[]): MetadataListDto {
    return {
      metadata: MetadataDto.fromArray(data),
    };
  }
}
