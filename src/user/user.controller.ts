import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UpdateUserPayload } from './payload/update-user.payload';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
@ApiTags('User API')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  @ApiOperation({ summary: '유저 정보 가져오기' })
  @ApiOkResponse({ type: UserDto })
  async getUserById(@Param('userId') userId: number): Promise<UserDto> {
    return this.userService.getUserById(userId);
  }

  @Patch(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 정보 수정' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: UserDto })
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateUser(
    @Body() payload: UpdateUserPayload,
    @CurrentUser() user: UserBaseInfo,
    @UploadedFile() profileImageFile?: Express.Multer.File,
  ): Promise<UserDto> {
    return this.userService.updateUser(payload, user, profileImageFile);
  }

  @Delete(':userId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 탈퇴' })
  @ApiNoContentResponse()
  async deleteUser(
    @Param('userId') userId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.userService.deleteUser(userId, user);
  }

  @Get()
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
}
