import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { UserDto } from './dto/user.dto';
import { UpdateUserPayload } from './payload/update-user.payload';
import { UpdateUserData } from '../auth/type/update-user-data.type';
import { SupabaseService } from '../common/services/supabase.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getUserById(userId: number): Promise<UserDto> {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return UserDto.from(user);
  }

  async updateUser(
    payload: UpdateUserPayload,
    user: UserBaseInfo,
  ): Promise<UserDto> {
    if (payload.username === null) {
      throw new BadRequestException('로그인 ID는 null이 될 수 없습니다.');
    }
    if (payload.nickname === null) {
      throw new BadRequestException('닉네임은 null이 될 수 없습니다.');
    }

    if (payload.email === null) {
      throw new BadRequestException('이메일은 null이 될 수 없습니다.');
    }
    const BadWordsFilter = require('badwords-ko');
    const filter = new BadWordsFilter();

    const BadWordsNext = require('bad-words-next');
    const en = require('bad-words-next/lib/en');
    const badwords = new BadWordsNext({ data: en });

    if (payload.username) {
      if (isReservedUsername(payload.username)) {
        throw new BadRequestException('사용할 수 없는 아이디입니다.');
      }

      if (hasConsecutiveSpecialChars(payload.username)) {
        throw new BadRequestException(
          '아이디에 연속된 특수문자는 사용할 수 없습니다.',
        );
      }

      if (startsOrEndsWithSpecialChar(payload.username)) {
        throw new BadRequestException(
          '아이디는 특수문자로 시작하거나 끝날 수 없습니다.',
        );
      }
      if (payload.username === user.loginId) {
        throw new BadRequestException('현재 사용 중인 로그인 ID와 동일합니다.');
      }
      const isLoginIdExist = await this.userRepository.isEmailExist(
        payload.username,
      );
      if (isLoginIdExist) {
        throw new ConflictException('이미 사용 중인 로그인 ID입니다.');
      }
      if (
        filter.isProfane(payload.username) ||
        badwords.check(payload.username)
      ) {
        throw new ConflictException(
          '로그인 ID에 부적절한 단어가 포함되어 있습니다.',
        );
      }
    }
    if (payload.email) {
      if (payload.email === user.email) {
        throw new BadRequestException('현재 사용 중인 이메일과 동일합니다.');
      }
      const isEmailExist = await this.userRepository.isEmailExist(
        payload.email,
      );
      if (isEmailExist) {
        throw new ConflictException('이미 사용 중인 이메일입니다.');
      }
    }
    if (payload.nickname) {
      if (payload.nickname === user.name) {
        throw new BadRequestException('현재 사용 중인 닉네임과 동일합니다.');
      }
      const isNameExist = await this.userRepository.isNameExist(
        payload.nickname,
      );

      if (isNameExist) {
        throw new ConflictException('이미 사용 중인 닉네임입니다.');
      }
      if (
        filter.isProfane(payload.nickname) ||
        badwords.check(payload.nickname)
      ) {
        throw new ConflictException(
          '닉네임에 부적절한 단어가 포함되어 있습니다.',
        );
      }
    }
    if (payload.birthday) {
      if (payload.birthday > new Date()) {
        throw new BadRequestException('생년월일이 유효하지 않습니다.');
      }
    }
    if (payload.interestCategories) {
      if (payload.interestCategories.length > 3) {
        throw new BadRequestException(
          '관심 카테고리는 최대 3개까지 선택 가능합니다.',
        );
      }
    }
    console.log(payload.interestCategories);

    const data: UpdateUserData = {
      loginId: payload.username,
      birthday: payload.birthday,
      gender: payload.gender,
      email: payload.email,
      name: payload.nickname,
      interestCategories: payload.interestCategories,
    };
    const updatedUser = await this.userRepository.updateUser(user.id, data);

    return UserDto.from(updatedUser);
  }

  async deleteUser(userId: number, user: UserBaseInfo): Promise<void> {
    if (userId !== user.id) {
      throw new ForbiddenException('타인의 계정은 삭제할 수 없습니다.');
    }

    return this.userRepository.deleteUser(userId);
  }
  /*
  async getAllUsersWithBooks(): Promise<
    { id: number; likedBookIds: number[]; readBookIds: number[] }[]
  > {
    return this.userRepository.getAllUsersWithBooks();
  }
*/
  async getAllUsersWithParagraphLikes(): Promise<
    { id: number; likedBookIds: number[]; readBookIds: number[] }[]
  > {
    return this.userRepository.getAllUsersWithParagraphLikes();
  }

  async getPresignedUploadUrl(user: UserBaseInfo): Promise<string> {
    if (user.profileImagePath) {
      await this.supabaseService.deleteImage(
        'profile-images',
        user.profileImagePath,
      );
    }
    const filePath = `profile-images/${user.id}/${uuidv4()}/profile-image.png`;
    await this.userRepository.updateProfileImagePath(user.id, filePath);
    return this.supabaseService.getSignedUploadUrl('profile-images', filePath);
  }

  async getPresignedDownloadUrl(user: UserBaseInfo): Promise<string> {
    if (!user.profileImagePath) {
      throw new NotFoundException('프로필 이미지가 존재하지 않습니다.');
    }
    return this.supabaseService.getSignedDownloadUrl(
      'profile-images',
      user.profileImagePath,
    );
  }
}

const RESERVED_USERNAMES = ['admin', 'root', 'support', 'manager', 'system'];

function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.includes(username.toLowerCase());
}

function hasConsecutiveSpecialChars(username: string): boolean {
  return /[._]{2,}/.test(username); // 연속된 마침표 또는 밑줄
}

function startsOrEndsWithSpecialChar(username: string): boolean {
  return /^[._]|[._]$/.test(username); // 시작 또는 끝이 특수문자
}
