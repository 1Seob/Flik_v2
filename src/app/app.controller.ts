import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Flik')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('flik')
  @ApiOperation({ summary: 'flik check' })
  getHello(): string {
    return this.appService.runningCheck();
  }
}
