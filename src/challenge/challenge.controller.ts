import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  UseGuards,
  Version,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ApiTags } from '@nestjs/swagger';
import { ChallengeService } from './challenge.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ChallengeDto } from './dto/challenge.dto';
import { CreateChallengePayload } from './payload/create-challenge.payload';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';

@Controller('challenges')
@ApiTags('Challenge API')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post()
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '챌린지 생성' })
  @ApiCreatedResponse({ type: ChallengeDto })
  async createChallenge(
    @Body() payload: CreateChallengePayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ChallengeDto> {
    return this.challengeService.createChallenge(payload, user);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: '챌린지 조회' })
  @ApiOkResponse({ type: ChallengeDto })
  async getChallenge(@Param('id') id: number): Promise<ChallengeDto> {
    return this.challengeService.getChallengeById(id);
  }

  @Delete(':id')
  @Version('1')
  @ApiOperation({ summary: '챌린지 삭제' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiNoContentResponse()
  async deleteChallenge(
    @Param('id') id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.challengeService.deleteChallenge(id, user);
  }
}
