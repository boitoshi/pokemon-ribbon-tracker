import type { Game, PokemonDetail, Ribbon } from '$lib/types';
import { normalizeForSearch } from '$lib/utils/searchNormalize';

/**
 * 統合検索ユーティリティ。
 * ホーム（/）と各エンティティページ（/pokemon /ribbon /game）で共通利用する。
 * ソートは前方一致優先 → 部分一致（各グループ内は元データの並び順を維持）。
 */

/** 1カテゴリあたりのデフォルト最大表示件数 */
export const UNIFIED_SEARCH_MAX_RESULTS = 8;

/**
 * 複数キーに対する前方一致優先検索。
 * @param items 検索対象
 * @param rawQuery 生クエリ（正規化前）
 * @param getKeys 検索対象キー群を返す関数（undefined キーは無視）
 * @param maxResults 最大件数
 */
function searchByKeys<T>(
	items: T[],
	rawQuery: string,
	getKeys: (item: T) => (string | undefined)[],
	maxResults: number
): T[] {
	const query = normalizeForSearch(rawQuery.trim());
	if (!query || maxResults <= 0) return [];

	const prefixMatches: T[] = [];
	const partialMatches: T[] = [];
	for (const item of items) {
		const keys = getKeys(item)
			.filter((key): key is string => key !== undefined && key !== '')
			.map(normalizeForSearch);
		if (keys.some((key) => key.startsWith(query))) {
			prefixMatches.push(item);
			// 前方一致だけで枠が埋まったら以降は探索不要
			if (prefixMatches.length >= maxResults) break;
		} else if (keys.some((key) => key.includes(query))) {
			partialMatches.push(item);
		}
	}
	return [...prefixMatches, ...partialMatches].slice(0, maxResults);
}

/** ポケモンを名前で検索する */
export function searchPokemon(
	allPokemon: PokemonDetail[],
	query: string,
	maxResults: number = UNIFIED_SEARCH_MAX_RESULTS
): PokemonDetail[] {
	return searchByKeys(allPokemon, query, (p) => [p.name], maxResults);
}

/** リボン/あかしを名前・カテゴリ・取得条件で検索する */
export function searchRibbons(
	allRibbons: Ribbon[],
	query: string,
	maxResults: number = UNIFIED_SEARCH_MAX_RESULTS
): Ribbon[] {
	return searchByKeys(allRibbons, query, (r) => [r.name, r.category, r.requirements], maxResults);
}

/** ソフトを正式名・短縮名で検索する */
export function searchGames(
	allGames: Game[],
	query: string,
	maxResults: number = UNIFIED_SEARCH_MAX_RESULTS
): Game[] {
	return searchByKeys(allGames, query, (g) => [g.name, g.shortName], maxResults);
}
