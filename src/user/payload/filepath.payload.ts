import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FilePathPayload {
  @IsString()
  @ApiProperty({
    description: '파일 경로',
    type: String,
  })
  filePath!: string;
}
