// ポケモンリボントラッカー 共通型定義

/** リボンの取得状態を表すUI型 */
export interface RibbonStatus {
  id: string;
  name: string;
  obtained: boolean;
}

/** ポケモンのUI表示用型（PokemonDetail から変換して使用） */
export interface Pokemon {
  id: string;
  number: string;
  name: string;
  imageUrl?: string;
  types: string[];
  ribbons?: RibbonStatus[];
}

/** ポケモンのAPI/データソース型（外部JSONから取得） */
export interface PokemonDetail {
  id: string;
  dexNumber: number;
  name: string;
  types: string[];
  generation: number;
  image: string;
  category: string;
  height: number;
  weight: number;
  abilities: string[];
}

/** リボンの取得条件 */
export interface RibbonEligibility {
  type: 'all' | 'shadow_only' | 'level_max';
  maxLevel?: number;
  shadowGames?: string[];
}

/** リボンの定義データ */
export interface Ribbon {
  id: string;
  name: string;
  description: string;
  generation: number;
  games: string[];
  category: string;
  requirements?: string;
  image_url?: string;
  eligibility?: RibbonEligibility;
}

/** ゲームタイトルの定義データ */
export interface Game {
  id: string;
  name: string;
  shortName: string;
  generation: number;
  releaseDate: string;
  platform: string;
}

/** マイポケモン（個体ごとの登録情報） */
export interface MyPokemon {
  id: string;
  pokemonId: string;
  nickname: string;
  originGame: string;
  memo: string;
  createdAt: string;
}

/** リボンフィルタの状態 */
export interface FilterState {
  generation: number | null;
  type: string | null;
  status: 'obtained' | 'not-obtained' | null;
  search: string;
}
