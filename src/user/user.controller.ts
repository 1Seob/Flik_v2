import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  UseGuards,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UpdateUserPayload } from './payload/update-user.payload';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { ApiTags } from '@nestjs/swagger';
import { FilePathPayload } from './payload/filepath.payload';

@Controller('users')
@ApiTags('User API')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('v1/presigned-upload-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Presigned URL for profile image upload',
    type: String,
  })
  @ApiOperation({
    summary: '프로필 사진 : Presigned 업로드 URL 요청 (2시간 유효)',
  })
  async getPresignedUploadUrl(
    @CurrentUser() user: UserBaseInfo,
  ): Promise<{ url: string; filePath: string }> {
    return this.userService.getPresignedUploadUrl(user);
  }

  @Post('v1/profile-image/commit')
  @ApiNoContentResponse()
  @HttpCode(204)
  @ApiOperation({ summary: '프로필 사진 업로드 완료 커밋' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async commitProfileImage(
    @CurrentUser() user: UserBaseInfo,
    @Body() payload: FilePathPayload,
  ): Promise<void> {
    return this.userService.commitProfileImage(user.id, payload.filePath);
  }

  @Get('v1/profile-image-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: '프로필 사진 URL',
    type: String,
  })
  @ApiOperation({
    summary: '프로필 사진 URL 요청 (12시간 유효)',
  })
  async getProfileImageUrl(@CurrentUser() user: UserBaseInfo): Promise<string> {
    return this.userService.getProfileImageUrl(user);
  }

  @Get('v1')
  @ApiOperation({
    summary:
      '모든 사용자별 사용자 ID, 문단 좋아요한 책 목록, 읽은 책 목록 반환',
  })
  @ApiOkResponse({
    description: '모든 사용자 정보 반환',
    type: [Object],
  })
  async getAllUsersWithParagraphLikes(): Promise<
    { id: number; likedBookIds: number[]; readBookIds: number[] }[]
  > {
    return this.userService.getAllUsersWithParagraphLikes();
  }

  @Patch('v1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 정보 수정' })
  @ApiOkResponse({ type: UserDto })
  async updateUser(
    @Body() payload: UpdateUserPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<UserDto> {
    return this.userService.updateUser(payload, user);
  }

  @Delete('v1')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 탈퇴' })
  @ApiNoContentResponse()
  async deleteUser(@CurrentUser() user: UserBaseInfo): Promise<void> {
    return this.userService.deleteUser(user);
  }

  @Get('v1/:userId')
  @ApiOperation({ summary: '유저 정보 가져오기' })
  @ApiOkResponse({ type: UserDto })
  async getUserById(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserDto> {
    return this.userService.getUserById(userId);
  }
}
