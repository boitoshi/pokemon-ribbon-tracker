import type { PokemonDetail, Ribbon } from '$lib/types';
import { GAMES } from '$lib/data/games';
import {
	SHADOW_POKEMON_COLOSSEUM,
	SHADOW_POKEMON_XD,
	isShadowPokemon
} from '$lib/data/shadow-pokemon';

/**
 * ポケモン起点のリボン逆引きユーティリティ。
 * ribbonEligibility.ts の種族チェックと同じ思想で、**種族レベル**の適格性を判定する。
 * 個体情報（レベル・出身ゲーム）は一切使わない。
 */

/** イベント配布リボンのカテゴリ名 */
const EVENT_CATEGORY = 'イベント';

/** 条件注記の文言 */
const NOTE_SHADOW_ONLY = 'シャドウポケモン限定';
const NOTE_EVENT_ONLY = 'イベント配布限定';

/** UI 表示用の近似注記（定数 export） */
export const ELIGIBILITY_DISCLAIMER =
	'種族の初登場世代とリボンが取得できるソフトの世代にもとづく近似判定です。実際には各ソフトへの連れて行き（HOME/転送）や出現制限により取得できない場合があります。';

/** ゲームID → 世代番号のマップ */
const GAME_GEN_MAP: ReadonlyMap<string, number> = new Map(GAMES.map((g) => [g.id, g.generation]));

/**
 * リボンを取得できるソフトの最大世代を返す。
 * 例: SwSh初出のあかし（games に SV を含む）→ 9。games が空/不明ならリボンの定義世代。
 */
function maxObtainableGen(ribbon: Ribbon): number {
	let max = 0;
	for (const gameId of ribbon.games) {
		const gen = GAME_GEN_MAP.get(gameId);
		if (gen !== undefined && gen > max) max = gen;
	}
	return max > 0 ? max : ribbon.generation;
}

export interface SpeciesEligibility {
	ribbon: Ribbon;
	/** 条件注記: 'シャドウポケモン限定' | 'レベル{n}以下限定' | 'イベント配布限定' 等。無条件なら空配列 */
	notes: string[];
}

export interface SpeciesRibbonSummary {
	/** 通常プレイで取得可能（イベント配布除く） */
	available: SpeciesEligibility[];
	/** イベント配布限定（category === 'イベント'）。現在入手不可のものを含むため別枠 */
	eventOnly: SpeciesEligibility[];
	/** available のうち type !== 'mark' の件数 */
	ribbonCount: number;
	/** available のうち type === 'mark' の件数 */
	markCount: number;
	/** available+eventOnly を ribbon.generation ごとにまとめた内訳（世代昇順、0件世代は除外） */
	byGeneration: { gen: number; entries: SpeciesEligibility[] }[];
}

/**
 * 種族が対象リボンをつけられるかどうかを判定する。
 * @returns 対象外なら null、対象なら注記付きエントリ
 */
function evaluateSpeciesEligibility(
	pokemon: PokemonDetail,
	ribbon: Ribbon
): { entry: SpeciesEligibility; isEventOnly: boolean } | null {
	// 1. 種族の登場世代 > リボンを取得できるソフトの最大世代 → 対象外
	//    （例: Gen9初出の種族でも SV で取れる SwSh 初出あかしは対象。剣盾限定のカレーのあかしは対象外）
	if (pokemon.generation > maxObtainableGen(ribbon)) return null;

	const notes: string[] = [];

	// 2. シャドウ限定チェック
	if (ribbon.eligibility?.type === 'shadow_only') {
		if (!isShadowPokemon(pokemon.id)) return null;
		notes.push(NOTE_SHADOW_ONLY);
	}

	// 3. イベント配布限定チェック
	const isEventOnly = ribbon.category === EVENT_CATEGORY;
	if (isEventOnly) notes.push(NOTE_EVENT_ONLY);

	// 4. レベル上限チェック
	if (ribbon.eligibility?.type === 'level_max' && ribbon.eligibility.maxLevel !== undefined) {
		notes.push(`レベル${ribbon.eligibility.maxLevel}以下限定`);
	}

	return { entry: { ribbon, notes }, isEventOnly };
}

/**
 * 種族がつけられる全リボン/あかしのサマリーを返す。
 * @param pokemon 種族データ
 * @param allRibbons 全リボン定義（あかし含む）
 */
export function getSpeciesRibbonSummary(
	pokemon: PokemonDetail,
	allRibbons: Ribbon[]
): SpeciesRibbonSummary {
	const available: SpeciesEligibility[] = [];
	const eventOnly: SpeciesEligibility[] = [];

	for (const ribbon of allRibbons) {
		const result = evaluateSpeciesEligibility(pokemon, ribbon);
		if (!result) continue;
		if (result.isEventOnly) eventOnly.push(result.entry);
		else available.push(result.entry);
	}

	const ribbonCount = available.filter((e) => e.ribbon.type !== 'mark').length;
	const markCount = available.length - ribbonCount;

	// 世代別内訳（available + eventOnly、世代昇順、0件世代は除外）
	const genMap = new Map<number, SpeciesEligibility[]>();
	for (const entry of [...available, ...eventOnly]) {
		const gen = entry.ribbon.generation;
		const list = genMap.get(gen);
		if (list) list.push(entry);
		else genMap.set(gen, [entry]);
	}
	const byGeneration = [...genMap.entries()]
		.sort(([a], [b]) => a - b)
		.map(([gen, entries]) => ({ gen, entries }));

	return { available, eventOnly, ribbonCount, markCount, byGeneration };
}

export interface RibbonSpeciesCondition {
	/** 例: '第3世代までに登場した全ポケモン（386種）' / 'コロシアム/XDのシャドウポケモン（130種）のみ' */
	conditionText: string;
	count: number;
	species: PokemonDetail[]; // 図鑑番号順
}

/** shadowGames 指定からシャドウ種族IDセットとラベルを解決する */
function resolveShadowPool(shadowGames?: string[]): { label: string; ids: Set<string> } {
	const hasColosseum =
		!shadowGames || shadowGames.length === 0 || shadowGames.includes('colosseum');
	const hasXd = !shadowGames || shadowGames.length === 0 || shadowGames.includes('xd');
	if (hasColosseum && !hasXd) {
		return { label: 'コロシアム', ids: new Set(SHADOW_POKEMON_COLOSSEUM) };
	}
	if (hasXd && !hasColosseum) {
		return { label: 'XD', ids: new Set(SHADOW_POKEMON_XD) };
	}
	// 両方指定 or 未指定 → 和集合
	return {
		label: 'コロシアム/XD',
		ids: new Set([...SHADOW_POKEMON_COLOSSEUM, ...SHADOW_POKEMON_XD])
	};
}

/** リボンの種族適格性の述語を返す */
function speciesPredicate(ribbon: Ribbon): (pokemon: PokemonDetail) => boolean {
	if (ribbon.eligibility?.type === 'shadow_only') {
		const { ids } = resolveShadowPool(ribbon.eligibility.shadowGames);
		return (pokemon) => ids.has(pokemon.id);
	}
	const maxGen = maxObtainableGen(ribbon);
	return (pokemon) => pokemon.generation <= maxGen;
}

/**
 * リボンをつけられる種族数のみを数える（species 配列を生成しない軽量版）。
 * リボン一覧の常時表示行など、全リボン分を先に出したい場面で使う。
 */
export function getEligibleSpeciesCount(ribbon: Ribbon, allPokemon: PokemonDetail[]): number {
	const predicate = speciesPredicate(ribbon);
	let count = 0;
	for (const pokemon of allPokemon) {
		if (predicate(pokemon)) count++;
	}
	return count;
}

/** 種族数から条件テキストを組み立てる */
export function formatEligibleSpeciesCondition(ribbon: Ribbon, count: number): string {
	let text: string;
	if (ribbon.eligibility?.type === 'shadow_only') {
		const { label } = resolveShadowPool(ribbon.eligibility.shadowGames);
		text = `${label}のシャドウポケモン（${count}種）のみ`;
	} else {
		text = `第${maxObtainableGen(ribbon)}世代までに登場した全ポケモン（${count}種）`;
	}
	if (ribbon.category === EVENT_CATEGORY) text += '※イベント配布限定';
	return text;
}

/**
 * リボンをつけられる種族の一覧（図鑑番号順）と条件テキストを返す。
 * 種族配列を実体化するため、UI では開いたときに初めて呼ぶこと。
 */
export function getEligibleSpeciesForRibbon(
	ribbon: Ribbon,
	allPokemon: PokemonDetail[]
): RibbonSpeciesCondition {
	const predicate = speciesPredicate(ribbon);
	const species = allPokemon.filter(predicate).sort((a, b) => a.dexNumber - b.dexNumber);
	return {
		conditionText: formatEligibleSpeciesCondition(ribbon, species.length),
		count: species.length,
		species
	};
}
