import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { BCRYPT_SALT_ROUNDS } from '@myclass/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─── Login ──────────────────────────────────────────────────────
  async login(dto: LoginDto, ip: string, deviceInfo: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      await this.logActivity(user.id, 'LOGIN_FAILED', undefined, undefined, ip);
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role.name, user.roleId);

    // Save session
    const refreshHash = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.session.create({
      data: { userId: user.id, refreshTokenHash: refreshHash, deviceInfo, ipAddress: ip, expiresAt },
    });

    await this.logActivity(user.id, 'LOGIN', undefined, undefined, ip);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role.name, avatarUrl: user.avatarUrl },
    };
  }

  // ─── Logout ─────────────────────────────────────────────────────
  async logout(userId: string, sessionId?: string) {
    if (sessionId) {
      await this.prisma.session.deleteMany({ where: { id: sessionId, userId } });
    } else {
      await this.prisma.session.deleteMany({ where: { userId } });
    }
    await this.logActivity(userId, 'LOGOUT');
  }

  // ─── Refresh Token ──────────────────────────────────────────────
  async refresh(refreshToken: string) {
    let payload: { sub: string; email: string; role: string; roleId: string };
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Invalid refresh token' });
    }

    const sessions = await this.prisma.session.findMany({
      where: { userId: payload.sub, expiresAt: { gt: new Date() } },
    });

    let validSession: typeof sessions[0] | null = null;
    for (const session of sessions) {
      const match = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (match) { validSession = session; break; }
    }

    if (!validSession) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Session expired or revoked' });
    }

    // Rotate refresh token
    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(
      payload.sub, payload.email, payload.role, payload.roleId,
    );
    const newRefreshHash = await bcrypt.hash(newRefreshToken, BCRYPT_SALT_ROUNDS);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.session.update({
      where: { id: validSession.id },
      data: { refreshTokenHash: newRefreshHash, expiresAt: newExpiresAt },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  // ─── Get Current User ───────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { role: true, student: true, teacher: true },
    });
    if (!user) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  // ─── Sessions ───────────────────────────────────────────────────
  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      select: { id: true, deviceInfo: true, ipAddress: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({ where: { id: sessionId, userId } });
    if (!session) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Session not found' });
    await this.prisma.session.delete({ where: { id: sessionId } });
  }

  // ─── Forgot Password ────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email, deletedAt: null } });
    // Always return success to prevent email enumeration
    if (!user) return { message: 'If that email exists, a reset link has been sent' };

    const token = uuidv4();
    // Store token in settings table temporarily (simple approach)
    await this.prisma.setting.upsert({
      where: { key: `reset_${token}` },
      update: { value: JSON.stringify({ userId: user.id, expiresAt: Date.now() + 15 * 60 * 1000 }) },
      create: { key: `reset_${token}`, value: JSON.stringify({ userId: user.id, expiresAt: Date.now() + 15 * 60 * 1000 }) },
    });

    // TODO: Send email via Resend
    console.log(`Password reset token for ${dto.email}: ${token}`);
    return { message: 'If that email exists, a reset link has been sent' };
  }

  // ─── Reset Password ─────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const setting = await this.prisma.setting.findUnique({ where: { key: `reset_${dto.token}` } });
    if (!setting) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Invalid or expired reset token' });

    const data: { userId: string; expiresAt: number } = JSON.parse(setting.value);
    if (Date.now() > data.expiresAt) {
      await this.prisma.setting.delete({ where: { key: `reset_${dto.token}` } });
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Reset token has expired' });
    }

    const hash = await bcrypt.hash(dto.newPassword, BCRYPT_SALT_ROUNDS);
    await this.prisma.user.update({ where: { id: data.userId }, data: { passwordHash: hash } });
    await this.prisma.session.deleteMany({ where: { userId: data.userId } });
    await this.prisma.setting.delete({ where: { key: `reset_${dto.token}` } });

    return { message: 'Password reset successfully' };
  }

  // ─── Helpers ────────────────────────────────────────────────────
  private async generateTokens(userId: string, email: string, role: string, roleId: string) {
    const payload = { sub: userId, email, role, roleId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async logActivity(userId: string, action: string, entity?: string, entityId?: string, ip?: string) {
    await this.prisma.activityLog.create({ data: { userId, action, entity, entityId, ipAddress: ip } });
  }
}
