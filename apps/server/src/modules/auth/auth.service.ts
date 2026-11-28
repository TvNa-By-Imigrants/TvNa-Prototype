import {
  ConflictException,
  Inject,
  InternalServerErrorException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { isAPIError } from 'better-auth/api';
import { fromNodeHeaders } from 'better-auth/node';
import type { IncomingHttpHeaders } from 'node:http';
import {
  ERROR_CODES,
  type AuthSessionResponse,
  type AuthTokenResponse,
  type LoginInput,
  type RegisterInput,
} from '@repo/contracts';
import { auth } from '../../auth.ts';

@Injectable()
export class AppAuthService {
  private readonly logger = new Logger(AppAuthService.name);

  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService<typeof auth>,
  ) {}

  private toWebHeaders(headers: IncomingHttpHeaders) {
    return fromNodeHeaders(headers);
  }

  async register(
    input: RegisterInput,
    headers: IncomingHttpHeaders,
  ): Promise<AuthTokenResponse> {
    try {
      const result = await this.authService.api.signUpEmail({
        body: input,
        headers: this.toWebHeaders(headers),
      });
      if (!result.token) {
        throw new InternalServerErrorException({
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: 'Registration did not create a session',
        });
      }

      return {
        token: result.token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
      };
    } catch (error) {
      this.mapAuthError(error);
    }
  }

  async login(
    input: LoginInput,
    headers: IncomingHttpHeaders,
  ): Promise<AuthTokenResponse> {
    try {
      const result = await this.authService.api.signInEmail({
        body: input,
        headers: this.toWebHeaders(headers),
      });
      if (!result.token) {
        throw new InternalServerErrorException({
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: 'Login did not create a session',
        });
      }

      return {
        token: result.token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
      };
    } catch (error) {
      this.mapAuthError(error);
    }
  }

  async verifySession(
    headers: IncomingHttpHeaders,
  ): Promise<AuthSessionResponse> {
    try {
      const result = await this.authService.api.getSession({
        headers: this.toWebHeaders(headers),
        query: { disableCookieCache: true },
      });
      if (!result) {
        throw new UnauthorizedException({
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Session is missing or expired',
        });
      }

      return {
        token: result.session.token,
        expiresAt: result.session.expiresAt.toISOString(),
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
      };
    } catch (error) {
      this.mapAuthError(error);
    }
  }

  async refreshSession(
    headers: IncomingHttpHeaders,
  ): Promise<AuthSessionResponse> {
    return this.verifySession(headers);
  }

  async logout(headers: IncomingHttpHeaders): Promise<{ success: true }> {
    const currentSession = await this.verifySession(headers);
    await this.authService.api.revokeSession({
      body: { token: currentSession.token },
      headers: this.toWebHeaders(headers),
    });
    this.logger.log(
      JSON.stringify({
        event: 'session.revoked',
        userId: currentSession.user.id,
      }),
    );
    return { success: true };
  }

  listSessions(headers: IncomingHttpHeaders) {
    return this.authService.api.listSessions({
      headers: this.toWebHeaders(headers),
    });
  }

  async revokeSession(
    sessionId: string,
    headers: IncomingHttpHeaders,
  ): Promise<boolean> {
    const sessions = await this.listSessions(headers);
    const target = sessions.find((session) => session.id === sessionId);
    if (!target) {
      return false;
    }

    await this.authService.api.revokeSession({
      body: { token: target.token },
      headers: this.toWebHeaders(headers),
    });

    this.logger.log(
      JSON.stringify({
        event: 'session.revoked',
        sessionId,
      }),
    );

    return true;
  }

  private mapAuthError(error: unknown): never {
    if (!isAPIError(error)) {
      throw error;
    }

    switch (error.body?.code) {
      case 'USER_ALREADY_EXISTS':
      case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
        throw new ConflictException({
          code: ERROR_CODES.EMAIL_TAKEN,
          message: 'Email already exists',
        });
      case 'CREDENTIAL_ACCOUNT_NOT_FOUND':
      case 'INVALID_EMAIL_OR_PASSWORD':
      case 'INVALID_TOKEN':
      case 'TOKEN_EXPIRED':
      case 'SESSION_EXPIRED':
        throw new UnauthorizedException({
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Invalid or expired authentication credentials',
        });
      default:
        throw error;
    }
  }
}
