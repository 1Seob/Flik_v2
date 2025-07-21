import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';

@Injectable()
export class BcryptPasswordService {
  async getEncryptPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    return hash(password, salt);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return compare(password, hashedPassword);
  }
}
