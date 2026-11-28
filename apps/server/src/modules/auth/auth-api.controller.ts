import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import {
  LoginInputSchema,
  RegisterInputSchema,
  type AuthSessionResponse,
  type AuthTokenResponse,
  type LoginInput,
  type RegisterInput,
} from '@repo/contracts';
import type { FastifyRequest } from 'fastify';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.ts';
import { AppAuthService } from './auth.service.ts';

type AuthRequest = FastifyRequest;

@AllowAnonymous()
@Controller('api/v1/auth')
export class AuthApiController {
  constructor(
    @Inject(AppAuthService) private readonly authService: AppAuthService,
  ) {}

  @Post('register')
  register(
    @Body(new ZodValidationPipe(RegisterInputSchema)) input: RegisterInput,
    @Req() req: AuthRequest,
  ): Promise<AuthTokenResponse> {
    return this.authService.register(input, req.headers);
  }

  @Post('login')
  login(
    @Body(new ZodValidationPipe(LoginInputSchema)) input: LoginInput,
    @Req() req: AuthRequest,
  ): Promise<AuthTokenResponse> {
    return this.authService.login(input, req.headers);
  }

  @Post('logout')
  logout(@Req() req: AuthRequest): Promise<{ success: true }> {
    return this.authService.logout(req.headers);
  }

  @Post('refresh')
  refresh(@Req() req: AuthRequest): Promise<AuthSessionResponse> {
    return this.authService.refreshSession(req.headers);
  }

  @Get('session')
  getSession(@Req() req: AuthRequest): Promise<AuthSessionResponse> {
    return this.authService.verifySession(req.headers);
  }
}
