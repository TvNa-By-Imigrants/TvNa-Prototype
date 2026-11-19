import { pokemonListSchema, pokemonSchema, type Pokemon, type PokemonList } from '@repo/contracts';
import { apiRequest } from './api';

export async function fetchPokemon(name: string): Promise<Pokemon> {
  const response = await apiRequest<unknown>(
    `/api/pokemon/${encodeURIComponent(name)}`,
  );

  const parsed = pokemonSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error('The server returned an unexpected pokemon payload');
  }
  return parsed.data;
}

export async function fetchPokemonList(
  limit: number,
  offset: number,
): Promise<PokemonList> {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const response = await apiRequest<unknown>(`/api/pokemon?${query}`);

  const parsed = pokemonListSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error('The server returned an unexpected pokemon list payload');
  }
  return parsed.data;
}
