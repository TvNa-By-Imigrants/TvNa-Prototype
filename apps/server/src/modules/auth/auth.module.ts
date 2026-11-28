import { Module } from '@nestjs/common';
import { AppAuthService } from './auth.service.ts';
import { AuthController } from './auth.controller.ts';
import { AuthApiController } from './auth-api.controller.ts';
import { SessionRevocationService } from './session-revocation.service.ts';

@Module({
  controllers: [AuthController, AuthApiController],
  providers: [AppAuthService, SessionRevocationService],
  exports: [AppAuthService, SessionRevocationService],
})
export class AppAuthModule {}
