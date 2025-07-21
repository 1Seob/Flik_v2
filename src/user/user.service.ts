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
import {
  SupabaseService,
  extractFilePathFromPublicUrl,
} from '../common/services/supabase.service';

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
    profileImageFile?: Express.Multer.File,
  ): Promise<UserDto> {
    if (payload.loginId === null) {
      throw new BadRequestException('로그인 ID는 null이 될 수 없습니다.');
    }
    if (payload.name === null) {
      throw new BadRequestException('닉네임은 null이 될 수 없습니다.');
    }

    if (payload.email === null) {
      throw new BadRequestException('이메일은 null이 될 수 없습니다.');
    }
    if (payload.loginId) {
      if (payload.loginId === user.loginId) {
        throw new BadRequestException('현재 사용 중인 로그인 ID와 동일합니다.');
      }
      const isLoginIdExist = await this.userRepository.isEmailExist(
        payload.loginId,
      );
      if (isLoginIdExist) {
        throw new ConflictException('이미 사용 중인 로그인 ID입니다.');
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
    if (payload.name) {
      if (payload.name === user.name) {
        throw new BadRequestException('현재 사용 중인 닉네임과 동일합니다.');
      }
      const isNameExist = await this.userRepository.isNameExist(payload.name);

      if (isNameExist) {
        throw new ConflictException('이미 사용 중인 닉네임입니다.');
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

    let profileImageUrl: string | undefined | null = undefined;
    if (payload.removeProfileImage) {
      if (profileImageFile) {
        throw new BadRequestException(
          '프로필 이미지 삭제 요청과 파일 업로드는 동시에 처리할 수 없습니다.',
        );
      }
      if (!user.profileImageUrl) {
        throw new BadRequestException('삭제할 프로필 이미지가 없습니다.');
      }
      const filePath = extractFilePathFromPublicUrl(user.profileImageUrl);
      if (filePath) {
        const { data: deleteResult, error: deleteError } =
          await this.supabaseService.deleteImage('profile-images', filePath);

        if (deleteError) {
          console.error('이미지 삭제 실패:', deleteError.message);
          throw new BadRequestException(
            '기존 프로필 이미지 삭제에 실패했습니다.',
          );
        }
        profileImageUrl = null;
      }
    }
    if (user.profileImageUrl) {
      const filePath = extractFilePathFromPublicUrl(user.profileImageUrl);
      if (filePath) {
        const { data: deleteResult, error: deleteError } =
          await this.supabaseService.deleteImage('profile-images', filePath);

        if (deleteError) {
          console.error('이미지 삭제 실패:', deleteError.message);
          throw new BadRequestException(
            '기존 프로필 이미지 삭제에 실패했습니다.',
          );
        }
      }
    }
    if (profileImageFile) {
      const filePath = `profile-images/${user.id}/${profileImageFile.originalname}`;
      const { data, error } = await this.supabaseService.uploadImage(
        'profile-images',
        filePath,
        profileImageFile.buffer,
      );
      if (error) {
        console.error('업로드 실패:', error.message);
        throw new BadRequestException('업로드 실패: ' + error.message);
      }
      profileImageUrl = data?.path
        ? this.supabaseService.getPublicUrl('profile-images', data.path)
        : undefined;
    }

    const data: UpdateUserData = {
      loginId: payload.loginId,
      birthday: payload.birthday,
      gender: payload.gender,
      profileImageUrl,
      email: payload.email,
      name: payload.name,
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
}
