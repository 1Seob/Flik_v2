import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
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
import { ChallengeDto, ChallengeListDto } from './dto/challenge.dto';
import { CreateChallengePayload } from './payload/create-challenge.payload';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { ParticipantListDto } from './dto/participant.dto';

@Controller('challenges')
@ApiTags('Challenge API')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get()
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '유저가 현재 참여 중인 챌린지 목록 조회' })
  @ApiOkResponse({ type: ChallengeListDto })
  async getUserActiveChallenges(
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ChallengeListDto> {
    return this.challengeService.getUserActiveChallenges(user);
  }

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

  @Get(':id/participants')
  @Version('1')
  @ApiOperation({ summary: '챌린지 참가자 조회' })
  @ApiOkResponse({ type: ParticipantListDto })
  async getChallengeParticipants(
    @Param('id') id: number,
  ): Promise<ParticipantListDto> {
    return this.challengeService.getChallengeParticipants(id);
  }

  @Post(':id/join')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '챌린지 참가' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async joinChallenge(
    @Param('id') id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.challengeService.joinChallenge(id, user);
  }

  @Post(':id/leave')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '챌린지 포기' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async leaveChallenge(
    @Param('id') id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.challengeService.leaveChallenge(id, user);
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
