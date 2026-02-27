import type { PokemonDetail, Ribbon, MyPokemon } from '$lib/types';
import { isShadowPokemon } from '$lib/data/shadow-pokemon';

/**
 * ポケモンが指定リボンを取得可能かどうかを判定する。
 * @param pokemon 対象ポケモンの詳細情報
 * @param ribbon 対象リボンの定義
 * @param myPokemon マイポケモンの個体情報（省略可）
 * @returns { eligible: boolean; reason?: string } - eligible=false の場合、reason に理由を入れる
 */
export function canPokemonGetRibbon(
  pokemon: PokemonDetail,
  ribbon: Ribbon,
  myPokemon?: MyPokemon,
): { eligible: boolean; reason?: string } {
  // 世代チェック: ポケモンの世代がリボンの世代以下でなければ取得不可
  if (pokemon.generation > ribbon.generation) {
    return {
      eligible: false,
      reason: `第${ribbon.generation}世代以前のポケモンのみ取得可能`,
    };
  }

  // eligibilityフィールドがない、またはtype='all'の場合は取得可能
  if (!ribbon.eligibility || ribbon.eligibility.type === 'all') {
    return { eligible: true };
  }

  // シャドウポケモン限定チェック
  if (ribbon.eligibility.type === 'shadow_only') {
    const isShadow = isShadowPokemon(pokemon.id);

    if (!isShadow) {
      return {
        eligible: false,
        reason: 'シャドウポケモンのみ取得可能',
      };
    }

    // myPokemonが提供されている場合、originGameがshadowGamesに含まれるかチェック
    if (myPokemon && ribbon.eligibility.shadowGames) {
      const originGameAllowed = ribbon.eligibility.shadowGames.includes(myPokemon.originGame);
      if (!originGameAllowed) {
        return {
          eligible: false,
          reason: 'コロシアム/XD出身のポケモンのみ取得可能',
        };
      }
    }

    return { eligible: true };
  }

  // レベル上限チェック: 取得可能だが警告理由を付ける
  if (ribbon.eligibility.type === 'level_max') {
    const maxLevel = ribbon.eligibility.maxLevel;
    return {
      eligible: true,
      reason: `Lv.${maxLevel}以下のポケモンのみ参加可能`,
    };
  }

  return { eligible: true };
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
