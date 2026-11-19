import { Module } from '@nestjs/common';
import { PokemonController } from './pokemon.controller.ts';
import { POKEAPI_BASE_URL, PokemonService } from './pokemon.service.ts';

@Module({
  providers: [
    PokemonService,
    {
      provide: POKEAPI_BASE_URL,
      useValue: process.env.POKEAPI_BASE_URL ?? 'https://pokeapi.co/api/v2',
    },
  ],
  controllers: [PokemonController],
})
export class PokemonModule {}
