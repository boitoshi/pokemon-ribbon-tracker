import { describe, it, expect } from 'vitest';
import type { Game, PokemonDetail, Ribbon } from '$lib/types';
import { searchPokemon, searchRibbons, searchGames } from './unifiedSearch';

/** テスト用ポケモンを生成する */
function makePokemon(id: string, name: string, dexNumber: number): PokemonDetail {
	return { id, dexNumber, name, types: [], generation: 1, image: '' };
}

/** テスト用リボンを生成する */
function makeRibbon(id: string, name: string, category: string, requirements?: string): Ribbon {
	return { id, name, description: '', generation: 3, games: [], category, requirements };
}

/** テスト用ソフトを生成する */
function makeGame(id: string, name: string, shortName: string): Game {
	return { id, name, shortName, generation: 3, releaseDate: '2002-11-21', platform: 'GBA' };
}

const POKEMON: PokemonDetail[] = [
	makePokemon('raichu', 'ライチュウ', 26),
	makePokemon('pikachu', 'ピカチュウ', 25),
	makePokemon('chuchu', 'チュウピカ', 999) // 架空: 部分一致検証用
];

const RIBBONS: Ribbon[] = [
	makeRibbon('champion', 'チャンピオンリボン', 'チャンピオン', '殿堂入りする'),
	makeRibbon('winning', 'ウイニングリボン', 'バトル', 'バトルタワーLv50戦で勝ち抜く'),
	makeRibbon('effort', 'がんばリボン', '思い出', '努力値を最大まで稼ぐ')
];

const GAMES_FIXTURE: Game[] = [
	makeGame('emerald', 'ポケットモンスター エメラルド', 'エメラルド'),
	makeGame('firered', 'ポケモン ファイアレッド', 'FR')
];

describe('unifiedSearch', () => {
	it('空クエリ・空白のみクエリは空配列を返す', () => {
		expect(searchPokemon(POKEMON, '')).toEqual([]);
		expect(searchPokemon(POKEMON, '   ')).toEqual([]);
		expect(searchRibbons(RIBBONS, '')).toEqual([]);
		expect(searchGames(GAMES_FIXTURE, '')).toEqual([]);
	});

	it('ポケモン名はひらがなクエリでもヒットし、前方一致が部分一致より先に並ぶ', () => {
		const results = searchPokemon(POKEMON, 'ぴか');
		expect(results.map((p) => p.id)).toEqual(['pikachu', 'chuchu']);
	});

	it('リボンは名前・カテゴリ・取得条件のどれでもヒットする', () => {
		expect(searchRibbons(RIBBONS, 'ウイニング').map((r) => r.id)).toEqual(['winning']);
		expect(searchRibbons(RIBBONS, 'チャンピオン').map((r) => r.id)).toEqual(['champion']);
		expect(searchRibbons(RIBBONS, '努力値').map((r) => r.id)).toEqual(['effort']);
	});

	it('ソフトは正式名・短縮名のどちらでもヒットする（英字は大文字小文字を無視）', () => {
		expect(searchGames(GAMES_FIXTURE, 'エメラルド').map((g) => g.id)).toEqual(['emerald']);
		expect(searchGames(GAMES_FIXTURE, 'fr').map((g) => g.id)).toEqual(['firered']);
	});

	it('maxResults で件数が制限される', () => {
		const results = searchRibbons(RIBBONS, 'リボン', 2);
		expect(results).toHaveLength(2);
		expect(results.map((r) => r.id)).toEqual(['champion', 'winning']);
	});
});
