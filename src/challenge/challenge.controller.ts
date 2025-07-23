import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { CreateChallengePayload } from './dto/create-challenge.payload';
import {
  ChallengeStatusDto,
  ChallengeStatusListDto,
} from './dto/challenge-status.dto';

@ApiTags('Challenge API')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get('count')
  @ApiOperation({ summary: '유저의 챌린지 개수 반환' })
  @ApiOkResponse({ type: Number, description: '챌린지 개수 조회 성공' })
  getUserChallengeCount(@CurrentUser() user: UserBaseInfo) {
    return this.challengeService.getUserChallengeCount(user.id);
  }

  @Get('active')
  @ApiOperation({ summary: '현재 진행 중인 챌린지 목록 조회' })
  @ApiOkResponse({
    type: ChallengeStatusListDto,
    description: '진행 중인 챌린지 목록 조회 성공',
  })
  getActiveChallenges(@CurrentUser() user: UserBaseInfo) {
    return this.challengeService.getActiveChallenges(user.id);
  }

  @Patch(':bookId')
  @ApiOperation({ summary: '챌린지 설정 (7일, 4주, 없음)' })
  @ApiOkResponse({ description: '챌린지 설정 성공' })
  setChallenge(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() payload: CreateChallengePayload,
    @CurrentUser() user: UserBaseInfo,
  ) {
    return this.challengeService.setChallenge(user.id, bookId, payload);
  }

  @Get(':bookId/status')
  @ApiOperation({ summary: '챌린지 상태 조회 (D-day, 성공 여부, 진행률)' })
  @ApiOkResponse({
    type: ChallengeStatusDto,
    description: '챌린지 상태 조회 성공',
  })
  getStatus(
    @Param('bookId', ParseIntPipe) bookId: number,
    @CurrentUser() user: UserBaseInfo,
  ) {
    return this.challengeService.getChallengeStatus(user.id, bookId);
  }

  @Delete(':bookId')
  @ApiOperation({ summary: '챌린지 삭제' })
  deleteChallenge(
    @Param('bookId', ParseIntPipe) bookId: number,
    @CurrentUser() user: UserBaseInfo,
  ) {
    return this.challengeService.deleteChallenge(user.id, bookId);
  }
}
