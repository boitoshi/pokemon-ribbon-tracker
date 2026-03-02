import type { PokemonDetail, Ribbon, MyPokemon, RibbonState } from '$lib/types';
import { isShadowPokemon } from '$lib/data/shadow-pokemon';

/**
 * ポケモン個体のリボン取得状態を判定する。
 * @param ribbon 対象リボン
 * @param pokemon 種族データ（選択中ポケモン）
 * @param myPokemon マイポケモン個体情報（未選択時はundefined）
 * @param isObtained 取得済みかどうか
 * @param gameGenMap ゲームID → 世代番号のマップ
 */
export function getRibbonState(
  ribbon: Ribbon,
  pokemon: PokemonDetail | null,
  myPokemon: MyPokemon | undefined,
  isObtained: boolean,
  gameGenMap: ReadonlyMap<string, number>
): RibbonState {
  if (isObtained) return 'obtained';

  // 種族チェック: ポケモン種族の登場世代 > リボンの定義世代 → locked
  if (pokemon && pokemon.generation > ribbon.generation) return 'locked';

  // シャドウ限定チェック
  if (ribbon.eligibility?.type === 'shadow_only') {
    if (!isShadowPokemon(pokemon?.id ?? '')) return 'locked';
    if (
      myPokemon?.originGame &&
      ribbon.eligibility.shadowGames &&
      !ribbon.eligibility.shadowGames.includes(myPokemon.originGame)
    )
      return 'locked';
  }

  // ポケモン未選択 → generic ビュー
  if (!myPokemon) return 'available';

  // リボンが取得できるゲームの世代番号リスト
  const ribbonGameGens = ribbon.games
    .map((gid) => gameGenMap.get(gid))
    .filter((g): g is number => g !== undefined);
  if (ribbonGameGens.length === 0) return 'available';

  const maxRibbonGen = Math.max(...ribbonGameGens);
  const minRibbonGen = Math.min(...ribbonGameGens);
  const originGen = gameGenMap.get(myPokemon.originGame) ?? 0;
  const currentGen = gameGenMap.get(myPokemon.currentGame) ?? 0;

  // 生まれた世代より前にしか存在しないリボン → locked
  if (maxRibbonGen < originGen) return 'locked';

  // level_max でレベルオーバー → missed（レベルは下げられない）
  if (ribbon.eligibility?.type === 'level_max') {
    if (myPokemon.level > (ribbon.eligibility.maxLevel ?? Infinity)) return 'missed';
  }

  // 全ゲームが現在世代より前 → missed（もう戻れない）
  if (maxRibbonGen < currentGen) return 'missed';

  // 全ゲームが現在世代より後 → future
  if (minRibbonGen > currentGen) return 'future';

  // 現在世代で取得可能 & level_max → urgent
  if (ribbon.eligibility?.type === 'level_max') return 'urgent';

  return 'available';
}

/**
 * リボンの取得推奨フェーズを返す。
 * 1: 最優先（レベル制限あり）
 * 2: コンテスト
 * 3: ストーリー/バトル/その他
 */
export function getAcquisitionPhase(ribbon: Ribbon): 1 | 2 | 3 {
  if (ribbon.eligibility?.type === 'level_max') return 1;
  if (ribbon.category === 'コンテスト') return 2;
  return 3;
}
