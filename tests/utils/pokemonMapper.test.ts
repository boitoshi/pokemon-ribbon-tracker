import { describe, it, expect } from 'vitest';
import { toPokemon } from '~/utils/pokemonMapper';
import type { PokemonDetail } from '~/types';

describe('toPokemon', () => {
  const detail: PokemonDetail = {
    id: 'pikachu',
    dexNumber: 25,
    name: 'ピカチュウ',
    types: ['でんき'],
    generation: 1,
    image: 'https://example.com/pikachu.png',
    category: 'ねずみポケモン',
    height: 40,
    weight: 60,
    abilities: ['せいでんき', 'ひらいしん'],
  };

  it('PokemonDetail を Pokemon に正しく変換する', () => {
    const result = toPokemon(detail);

    expect(result).toEqual({
      id: 'pikachu',
      number: '025',
      name: 'ピカチュウ',
      imageUrl: 'https://example.com/pikachu.png',
      types: ['でんき'],
    });
  });

  it('dexNumber を3桁ゼロパディングする', () => {
    expect(toPokemon(detail).number).toBe('025');

    const detail999: PokemonDetail = { ...detail, dexNumber: 999 };
    expect(toPokemon(detail999).number).toBe('999');

    const detail1: PokemonDetail = { ...detail, dexNumber: 1 };
    expect(toPokemon(detail1).number).toBe('001');
  });
});
