import type { MyPokemon } from '$lib/types';

/**
 * unknown な値が MyPokemon の必須フィールドをすべて持つか型ガードで検証する。
 * importProgress でのインポート時、破損エントリを弾くために使用する。
 *
 * オプショナルフィールド（transferConfirmations, manualRibbonOverrides 等）は
 * 存在しなくてもデフォルト値で補完できるため、必須チェックから外す。
 */
export function isValidMyPokemon(item: unknown): item is MyPokemon {
	if (!item || typeof item !== 'object') return false;
	const m = item as Record<string, unknown>;
	return (
		typeof m.id === 'string' &&
		typeof m.pokemonId === 'string' &&
		typeof m.nickname === 'string' &&
		typeof m.originGame === 'string' &&
		typeof m.currentGame === 'string' &&
		typeof m.level === 'number' &&
		typeof m.isTransferredToHome === 'boolean' &&
		typeof m.memo === 'string' &&
		typeof m.createdAt === 'string'
	);
}
