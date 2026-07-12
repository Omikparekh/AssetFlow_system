import prisma from "../config/database";
import { RefreshToken } from "@prisma/client";

export class TokenRepository {
  async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async findActive(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findFirst({
      where: {
        token,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async revoke(token: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}

export const tokenRepository = new TokenRepository();
