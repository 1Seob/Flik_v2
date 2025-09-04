import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
  Version,
  Post,
  Patch,
  Query,
  HttpCode,
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
import { UpdateChallengePayload } from './payload/update-challenge.payload';
import { ChallengeCompleteLogListDto } from './dto/challenge-complete-log.dto';
import { ChallengeHistoryListDto } from './dto/challenge-history.dto';
import { ChallengeSearchQuery } from 'src/search/query/challenge-search-query';
import {
  ChallengeNoteDto,
  ChallengeNoteListDto,
} from './dto/challenge-note.dto';
import { CreateChallengeNotePayload } from './payload/create-challenge-note.payload';
import { UpdateChallengeNotePayload } from './payload/update-challenge-note.payload';
import { ChallengeNoteCommentDto } from './dto/challenge-note-comment.dto';
import { CreateChallengeNoteCommentPayload } from './payload/create-challenge-note-comment.payload';

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

  @Get('history')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '유저가 참여한 챌린지 히스토리 조회' })
  @ApiOkResponse({ type: ChallengeHistoryListDto })
  async getUserChallengeHistory(
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ChallengeHistoryListDto> {
    return this.challengeService.getUserChallengeHistory(user);
  }

  @Post('note')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '챌린지 노트 생성' })
  @ApiCreatedResponse({ type: ChallengeNoteDto })
  async createChallengeNote(
    @Body() payload: CreateChallengeNotePayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ChallengeNoteDto> {
    return this.challengeService.createChallengeNote(payload, user);
  }

  @Get('search')
  @Version('1')
  @ApiOperation({ summary: '챌린지 검색' })
  @ApiOkResponse({ type: ChallengeListDto })
  async searchChallenges(
    @Query() query: ChallengeSearchQuery,
  ): Promise<ChallengeListDto> {
    return this.challengeService.searchChallenges(query);
  }

  @Post('note/comment')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '챌린지 노트 댓글 생성' })
  @ApiCreatedResponse({ type: ChallengeNoteCommentDto })
  async createChallengeNoteComment(
    @Body() payload: CreateChallengeNoteCommentPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ChallengeNoteCommentDto> {
    return this.challengeService.createChallengeNoteComment(payload, user);
  }

  @Delete('note/comment/:id')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '챌린지 노트 댓글 삭제' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async deleteChallengeNoteComment(
    @Param('id') id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.challengeService.deleteChallengeNoteComment(id, user);
  }

  @Post('note/:id/like')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '챌린지 노트 좋아요 (다시 누르면 취소)' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async toggleChallengeNoteLike(
    @Param('id') id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.challengeService.toggleChallengeNoteLike(id, user);
  }

  @Patch('note/:id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '챌린지 노트 수정' })
  @ApiOkResponse({ type: ChallengeNoteDto })
  async updateChallengeNote(
    @Param('id') id: number,
    @Body() payload: UpdateChallengeNotePayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ChallengeNoteDto> {
    return this.challengeService.updateChallengeNote(id, payload, user);
  }

  @Delete('note/:id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '챌린지 노트 삭제' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async deleteChallengeNote(
    @Param('id') id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.challengeService.deleteChallengeNote(id, user);
  }

  @Get(':id/note')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '챌린지의 독서 노트 조회' })
  @ApiOkResponse({ type: ChallengeNoteListDto })
  async getChallengeNotes(
    @Param('id') id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ChallengeNoteListDto> {
    return this.challengeService.getChallengeNotes(id, user);
  }

  @Patch(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '챌린지 수정' })
  @ApiOkResponse({ type: ChallengeDto })
  async updateChallenge(
    @Param('id') id: number,
    @Body() payload: UpdateChallengePayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ChallengeDto> {
    return this.challengeService.updateChallenge(id, payload, user);
  }

  @Get(':id/logs')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '챌린지 완료(완독) 로그 조회' })
  @ApiOkResponse({ type: ChallengeCompleteLogListDto })
  async getChallengeCompleteLogs(
    @Param('id') id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ChallengeCompleteLogListDto> {
    return this.challengeService.getChallengeCompleteLogs(id, user);
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
  @ApiOkResponse({ type: ChallengeListDto })
  async joinChallenge(
    @Param('id') id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ChallengeListDto> {
    return this.challengeService.joinChallenge(id, user);
  }

  @Post(':id/leave')
  @Version('1')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '챌린지 포기' })
  @ApiOkResponse({ type: ChallengeListDto })
  async leaveChallenge(
    @Param('id') id: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ChallengeListDto> {
    return this.challengeService.leaveChallenge(id, user);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: '챌린지 조회' })
  @ApiOkResponse({ type: ChallengeDto })
  async getChallenge(@Param('id') id: number): Promise<ChallengeDto> {
    return this.challengeService.getChallengeById(id);
  }

  /*
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
    */
}
