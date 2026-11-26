import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { Plan, PlanInput, PlansList } from '@repo/contracts';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.ts';
import { runEffect } from '../../common/effect/run.ts';
import { planInputSchema } from '@repo/contracts';
import { PlansService } from './plans.service.ts';

type AuthenticatedRequest = FastifyRequest & {
  user?: { id?: string } | null;
};

function requireUserId(request: AuthenticatedRequest): string {
  const userId = request.user?.id;
  if (!userId) {
    throw new UnauthorizedException();
  }
  return userId;
}

@Controller('api/v1/plans')
export class PlansController {
  constructor(
    @Inject(PlansService) private readonly plansService: PlansService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(planInputSchema)) input: PlanInput,
    @Req() request: AuthenticatedRequest,
  ): Promise<{ plan: Plan }> {
    const plan = await runEffect(
      this.plansService.create(requireUserId(request), input),
    );
    return { plan };
  }

  @Get()
  async list(@Req() request: AuthenticatedRequest): Promise<PlansList> {
    return runEffect(this.plansService.list(requireUserId(request)));
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<{ plan: Plan }> {
    const plan = await runEffect(
      this.plansService.getById(requireUserId(request), id),
    );
    return { plan };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(planInputSchema)) input: PlanInput,
    @Req() request: AuthenticatedRequest,
  ): Promise<{ plan: Plan }> {
    const plan = await runEffect(
      this.plansService.update(requireUserId(request), id, input),
    );
    return { plan };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await runEffect(this.plansService.delete(requireUserId(request), id));
  }
}
