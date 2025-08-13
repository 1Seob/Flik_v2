import { PrismaService } from '../common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UpdateUserData } from './type/update-user-data.type';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });
  }

  async updateUser(userId: number, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        gender: data.gender ?? undefined,
        birthday: data.birthday ?? undefined,
        name: data.name,
      },
    });
  }

  async deleteUser(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getAllUsersWithParagraphLikes(): Promise<
    { id: number; likedBookIds: number[]; readBookIds: number[] }[]
  > {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        paragraphLikes: {
          select: {
            paragraph: {
              select: {
                bookId: true,
              },
            },
          },
        },
        userBooks: {
          select: {
            bookId: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      likedBookIds: [
        ...new Set(user.paragraphLikes.map((like) => like.paragraph.bookId)),
      ],
      readBookIds: user.userBooks.map((read) => read.bookId),
    }));
  }

  async isNameExist(name: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });
    return !!user;
  }

  async updateProfileImagePath(
    userId: number,
    profileImagePath: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profileImagePath,
      },
    });
  }
}
