import { describe, it, expect } from 'vitest';
import type { PokemonDetail } from '$lib/types';
import {
	getMyPokemonDisplayName,
	getMyPokemonImage,
	type MyPokemonDisplaySource
} from './myPokemonDisplay';

/** テスト用のポケモン図鑑データ */
const ALL_POKEMON: PokemonDetail[] = [
	{
		id: 'pikachu',
		dexNumber: 25,
		name: 'ピカチュウ',
		types: ['electric'],
		generation: 1,
		image: 'https://example.test/pikachu.png'
	},
	{
		id: 'milotic',
		dexNumber: 350,
		name: 'ミロカロス',
		types: ['water'],
		generation: 3,
		image: 'https://example.test/milotic.png'
	}
];

/** テスト用のマイポケモン（表示に必要な最小限） */
function source(overrides: Partial<MyPokemonDisplaySource> = {}): MyPokemonDisplaySource {
	return { pokemonId: 'pikachu', nickname: '', ...overrides };
}

describe('getMyPokemonDisplayName', () => {
	it('ニックネームがあればニックネームを返す', () => {
		expect(getMyPokemonDisplayName(source({ nickname: 'ピカ様' }), ALL_POKEMON)).toBe('ピカ様');
	});

	it('ニックネームが空文字なら種族名にフォールバックする', () => {
		expect(getMyPokemonDisplayName(source({ nickname: '' }), ALL_POKEMON)).toBe('ピカチュウ');
	});

	it('種族データが見つからなければ pokemonId をそのまま返す', () => {
		expect(getMyPokemonDisplayName(source({ pokemonId: 'unknown-mon' }), ALL_POKEMON)).toBe(
			'unknown-mon'
		);
	});

	it('図鑑データが空でもニックネームがあればニックネームを返す', () => {
		expect(getMyPokemonDisplayName(source({ nickname: 'ピカ様' }), [])).toBe('ピカ様');
	});
});

describe('getMyPokemonImage', () => {
	it('見つかれば画像URLを返す', () => {
		expect(getMyPokemonImage('milotic', ALL_POKEMON)).toBe('https://example.test/milotic.png');
	});

	it('見つからなければ undefined を返す', () => {
		expect(getMyPokemonImage('unknown-mon', ALL_POKEMON)).toBeUndefined();
	});
});
