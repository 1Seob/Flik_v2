import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { UserDto } from './dto/user.dto';
import { UpdateUserPayload } from './payload/update-user.payload';
import { UpdateUserData } from './type/update-user-data.type';
import { SupabaseService } from '../common/services/supabase.service';
import { v4 as uuidv4 } from 'uuid';
import { BadWordsFilterService } from 'src/user/bad-words-filter.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly supabaseService: SupabaseService,
    private readonly badWordsFilterService: BadWordsFilterService,
  ) {}

  private readonly BUCKET_NAME = process.env.NEXT_PUBLIC_STORAGE_BUCKET_1;

  async getUserById(userId: string): Promise<UserDto> {
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
    if (payload.nickname === null) {
      throw new BadRequestException('닉네임은 null이 될 수 없습니다.');
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
      if (this.badWordsFilterService.isProfane(payload.nickname)) {
        throw new ConflictException(
          '닉네임에 부적절한 단어가 포함되어 있습니다.',
        );
      }
      if (this.badWordsFilterService.isReservedUsername(payload.nickname)) {
        throw new BadRequestException('사용할 수 없는 닉네임입니다.');
      }
      if (
        this.badWordsFilterService.hasConsecutiveSpecialChars(payload.nickname)
      ) {
        throw new BadRequestException(
          '닉네임에 연속된 특수문자는 사용할 수 없습니다.',
        );
      }
      if (
        this.badWordsFilterService.startsOrEndsWithSpecialChar(payload.nickname)
      ) {
        throw new BadRequestException(
          '닉네임은 특수문자로 시작하거나 끝날 수 없습니다.',
        );
      }
    }
    if (payload.birthDate) {
      if (payload.birthDate > new Date()) {
        throw new BadRequestException('생년월일이 유효하지 않습니다.');
      }
    }

    const data: UpdateUserData = {
      birthday: payload.birthDate,
      gender: payload.gender,

      name: payload.nickname,
    };
    const updatedUser = await this.userRepository.updateUser(user.id, data);

    return UserDto.from(updatedUser);
  }

  async deleteUser(user: UserBaseInfo): Promise<void> {
    return this.userRepository.deleteUser(user.id);
  }

  async getPresignedUploadUrl(
    user: UserBaseInfo,
  ): Promise<{ url: string; filePath: string }> {
    if (!this.BUCKET_NAME) {
      throw new Error(
        'NEXT_PUBLIC_STORAGE_BUCKET_1 환경 변수가 정의되지 않았습니다.',
      );
    }
    const filePath = `${this.BUCKET_NAME}/${user.id}/${uuidv4()}/profile-image.png`;
    const url = await this.supabaseService.getSignedUploadUrl(
      this.BUCKET_NAME,
      filePath,
    );
    return { url, filePath };
  }

  async commitProfileImage(
    user: UserBaseInfo,
    filePath: string,
  ): Promise<string> {
    if (!this.BUCKET_NAME) {
      throw new Error(
        'NEXT_PUBLIC_STORAGE_BUCKET_1 환경 변수가 정의되지 않았습니다.',
      );
    }

    // 기존 이미지 삭제 (실패해도 경고만)
    if (user.profileImagePath) {
      this.supabaseService
        .deleteImage(this.BUCKET_NAME, user.profileImagePath)
        .catch((err) =>
          console.warn(`Failed to delete old profile image: ${err.message}`),
        );
    }

    // 새 경로 반영
    await this.userRepository.updateProfileImagePath(user.id, filePath);
    const updatedUser = await this.userRepository.getUserById(user.id);
    if (!updatedUser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return this.getProfileImageUrl(updatedUser);
  }

  async getProfileImageUrl(user: UserBaseInfo): Promise<string> {
    if (!user.profileImagePath) {
      throw new NotFoundException('프로필 이미지가 존재하지 않습니다.');
    }
    if (!this.BUCKET_NAME) {
      throw new Error(
        'NEXT_PUBLIC_STORAGE_BUCKET_1 환경 변수가 정의되지 않았습니다.',
      );
    }

    return this.supabaseService.getSignedUrl(
      this.BUCKET_NAME,
      user.profileImagePath,
    );
  }

  async updateLastAccess(userId: string): Promise<void> {
    await this.userRepository.updateLastAccess(userId);
  }
}
