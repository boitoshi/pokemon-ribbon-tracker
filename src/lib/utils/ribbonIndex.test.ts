// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
	getSpeciesRibbonSummary,
	getEligibleSpeciesForRibbon,
	getEligibleSpeciesCount,
	formatEligibleSpeciesCondition,
	ELIGIBILITY_DISCLAIMER,
	type SpeciesRibbonSummary
} from '$lib/utils/ribbonIndex';
import { loadAllData } from '$lib/utils/dataFetcher';
import { isShadowPokemon } from '$lib/data/shadow-pokemon';
import type { PokemonDetail, Ribbon } from '$lib/types';

// ---- 実データフィクスチャ ----

const { pokemonData, ribbonData } = loadAllData();

function getPokemon(id: string): PokemonDetail {
	const pokemon = pokemonData.find((p) => p.id === id);
	if (!pokemon) throw new Error(`テストデータにポケモン ${id} が見つかりません`);
	return pokemon;
}

function getRibbon(id: string): Ribbon {
	const ribbon = ribbonData.find((r) => r.id === id);
	if (!ribbon) throw new Error(`テストデータにリボン ${id} が見つかりません`);
	return ribbon;
}

function findEntry(list: SpeciesRibbonSummary['available'], ribbonId: string) {
	return list.find((e) => e.ribbon.id === ribbonId);
}

describe('getSpeciesRibbonSummary', () => {
	it('Gen1種（フシギダネ）は Gen3 のチャンプリボンが available に入る', () => {
		const summary = getSpeciesRibbonSummary(getPokemon('bulbasaur'), ribbonData);
		const entry = findEntry(summary.available, 'champion-hoenn');
		expect(entry).toBeDefined();
		expect(entry?.notes).toEqual([]);
	});

	it('Gen9種（モモワロウ）は SV で取得可能なリボン/あかしのみ対象になる', () => {
		const summary = getSpeciesRibbonSummary(getPokemon('pecharunt'), ribbonData);
		const all = [...summary.available, ...summary.eventOnly];
		// SV で取れる SwSh 初出あかし（games に scarlet/violet を含む）は対象
		expect(findEntry(summary.available, 'lunchtime-mark')).toBeDefined();
		// SV で取れる gen8 定義リボン（マスターランクリボン）も対象
		expect(findEntry(summary.available, 'master-rank-ribbon')).toBeDefined();
		// 剣盾限定のカレーのあかしは対象外
		expect(findEntry(summary.available, 'curry-mark')).toBeUndefined();
		// 過去世代ソフトでしか取れないリボン（チャンプリボン等）は対象外
		expect(findEntry(summary.available, 'champion-hoenn')).toBeUndefined();
		// 対象は「SV を games に含むエントリ」のみ
		for (const entry of all) {
			expect(
				entry.ribbon.games.some((g) => g === 'scarlet' || g === 'violet'),
				`${entry.ribbon.id} は SV で取得できないのに含まれている`
			).toBe(true);
		}
	});

	it('シャドウ限定リボン（ナショナルリボン）はマクノシタに含まれ notes 付き', () => {
		const summary = getSpeciesRibbonSummary(getPokemon('makuhita'), ribbonData);
		const entry = findEntry(summary.available, 'national-ribbon');
		expect(entry).toBeDefined();
		expect(entry?.notes).toContain('シャドウポケモン限定');
	});

	it('シャドウ限定リボン（ナショナルリボン）はピカチュウに含まれない', () => {
		const summary = getSpeciesRibbonSummary(getPokemon('pikachu'), ribbonData);
		expect(findEntry(summary.available, 'national-ribbon')).toBeUndefined();
		expect(findEntry(summary.eventOnly, 'national-ribbon')).toBeUndefined();
	});

	it('level_max リボン（ウイニングリボン）の notes に レベル50以下限定 が入る', () => {
		const summary = getSpeciesRibbonSummary(getPokemon('bulbasaur'), ribbonData);
		const entry = findEntry(summary.available, 'winning-ribbon');
		expect(entry).toBeDefined();
		expect(entry?.notes).toContain('レベル50以下限定');
	});

	it('イベントカテゴリ（クラシックリボン）は eventOnly に入り available に入らない', () => {
		const summary = getSpeciesRibbonSummary(getPokemon('bulbasaur'), ribbonData);
		expect(findEntry(summary.available, 'classic-ribbon')).toBeUndefined();
		const entry = findEntry(summary.eventOnly, 'classic-ribbon');
		expect(entry).toBeDefined();
		expect(entry?.notes).toContain('イベント配布限定');
	});

	it('ribbonCount + markCount = available.length で mark の分類が正しい', () => {
		const summary = getSpeciesRibbonSummary(getPokemon('bulbasaur'), ribbonData);
		expect(summary.ribbonCount + summary.markCount).toBe(summary.available.length);
		expect(summary.markCount).toBe(
			summary.available.filter((e) => e.ribbon.type === 'mark').length
		);
		expect(summary.markCount).toBeGreaterThan(0);
	});
});

describe('getEligibleSpeciesForRibbon', () => {
	it('チャンプリボン（gen3）は第3世代までの全386種', () => {
		const condition = getEligibleSpeciesForRibbon(getRibbon('champion-hoenn'), pokemonData);
		expect(condition.count).toBe(386);
		expect(condition.species).toHaveLength(386);
		expect(condition.conditionText).toBe('第3世代までに登場した全ポケモン（386種）');
	});

	it('シャドウ限定リボンはシャドウ種のみ', () => {
		const condition = getEligibleSpeciesForRibbon(getRibbon('national-ribbon'), pokemonData);
		expect(condition.count).toBeGreaterThan(0);
		expect(condition.species.every((p) => isShadowPokemon(p.id))).toBe(true);
		expect(condition.conditionText).toBe(
			`コロシアム/XDのシャドウポケモン（${condition.count}種）のみ`
		);
	});

	it('species は図鑑番号昇順', () => {
		const condition = getEligibleSpeciesForRibbon(getRibbon('national-ribbon'), pokemonData);
		const dexNumbers = condition.species.map((p) => p.dexNumber);
		expect(dexNumbers).toEqual([...dexNumbers].sort((a, b) => a - b));
	});

	it('イベントリボンの conditionText 末尾に ※イベント配布限定 が付く', () => {
		const condition = getEligibleSpeciesForRibbon(getRibbon('classic-ribbon'), pokemonData);
		expect(condition.conditionText.endsWith('※イベント配布限定')).toBe(true);
	});

	it('軽量版 getEligibleSpeciesCount / formatEligibleSpeciesCondition と一致する', () => {
		for (const ribbonId of ['champion-hoenn', 'national-ribbon', 'classic-ribbon']) {
			const ribbon = getRibbon(ribbonId);
			const condition = getEligibleSpeciesForRibbon(ribbon, pokemonData);
			const count = getEligibleSpeciesCount(ribbon, pokemonData);
			expect(count).toBe(condition.count);
			expect(formatEligibleSpeciesCondition(ribbon, count)).toBe(condition.conditionText);
		}
	});
});

describe('ELIGIBILITY_DISCLAIMER', () => {
	it('種族レベル判定の注記が定義されている', () => {
		expect(ELIGIBILITY_DISCLAIMER).toContain('種族の初登場世代');
	});
});
