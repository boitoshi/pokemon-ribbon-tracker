// ポケモンリボントラッカー v2 共通型定義

/** リボンの取得状態を表す判定型 */
export type RibbonState =
	| 'obtained' // 取得済み
	| 'missed' // 取り逃し（通過済み世代の未取得、またはレベル超過）
	| 'urgent' // 今すぐ取れ！（現在世代 & level_max 制限あり）
	| 'available' // 取得可能（現在世代 & 制限なし）
	| 'future' // まだここにいない（未来世代）
	| 'locked'; // 永続的に取得不可（種族不一致、シャドウ限定、生まれる前）

/** リボン状態の理由キー（UI文言はキーから解決する） */
export type RibbonReasonKey =
	| 'already_obtained'
	| 'species_generation_mismatch'
	| 'shadow_only_species'
	| 'shadow_only_origin_game'
	| 'born_after_ribbon_generation'
	| 'level_limit_exceeded'
	| 'past_generation_unreachable'
	| 'future_generation_not_reached'
	| 'level_limited_available_now'
	| 'available_now';

/** 理由付きリボン判定結果 */
export interface RibbonEvaluation {
	state: RibbonState;
	reasons: RibbonReasonKey[];
}

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
	/** 現在のレベル（レベル制限リボンの判定に使用） */
	level: number;
	/** Pokemon HOME に転送済みか */
	isTransferredToHome: boolean;
	/** 不可逆転送の最終確認日（YYYY-MM-DD, ローカル時刻） */
	lastIrreversibleConfirmedAt?: string;
	/** 個体×ルート単位の確認履歴 */
	transferConfirmations?: Record<string, TransferConfirmation>;
	/** リボン状態の手動上書き（missedの手動変更用） */
	manualRibbonOverrides?: Record<string, ManualRibbonOverride>;
	memo: string;
	createdAt: string;
}

/** 不可逆転送の確認情報 */
export interface TransferConfirmation {
	routeId: string;
	confirmedAt: string;
	agreedIrreversible: boolean;
}

/** リボン状態の手動上書き情報 */
export interface ManualRibbonOverride {
	isMissed: boolean;
	updatedAt: string;
}

/** 所持ゲーム・ハード設定 */
export interface Setup {
	ownedGames: string[];
	ownedHardware: Hardware[];
	setupCompleted: boolean;
}

/** 所持ハード種別 */
export type Hardware = 'gba' | 'ds_lite' | 'dsi' | '3ds' | 'switch';

/** ハード要件の1候補（AND） */
export interface TransferRequirementOption {
	id: string;
	allOf: Hardware[];
	labelKey: string;
	label: string;
}

/** ハード要件群（OR） */
export interface TransferRequirement {
	anyOf: TransferRequirementOption[];
}

/** 転送ルート定義 */
export interface TransferRoute {
	id: string;
	fromGeneration: number;
	toGeneration: number;
	methodName: string;
	requirements: TransferRequirement;
	/** @deprecated requirements を使用 */
	hardwareRequired?: Hardware[];
	/** 要: DS/DS Liteのみ（DSi不可）など特殊制限 */
	hardwareNote?: string;
	softwareRequired: string[];
	/** 不可逆転送かどうか（UIの注意表示で利用） */
	isIrreversible: boolean;
	/** 説明文解決用キー */
	explanationKey: string;
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
	phase: 'past' | 'current' | 'future';
	ribbons: Ribbon[];
	urgentRibbons: Ribbon[];
	missedRibbons: Ribbon[];
	futureRibbons: Ribbon[];
	lockedRibbons: Ribbon[];
}
