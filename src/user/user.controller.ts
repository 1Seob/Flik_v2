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

  @Get('presigned-upload-url')
  @Version('1')
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

  @Post('profile-image/commit')
  @Version('1')
  @ApiOkResponse({ type: String })
  @ApiOperation({ summary: '프로필 사진 업로드 완료 커밋' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async commitProfileImage(
    @CurrentUser() user: UserBaseInfo,
    @Body() payload: FilePathPayload,
  ): Promise<string> {
    return this.userService.commitProfileImage(user, payload.filePath);
  }

  @Get('profile-image-url')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: String })
  @ApiOperation({
    summary: '프로필 사진 URL 요청 (12시간 유효)',
  })
  async getProfileImageUrl(@CurrentUser() user: UserBaseInfo): Promise<string> {
    return this.userService.getProfileImageUrl(user);
  }

  @Patch()
  @Version('1')
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

  @Delete()
  @Version('1')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 탈퇴' })
  @ApiNoContentResponse()
  async deleteUser(@CurrentUser() user: UserBaseInfo): Promise<void> {
    return this.userService.deleteUser(user);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: '유저 정보 조회' })
  @ApiOkResponse({ type: UserDto })
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    return this.userService.getUserById(id);
  }

  @Get(':id/profile-image-url')
  @Version('1')
  @ApiOkResponse({ type: String })
  @ApiOperation({
    summary: '유저의 프로필 사진 URL 요청 (12시간 유효)',
  })
  async getProfileImageUrlById(@Param('id') id: string): Promise<string> {
    return this.userService.getProfileImageUrlById(id);
  }
}
