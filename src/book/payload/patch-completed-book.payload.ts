import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PatchCompletedBookPayload {
  @IsBoolean()
  @ApiProperty({
    description: '완료 여부',
  })
  completed!: boolean;
}
