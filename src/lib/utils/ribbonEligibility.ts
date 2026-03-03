import type {
  PokemonDetail,
  Ribbon,
  MyPokemon,
  RibbonState,
  RibbonEvaluation,
  RibbonReasonKey
} from '$lib/types';
import { isShadowPokemon } from '$lib/data/shadow-pokemon';

export const RIBBON_REASON_LABELS: Record<RibbonReasonKey, string> = {
  already_obtained: '取得済みです',
  species_generation_mismatch: 'このポケモン種族は当時まだ存在しません',
  shadow_only_species: 'このリボンはシャドウポケモン限定です',
  shadow_only_origin_game: 'この個体の出身作品では対象外です',
  born_after_ribbon_generation: 'この個体が生まれる前の世代限定リボンです',
  level_limit_exceeded: 'レベル上限を超えているため取得できません',
  past_generation_unreachable: '現在の世代からは戻れないため取り逃しです',
  future_generation_not_reached: 'この世代にはまだ到達していません',
  level_limited_available_now: '今のうちに取る必要があります（レベル制限あり）',
  available_now: '現在の条件で取得可能です'
};

export function getRibbonReasonLabel(reason: RibbonReasonKey): string {
  return RIBBON_REASON_LABELS[reason];
}

/**
 * ポケモン個体のリボン取得状態を判定する。
 * @param ribbon 対象リボン
 * @param pokemon 種族データ（選択中ポケモン）
 * @param myPokemon マイポケモン個体情報（未選択時はundefined）
 * @param isObtained 取得済みかどうか
 * @param gameGenMap ゲームID → 世代番号のマップ
 */
export function getRibbonEvaluation(
  ribbon: Ribbon,
  pokemon: PokemonDetail | null,
  myPokemon: MyPokemon | undefined,
  isObtained: boolean,
  gameGenMap: ReadonlyMap<string, number>
): RibbonEvaluation {
  if (isObtained) return { state: 'obtained', reasons: ['already_obtained'] };

  // 種族チェック: ポケモン種族の登場世代 > リボンの定義世代 → locked
  if (pokemon && pokemon.generation > ribbon.generation) {
    return { state: 'locked', reasons: ['species_generation_mismatch'] };
  }

  // シャドウ限定チェック
  if (ribbon.eligibility?.type === 'shadow_only') {
    if (!isShadowPokemon(pokemon?.id ?? '')) {
      return { state: 'locked', reasons: ['shadow_only_species'] };
    }
    if (
      myPokemon?.originGame &&
      ribbon.eligibility.shadowGames &&
      !ribbon.eligibility.shadowGames.includes(myPokemon.originGame)
    )
      return { state: 'locked', reasons: ['shadow_only_origin_game'] };
  }

  // ポケモン未選択 → generic ビュー
  if (!myPokemon) return { state: 'available', reasons: ['available_now'] };

  // リボンが取得できるゲームの世代番号リスト
  const ribbonGameGens = ribbon.games
    .map((gid) => gameGenMap.get(gid))
    .filter((g): g is number => g !== undefined);
  if (ribbonGameGens.length === 0) return { state: 'available', reasons: ['available_now'] };

  const maxRibbonGen = Math.max(...ribbonGameGens);
  const minRibbonGen = Math.min(...ribbonGameGens);
  const originGen = gameGenMap.get(myPokemon.originGame) ?? 0;
  const currentGen = gameGenMap.get(myPokemon.currentGame) ?? 0;

  // 生まれた世代より前にしか存在しないリボン → locked
  if (maxRibbonGen < originGen) {
    return { state: 'locked', reasons: ['born_after_ribbon_generation'] };
  }

  // level_max でレベルオーバー → missed（レベルは下げられない）
  if (ribbon.eligibility?.type === 'level_max') {
    if (myPokemon.level > (ribbon.eligibility.maxLevel ?? Infinity)) {
      return { state: 'missed', reasons: ['level_limit_exceeded'] };
    }
  }

  // 全ゲームが現在世代より前 → missed（もう戻れない）
  if (maxRibbonGen < currentGen) {
    return { state: 'missed', reasons: ['past_generation_unreachable'] };
  }

  // 全ゲームが現在世代より後 → future
  if (minRibbonGen > currentGen) {
    return { state: 'future', reasons: ['future_generation_not_reached'] };
  }

  // 現在世代で取得可能 & level_max → urgent
  if (ribbon.eligibility?.type === 'level_max') {
    return { state: 'urgent', reasons: ['level_limited_available_now'] };
  }

  return { state: 'available', reasons: ['available_now'] };
}

export function getRibbonState(
	ribbon: Ribbon,
	pokemon: PokemonDetail | null,
	myPokemon: MyPokemon | undefined,
	isObtained: boolean,
	gameGenMap: ReadonlyMap<string, number>
): RibbonState {
	return getRibbonEvaluation(ribbon, pokemon, myPokemon, isObtained, gameGenMap).state;
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
