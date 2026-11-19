import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { UserHasPermission } from '@thallesp/nestjs-better-auth';
import { runEffect } from '../../common/effect/run.ts';
import { PokemonService } from './pokemon.service.ts';

@Controller('api/pokemon')
export class PokemonController {
  constructor(
    @Inject(PokemonService) private readonly pokemonService: PokemonService,
  ) {}

  @UserHasPermission({ permission: { pokemon: ['read'] } })
  @Get(':name')
  findOne(@Param('name') name: string) {
    return runEffect(this.pokemonService.getByName(name));
  }

  @UserHasPermission({ permission: { pokemon: ['read'] } })
  @Get()
  list(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return runEffect(
      this.pokemonService.list(
        limit === undefined ? undefined : Number(limit),
        offset === undefined ? undefined : Number(offset),
      ),
    );
  }
}
