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

/** マイポケモン（登録したポケモン個体） */
export interface MyPokemon {
  /** 内部ID（自動生成、タイムスタンプベース） */
  id: string;
  /** 図鑑のポケモンID（PokemonDetail.id と対応） */
  pokemonId: string;
  /** ニックネーム（任意） */
  nickname: string;
  /** 出身ゲームID */
  originGame: string;
  /** メモ（任意） */
  memo: string;
  /** 登録日（ISO 8601文字列） */
  createdAt: string;
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

/** リボンフィルタの状態 */
export interface FilterState {
  generation: number | null;
  type: string | null;
  status: 'obtained' | 'not-obtained' | null;
  search: string;
}

/** エクスポート/インポートデータ形式 */
export interface ExportData {
  /** バージョン（将来の互換性のため） */
  version: number;
  /** マイポケモン一覧 */
  myPokemonList: MyPokemon[];
  /** リボン進捗データ */
  progress: Record<string, string[]>;
}
