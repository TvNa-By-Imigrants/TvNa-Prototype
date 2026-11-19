import { Controller, Get } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('api/health')
export class HealthController {
  @AllowAnonymous()
  @Get()
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
