import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchPayload {
  @IsString()
  @ApiProperty({
    description: '검색어',
    type: String,
  })
  query!: string;
}
