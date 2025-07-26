import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { SignUpPayload } from './payload/sign-up.payload';
import { BcryptPasswordService } from './bcrypt-password.service';
import { SignUpData } from './type/sign-up-data.type';
import { Tokens } from './type/tokens.type';
import { TokenService } from './token.service';
import { LoginPayload } from './payload/login.payload';
import { ChangePasswordPayload } from './payload/change-password.payload';
import { UserBaseInfo } from './type/user-base-info.type';
import { SupabaseService } from 'src/common/services/supabase.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordService: BcryptPasswordService,
    private readonly tokenService: TokenService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async signUp(
    payload: SignUpPayload,
    profileImageFile?: Express.Multer.File,
  ): Promise<Tokens> {
    const loginId = await this.authRepository.getUserByLoginId(payload.loginId);
    if (loginId) {
      throw new ConflictException('이미 사용중인 로그인 ID입니다.');
    }
    const name = await this.authRepository.getUserByName(payload.name);
    if (name) {
      throw new ConflictException('이미 사용중인 닉네임입니다.');
    }
    const BadWordsFilter = require('badwords-ko');
    const filter = new BadWordsFilter();

    const BadWordsNext = require('bad-words-next');
    const en = require('bad-words-next/lib/en');
    const badwords = new BadWordsNext({ data: en });

    if (filter.isProfane(payload.loginId) || badwords.check(payload.loginId)) {
      throw new ConflictException(
        '로그인 ID에 부적절한 단어가 포함되어 있습니다.',
      );
    }

    if (filter.isProfane(payload.name) || badwords.check(payload.name)) {
      throw new ConflictException(
        '닉네임에 부적절한 단어가 포함되어 있습니다.',
      );
    }
    const email = await this.authRepository.getUserByEmail(payload.email);
    if (email) {
      throw new ConflictException('이미 사용중인 이메일입니다.');
    }

    if (payload.password !== payload.passwordConfirm) {
      throw new ConflictException('비밀번호가 일치하지 않습니다.');
    }

    if (payload.birthday > new Date()) {
      throw new ConflictException('생년월일이 유효하지 않습니다.');
    }

    if (
      !payload.interestCategories ||
      payload.interestCategories.length === 0
    ) {
      throw new ConflictException('관심 카테고리를 선택해주세요.');
    }
    if (payload.interestCategories.length > 3) {
      throw new ConflictException(
        '관심 카테고리는 최대 3개까지 선택 가능합니다.',
      );
    }

    const hashedPassword = await this.passwordService.getEncryptPassword(
      payload.password,
    );

    let profileImageUrl: string | undefined = undefined;
    let tempPath: string | undefined = undefined;
    let finalPath: string | undefined = undefined;
    if (profileImageFile) {
      tempPath = `profile-images/temp/${uuidv4()}-${profileImageFile.originalname}`;
      const { data, error } = await this.supabaseService.uploadImage(
        'profile-images',
        tempPath,
        profileImageFile.buffer,
      );
      if (error) {
        throw new ConflictException('프로필 이미지 업로드에 실패했습니다.');
      }
      profileImageUrl = data?.path
        ? this.supabaseService.getPublicUrl('profile-images', data.path)
        : undefined;
    }

    const inputData: SignUpData = {
      loginId: payload.loginId,
      gender: payload.gender,
      birthday: payload.birthday,
      profileImageUrl: profileImageUrl,
      email: payload.email,
      password: hashedPassword,
      name: payload.name,
      interestCategories: payload.interestCategories,
    };

    const createdUser = await this.authRepository.createUser(inputData);

    if (tempPath && profileImageFile) {
      finalPath = `profile-images/${createdUser.id}/${profileImageFile.originalname}`;
      const { data, error } = await this.supabaseService.copyImage(
        'profile-images',
        tempPath,
        finalPath,
      );
      if (error) {
        throw new ConflictException('프로필 이미지 복사에 실패했습니다.');
      }
      await this.supabaseService.deleteImage('profile-images', tempPath);
      profileImageUrl = this.supabaseService.getPublicUrl(
        'profile-images',
        finalPath,
      );
      await this.authRepository.updateUser(createdUser.id, { profileImageUrl });
    }

    return this.generateTokens(createdUser.id);
  }

  async login(payload: LoginPayload): Promise<Tokens> {
    const user = await this.authRepository.getUserByLoginId(payload.loginId);
    if (!user) {
      throw new NotFoundException('존재하지 않는 로그인 ID입니다.');
    }
    const isPasswordMatch = await this.passwordService.validatePassword(
      payload.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new ConflictException('비밀번호가 일치하지 않습니다.');
    }

    return this.generateTokens(user.id);
  }

  async refresh(refreshToken: string): Promise<Tokens> {
    const data = this.tokenService.verifyRefreshToken(refreshToken);

    const user = await this.authRepository.getUserById(data.userId);
    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    return this.generateTokens(user.id);
  }

  async changePassword(
    payload: ChangePasswordPayload,
    user: UserBaseInfo,
  ): Promise<void> {
    const isValid = await this.passwordService.validatePassword(
      payload.currentPassword,
      user.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
    }

    const hashedPassword = await this.passwordService.getEncryptPassword(
      payload.newPassword,
    );

    await this.authRepository.updateUser(user.id, {
      password: hashedPassword,
    });
  }

  private async generateTokens(userId: number): Promise<Tokens> {
    const tokens = this.tokenService.generateTokens({ userId });

    await this.authRepository.updateUser(userId, {
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }
}
