import { Controller, Get, Query } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('api/ping')
export class PingController {
  @AllowAnonymous()
  @Get()
  ping(@Query('nonce') nonce?: string) {
    const startedAt = process.hrtime.bigint();
    const serverTime = new Date();
    const processingTimeMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    return {
      serverTime,
      uptimeSeconds: process.uptime(),
      processingTimeMs,
      nonce: nonce ?? null,
    };
  }
}
