import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
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
import * as nodemailer from 'nodemailer';
import { SendEmailPayload } from './payload/send-email.payload';
import { VerificationPayload } from './payload/verification.payload';
import { ActionType } from '@prisma/client';
import generator from 'generate-password-ts';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordService: BcryptPasswordService,
    private readonly tokenService: TokenService,
    private readonly supabaseService: SupabaseService,
  ) {}

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_ID,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  async signUp(
    payload: SignUpPayload,
    profileImageFile?: Express.Multer.File,
  ): Promise<Tokens> {
    if (isReservedUsername(payload.loginId)) {
      throw new BadRequestException('사용할 수 없는 아이디입니다.');
    }
    if (hasConsecutiveSpecialChars(payload.loginId)) {
      throw new BadRequestException(
        '아이디에 연속된 특수문자는 사용할 수 없습니다.',
      );
    }
    if (startsOrEndsWithSpecialChar(payload.loginId)) {
      throw new BadRequestException(
        '아이디는 특수문자로 시작하거나 끝날 수 없습니다.',
      );
    }

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

  async sendVerificationEmail(emailPayload: SendEmailPayload): Promise<void> {
    const isEmailExist = await this.authRepository.getUserByEmail(
      emailPayload.email,
    );
    if (isEmailExist) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const verificationData = await this.authRepository.getVerificationData(
      emailPayload.email,
    );
    if (verificationData) {
      const elapsedMs = Date.now() - verificationData.createdAt.getTime();
      if (verificationData.expiredAt > new Date()) {
        throw new ConflictException('이미 인증번호가 발급되었습니다.');
      }
      if (elapsedMs < 10 * 60 * 1000) {
        throw new ConflictException('인증은 10분 이내로 재시도할 수 없습니다.');
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.transporter.sendMail({
      from: process.env.GMAIL_ID,
      to: emailPayload.email,
      subject: 'FLIK 회원가입 인증번호',
      text: `인증번호는 ${code}입니다. 5분 이내로 입력해주세요.`,
    });
    await this.authRepository.saveVerificationCode(emailPayload.email, code);
  }

  async verifyEmail(payload: VerificationPayload): Promise<void> {
    const verificationData = await this.authRepository.getVerificationData(
      payload.email,
    );
    if (!verificationData) {
      throw new NotFoundException('인증정보를 찾을 수 없습니다.');
    }

    if (verificationData.expiredAt < new Date()) {
      throw new ConflictException('인증번호가 만료되었습니다.');
    }
    const count = await this.authRepository.getVerificationTryCount(
      payload.email,
    );
    if (count >= 5) {
      throw new ConflictException('인증번호 시도 횟수(5회)를 초과했습니다.');
    }
    if (verificationData.code !== payload.code) {
      await this.authRepository.incrementVerificationTryCount(payload.email);
      throw new ConflictException('인증번호가 일치하지 않습니다.');
    }
    await this.authRepository.deleteVerification(payload.email);
  }

  async findId(emailPayload: SendEmailPayload): Promise<void> {
    const isEmailExist = await this.authRepository.isEmailExist(
      emailPayload.email,
    );
    if (!isEmailExist) {
      throw new NotFoundException('존재하지 않는 이메일입니다.');
    }
    const user = await this.authRepository.getUserByEmail(emailPayload.email);
    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }
    const attemptData = await this.authRepository.getAuthAttemptData(
      emailPayload.email,
    );
    if (attemptData) {
      const elapsedMs = Date.now() - attemptData.attemptedAt.getTime();
      if (elapsedMs < 30 * 60 * 1000) {
        throw new ConflictException(
          'ID 찾기는 30분 이내로 재시도할 수 없습니다.',
        );
      }
    }
    await this.authRepository.saveAuthAttempt(
      emailPayload.email,
      ActionType.FIND_ID,
    );
    await this.transporter.sendMail({
      from: process.env.GMAIL_ID,
      to: emailPayload.email,
      subject: 'FLIK 아이디 찾기',
      text: `${user.name}님의 ID는 ${user.loginId}입니다.`,
    });
  }

  async sendFindPasswordEmail(
    loginId: string,
    emailPayload: SendEmailPayload,
  ): Promise<void> {
    const user = await this.authRepository.getUserByLoginId(loginId);
    if (!user) {
      throw new NotFoundException('존재하지 않는 로그인 ID입니다.');
    }
    if (user.email !== emailPayload.email) {
      throw new ConflictException('로그인 ID와 이메일이 일치하지 않습니다.');
    }

    const verificationData = await this.authRepository.getVerificationData(
      emailPayload.email,
    );
    if (verificationData) {
      const elapsedMs = Date.now() - verificationData.createdAt.getTime();
      if (verificationData.expiredAt > new Date()) {
        throw new ConflictException('이미 인증번호가 발급되었습니다.');
      }
      if (elapsedMs < 10 * 60 * 1000) {
        throw new ConflictException('인증은 10분 이내로 재시도할 수 없습니다.');
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.transporter.sendMail({
      from: process.env.GMAIL_ID,
      to: emailPayload.email,
      subject: 'FLIK 비밀번호 찾기 인증번호',
      text: `인증번호는 ${code}입니다. 5분 이내로 입력해주세요.`,
    });
    await this.authRepository.saveVerificationCode(emailPayload.email, code);
  }

  async verifyPassword(payload: VerificationPayload): Promise<void> {
    const user = await this.authRepository.getUserByEmail(payload.email);
    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }
    const verificationData = await this.authRepository.getVerificationData(
      payload.email,
    );
    if (!verificationData) {
      throw new NotFoundException('인증정보를 찾을 수 없습니다.');
    }

    if (verificationData.expiredAt < new Date()) {
      throw new ConflictException('인증번호가 만료되었습니다.');
    }
    const count = await this.authRepository.getVerificationTryCount(
      payload.email,
    );
    if (count >= 5) {
      throw new ConflictException('인증번호 시도 횟수(5회)를 초과했습니다.');
    }
    if (verificationData.code !== payload.code) {
      await this.authRepository.incrementVerificationTryCount(payload.email);
      throw new ConflictException('인증번호가 일치하지 않습니다.');
    }

    const newPassword = generator.generate({
      length: 12,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
    });
    console.log(newPassword);
    const hashedPassword =
      await this.passwordService.getEncryptPassword(newPassword);
    await this.authRepository.updateUser(user.id, {
      password: hashedPassword,
    });

    await this.transporter.sendMail({
      from: process.env.GMAIL_ID,
      to: payload.email,
      subject: 'FLIK 비밀번호 찾기',
      text: `새로운 비밀번호는 ${newPassword}입니다. 로그인 후 반드시 비밀번호를 변경해주세요.`,
    });
    await this.authRepository.deleteVerification(payload.email);
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
