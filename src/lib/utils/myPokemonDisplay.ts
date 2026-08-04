import type { MyPokemon, PokemonDetail } from '$lib/types';

/**
 * 表示名の算出に必要な最小限のマイポケモン情報。
 * MyPokemon 全体を要求しないことで、部分的なオブジェクトからも呼べるようにする。
 */
export type MyPokemonDisplaySource = Pick<MyPokemon, 'pokemonId' | 'nickname'>;

/**
 * マイポケモンの表示名を取得する。
 * ニックネームがあればそれを優先し、無ければ種族名、
 * 種族データが見つからなければ pokemonId をそのまま返す。
 */
export function getMyPokemonDisplayName(
	myPokemon: MyPokemonDisplaySource,
	allPokemon: readonly PokemonDetail[]
): string {
	if (myPokemon.nickname) return myPokemon.nickname;
	return allPokemon.find((p) => p.id === myPokemon.pokemonId)?.name ?? myPokemon.pokemonId;
}

/** ポケモンIDから画像URLを取得する（見つからなければ undefined） */
export function getMyPokemonImage(
	pokemonId: string,
	allPokemon: readonly PokemonDetail[]
): string | undefined {
	return allPokemon.find((p) => p.id === pokemonId)?.image;
}
