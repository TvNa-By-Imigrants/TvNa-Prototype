import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import type { PaginatedPlaces, Place, PriceLevel } from '@repo/contracts';
import { runEffect } from '../../common/effect/run.ts';
import { PlacesService } from './places.service.ts';

@Controller('api/v1/places')
export class PlacesController {
  constructor(
    @Inject(PlacesService) private readonly placesService: PlacesService,
  ) {}

  @AllowAnonymous()
  @Get()
  async search(
    @Query('q') q?: string,
    @Query('category_id') category_id?: string,
    @Query('price_level') price_level?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('is_partnered') is_partnered?: string,
  ): Promise<PaginatedPlaces> {
    return runEffect(
      this.placesService.search({
        q,
        category_id,
        price_level: price_level as PriceLevel | undefined,
        page: page !== undefined ? Number(page) : undefined,
        limit: limit !== undefined ? Number(limit) : undefined,
        is_partnered:
          is_partnered === 'true'
            ? true
            : is_partnered === 'false'
              ? false
              : undefined,
      }),
    );
  }

  @AllowAnonymous()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Place> {
    return runEffect(this.placesService.getById(id));
  }
}
