import type { Pokemon, PokemonDetail } from '$lib/types';

/** PokemonDetail（API型）を Pokemon（UI型）に変換する */
export const toPokemon = (detail: PokemonDetail): Pokemon => ({
  id: detail.id,
  number: String(detail.dexNumber).padStart(3, '0'),
  name: detail.name,
  imageUrl: detail.image,
  types: detail.types,
});
