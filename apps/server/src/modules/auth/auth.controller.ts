import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import type { FastifyRequest } from 'fastify';
import { AppAuthService } from './auth.service.ts';

type AuthenticatedRequest = FastifyRequest & {
  user?: { id?: string } | null;
  session?: { session?: { id?: string } } | null;
};

@Controller('api/sessions')
export class AuthController {
  constructor(
    @Inject(AppAuthService) private readonly authService: AppAuthService,
  ) {}

  @OptionalAuth()
  @Get()
  async listSessions(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const sessions = await this.authService.listSessions(req.headers);
    const currentId = req.session?.session?.id;
    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        ipAddress: session.ipAddress ?? null,
        userAgent: session.userAgent ?? null,
        isCurrent: session.id === currentId,
      })),
    };
  }

  @OptionalAuth()
  @Post(':id/revoke')
  async revokeSession(
    @Param('id') sessionId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ revoked: boolean }> {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return {
      revoked: await this.authService.revokeSession(sessionId, req.headers),
    };
  }
}
