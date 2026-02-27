// ポケモンリボントラッカー v2 共通型定義

/** リボンの取得状態を表すUI型 */
export interface RibbonStatus {
	id: string;
	name: string;
	obtained: boolean;
}

/** ポケモンのUI表示用型 */
export interface Pokemon {
	id: string;
	number: string;
	name: string;
	imageUrl?: string;
	types: string[];
	ribbons?: RibbonStatus[];
}

/** ポケモンのデータソース型 */
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
	type?: 'ribbon' | 'mark';
	requirements?: string;
	image_url?: string;
	eligibility?: RibbonEligibility;
	/** HOME転送後もリボンが保持されるか（デフォルト true） */
	transferable?: boolean;
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
	/** 今どのゲーム/BOXにいるか */
	currentGame: string;
	/** 現在の世代 */
	currentGeneration: number;
	/** 現在のレベル（レベル制限リボンの判定に使用） */
	level: number;
	/** Pokemon HOME に転送済みか */
	isTransferredToHome: boolean;
	memo: string;
	createdAt: string;
}

/** 所持ゲーム・ハード設定 */
export interface Setup {
	ownedGames: string[];
	ownedHardware: Hardware[];
	setupCompleted: boolean;
}

/** 所持ハード種別 */
export type Hardware = 'gba' | 'ds_lite' | 'dsi' | '3ds' | 'switch';

/** 転送ルート定義 */
export interface TransferRoute {
	id: string;
	fromGeneration: number;
	toGeneration: number;
	methodName: string;
	hardwareRequired: Hardware[];
	/** 要: DS/DS Liteのみ（DSi不可）など特殊制限 */
	hardwareNote?: string;
	softwareRequired: string[];
	dailyLimit?: number;
	restrictions: string[];
	isDeprecated?: boolean;
	deprecationNote?: string;
}

/** リボンフィルタの状態 */
export interface FilterState {
	generation: number | null;
	type: string | null;
	status: 'obtained' | 'not-obtained' | null;
	search: string;
}

/** ロードマップ表示用リボングループ */
export interface RibbonGroup {
	generation: number;
	ribbons: Ribbon[];
	urgentRibbons: Ribbon[];
	lockedRibbons: Ribbon[];
}
