import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller.ts';
import { PlansService } from './plans.service.ts';

@Module({
  controllers: [PlansController],
  providers: [PlansService],
})
export class PlansModule {}
