import type {
	Ribbon,
	Game,
	PokemonDetail,
	MyPokemon,
	RibbonState,
	RibbonEvaluation,
	TransferConfirmation,
	ManualRibbonOverride
} from '$lib/types';
import { loadAllData } from '$lib/utils/dataFetcher';
import { getRibbonEvaluation, getRibbonReasonLabel } from '$lib/utils/ribbonEligibility';
import { isValidMyPokemon } from '$lib/utils/myPokemonValidator';

/** localStorageキー定数 */
const PROGRESS_STORAGE_KEY = 'rt_progress';
const MY_POKEMON_STORAGE_KEY = 'rt_my_pokemon';
const ACTIVE_MY_POKEMON_STORAGE_KEY = 'rt_active_my_pokemon';

/** 世代別進捗データ型 */
export interface GenerationProgress {
	obtained: number;
	total: number;
}

/**
 * 旧形式のマイポケモンデータに、後から追加したオプショナルフィールドのデフォルト値を補う。
 * isValidMyPokemon による検証よりも「先に」適用すること。
 * 順序を逆にすると既存ユーザーの旧データが不正判定で消える。
 */
function withMyPokemonDefaults(entry: unknown): unknown {
	if (!entry || typeof entry !== 'object') return entry;
	const record = entry as Record<string, unknown>;
	return {
		...record,
		transferConfirmations: record.transferConfirmations ?? {},
		manualRibbonOverrides: record.manualRibbonOverrides ?? {}
	};
}

/**
 * リボン進捗を管理するメインストア。
 * アプリからは末尾のシングルトン `ribbonProgress` を使うこと。
 * クラスを export しているのは、テストで独立したインスタンスを作れるようにするため。
 */
export class RibbonProgressStore {
	// 初期化フラグ（再呼び出しガード用）
	private initialized = false;

	// マスターデータ
	allRibbons = $state<Ribbon[]>([]);
	allGames = $state<Game[]>([]);
	allPokemon = $state<PokemonDetail[]>([]);

	// UI状態
	selectedPokemon = $state<PokemonDetail | null>(null);

	// 進捗データ
	/** { myPokemonId: ribbonId[] } */
	progress = $state<Record<string, string[]>>({});
	myPokemonList = $state<MyPokemon[]>([]);
	activeMyPokemonId = $state<string | null>(null);

	// 派生値
	activeMyPokemon = $derived(
		this.activeMyPokemonId
			? (this.myPokemonList.find((mp) => mp.id === this.activeMyPokemonId) ?? null)
			: null
	);

	currentCheckedRibbons = $derived(
		this.activeMyPokemonId ? (this.progress[this.activeMyPokemonId] ?? []) : []
	);

	/** 取得済みリボンID の Set（O(1) 参照用） */
	// $derived 内で毎回作り直す不変スナップショット（ReadonlySet）。その場で書き換えないので
	// 可変・共有状態向けの SvelteSet は不要。
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	currentCheckedSet: ReadonlySet<string> = $derived(new Set(this.currentCheckedRibbons));

	/** ゲームID → 世代番号のマップ */
	// 同上（ReadonlyMap の不変スナップショット）
	private gameGenMap: ReadonlyMap<string, number> = $derived(
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		new Map(this.allGames.map((g) => [g.id, g.generation]))
	);
	get genMap(): ReadonlyMap<string, number> {
		return this.gameGenMap;
	}

	/** 全リボンの取得状態マップ */
	ribbonStateMap: ReadonlyMap<string, RibbonState> = $derived(
		(() => {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const map = new Map<string, RibbonState>();
			for (const ribbon of this.allRibbons) {
				const evaluation = getRibbonEvaluation(
					ribbon,
					this.selectedPokemon,
					this.activeMyPokemon ?? undefined,
					this.currentCheckedSet.has(ribbon.id),
					this.gameGenMap
				);
				const manualOverride = this.activeMyPokemon?.manualRibbonOverrides?.[ribbon.id];
				const overriddenState: RibbonState =
					manualOverride?.isMissed && evaluation.state !== 'obtained' ? 'missed' : evaluation.state;
				map.set(ribbon.id, overriddenState);
			}
			return map;
		})()
	);

	ribbonEvaluationMap: ReadonlyMap<string, RibbonEvaluation> = $derived(
		(() => {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const map = new Map<string, RibbonEvaluation>();
			for (const ribbon of this.allRibbons) {
				map.set(
					ribbon.id,
					getRibbonEvaluation(
						ribbon,
						this.selectedPokemon,
						this.activeMyPokemon ?? undefined,
						this.currentCheckedSet.has(ribbon.id),
						this.gameGenMap
					)
				);
			}
			return map;
		})()
	);

	/** 世代別完了率: Record<number, { obtained: number; total: number }> */
	generationProgress = $derived(
		(() => {
			const result: Record<number, GenerationProgress> = {};
			for (const ribbon of this.allRibbons) {
				const gen = ribbon.generation;
				if (!result[gen]) result[gen] = { obtained: 0, total: 0 };
				const state = this.ribbonStateMap.get(ribbon.id) ?? 'available';
				if (state === 'obtained' || state === 'available' || state === 'urgent') {
					result[gen].total++;
					if (state === 'obtained') result[gen].obtained++;
				}
			}
			return result;
		})()
	);

	/** 全データをロードしてlocalStorageから進捗を復元する */
	init(): void {
		if (this.initialized) return;
		this.initialized = true;
		const { pokemonData, ribbonData, gameData } = loadAllData();
		this.allPokemon = pokemonData;
		this.allRibbons = ribbonData;
		this.allGames = gameData;
		this.loadProgress();
		this.loadMyPokemonList();
		// 記録中の個体は実在チェックが必要なので、必ず loadMyPokemonList の後に復元する
		this.loadActiveMyPokemonId();
	}

	/**
	 * ポケモン（種族）を選択する。
	 * 「見てる種族」と「記録してる個体（activeMyPokemonId）」は独立した状態なので、
	 * ここで記録中の個体を解除してはいけない。
	 */
	selectPokemon(pokemon: PokemonDetail): void {
		this.selectedPokemon = pokemon;
	}

	/** アクティブなマイポケモンに対してリボンのトグルを行い、localStorageに保存する */
	toggleRibbon(ribbonId: string): void {
		const key = this.activeMyPokemonId;
		if (!key) return;

		const current = this.progress[key] ?? [];
		const idx = current.indexOf(ribbonId);
		let updated: string[];
		if (idx === -1) {
			updated = [...current, ribbonId];
		} else {
			updated = current.filter((id) => id !== ribbonId);
		}
		this.progress = { ...this.progress, [key]: updated };
		this.saveProgress();
	}

	/** マイポケモンを新規登録し、UUIDを返す */
	addMyPokemon(data: Omit<MyPokemon, 'id' | 'createdAt'>): string {
		const id = crypto.randomUUID();
		const newPokemon: MyPokemon = {
			...data,
			transferConfirmations: data.transferConfirmations ?? {},
			manualRibbonOverrides: data.manualRibbonOverrides ?? {},
			id,
			// 文字列化するだけの一時値。リアクティブ状態ではないので SvelteDate は不要
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			createdAt: new Date().toISOString()
		};
		this.myPokemonList = [...this.myPokemonList, newPokemon];
		this.saveMyPokemonList();
		return id;
	}

	/** マイポケモン情報を更新する */
	updateMyPokemon(id: string, data: Partial<Omit<MyPokemon, 'id' | 'createdAt'>>): void {
		const idx = this.myPokemonList.findIndex((mp) => mp.id === id);
		if (idx === -1) return;
		const updated = [...this.myPokemonList];
		updated[idx] = { ...updated[idx], ...data };
		this.myPokemonList = updated;
		this.saveMyPokemonList();
	}

	/** マイポケモンを削除し、関連する進捗も削除する */
	removeMyPokemon(id: string): void {
		this.myPokemonList = this.myPokemonList.filter((mp) => mp.id !== id);
		const { [id]: _removed, ...rest } = this.progress;
		this.progress = rest;
		this.saveProgress();
		this.saveMyPokemonList();
		if (this.activeMyPokemonId === id) {
			this.activeMyPokemonId = null;
			this.saveActiveMyPokemonId();
		}
	}

	/** アクティブなマイポケモンを切り替え、対応するポケモンを選択する */
	switchMyPokemon(id: string): void {
		const mp = this.myPokemonList.find((m) => m.id === id);
		if (!mp) return;
		this.activeMyPokemonId = id;
		this.saveActiveMyPokemonId();
		this.syncSelectedPokemon(mp);
	}

	/** 記録中の個体に対応する種族を selectedPokemon に反映する */
	private syncSelectedPokemon(mp: MyPokemon): void {
		const detail = this.allPokemon.find((p) => p.id === mp.pokemonId);
		if (detail) {
			this.selectedPokemon = detail;
		}
	}

	/** リボンの取得状態を返す */
	getRibbonState(ribbon: Ribbon): RibbonState {
		return this.ribbonStateMap.get(ribbon.id) ?? 'available';
	}

	getRibbonEvaluation(ribbon: Ribbon): RibbonEvaluation {
		return (
			this.ribbonEvaluationMap.get(ribbon.id) ?? { state: 'available', reasons: ['available_now'] }
		);
	}

	getRibbonReasonLabels(ribbon: Ribbon): string[] {
		const evaluation = this.getRibbonEvaluation(ribbon);
		return evaluation.reasons.map((reason) => getRibbonReasonLabel(reason));
	}

	// 既定引数の現在時刻。呼び出しごとの一時値でリアクティブ状態ではない
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	toggleManualMissed(myPokemonId: string, ribbonId: string, date: Date = new Date()): void {
		const idx = this.myPokemonList.findIndex((mp) => mp.id === myPokemonId);
		if (idx === -1) return;

		const target = this.myPokemonList[idx];
		const current = target.manualRibbonOverrides?.[ribbonId];
		const nextMissed = !(current?.isMissed ?? false);
		const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
			date.getDate()
		).padStart(2, '0')}`;

		const nextOverride: ManualRibbonOverride = {
			isMissed: nextMissed,
			updatedAt: localDate
		};

		const manualRibbonOverrides = {
			...(target.manualRibbonOverrides ?? {}),
			[ribbonId]: nextOverride
		};

		const updated = [...this.myPokemonList];
		updated[idx] = {
			...target,
			manualRibbonOverrides
		};
		this.myPokemonList = updated;
		this.saveMyPokemonList();
	}

	isManualMissed(ribbonId: string, myPokemonId?: string): boolean {
		const key = myPokemonId ?? this.activeMyPokemonId;
		if (!key) return false;
		const target = this.myPokemonList.find((mp) => mp.id === key);
		return target?.manualRibbonOverrides?.[ribbonId]?.isMissed ?? false;
	}

	getManualMissedUpdatedAt(ribbonId: string, myPokemonId?: string): string | undefined {
		const key = myPokemonId ?? this.activeMyPokemonId;
		if (!key) return undefined;
		const target = this.myPokemonList.find((mp) => mp.id === key);
		return target?.manualRibbonOverrides?.[ribbonId]?.updatedAt;
	}

	// 同上（既定引数の一時値）
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	confirmIrreversibleTransfer(myPokemonId: string, routeId: string, date: Date = new Date()): void {
		const idx = this.myPokemonList.findIndex((mp) => mp.id === myPokemonId);
		if (idx === -1) return;

		const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
			date.getDate()
		).padStart(2, '0')}`;
		const confirmation: TransferConfirmation = {
			routeId,
			confirmedAt: localDate,
			agreedIrreversible: true
		};

		const target = this.myPokemonList[idx];
		const transferConfirmations = {
			...(target.transferConfirmations ?? {}),
			[routeId]: confirmation
		};

		const updated = [...this.myPokemonList];
		updated[idx] = {
			...target,
			transferConfirmations,
			lastIrreversibleConfirmedAt: localDate
		};
		this.myPokemonList = updated;
		this.saveMyPokemonList();
	}

	getRouteConfirmationDate(myPokemonId: string, routeId: string): string | undefined {
		const target = this.myPokemonList.find((mp) => mp.id === myPokemonId);
		return target?.transferConfirmations?.[routeId]?.confirmedAt;
	}

	getLastConfirmationDate(myPokemonId: string): string | undefined {
		const target = this.myPokemonList.find((mp) => mp.id === myPokemonId);
		return target?.lastIrreversibleConfirmedAt;
	}

	/** @deprecated getRibbonState を使ってください */
	getRibbonEligibility(ribbon: Ribbon): { eligible: boolean; reason?: string } {
		const state = this.getRibbonState(ribbon);
		return {
			eligible: state !== 'locked',
			reason: state === 'locked' ? '取得不可' : undefined
		};
	}

	/** 進捗データをJSONファイルとしてダウンロードする */
	exportProgress(): void {
		const data = {
			progress: this.progress,
			myPokemonList: this.myPokemonList
		};
		const json = JSON.stringify(data, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		// ファイル名用に文字列化するだけの一時値
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		a.download = `ribbon-progress-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	/** JSONデータから進捗をインポートする */
	importProgress(json: string): void {
		const raw = JSON.parse(json) as unknown;
		if (raw && typeof raw === 'object' && 'progress' in raw) {
			const data = raw as { progress: Record<string, string[]>; myPokemonList?: MyPokemon[] };
			for (const [key, value] of Object.entries(data.progress)) {
				if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
					throw new Error(`不正なデータ形式: ${key}`);
				}
			}
			this.progress = data.progress;
			if (Array.isArray(data.myPokemonList)) {
				// 欠損フィールドの補完 → 検証 の順（逆にすると旧形式データが不正判定で落ちる）
				const patched: unknown[] = (data.myPokemonList as unknown[]).map(withMyPokemonDefaults);
				const valid: MyPokemon[] = patched.filter(isValidMyPokemon);
				const skipped = patched.length - valid.length;
				if (skipped > 0) {
					console.warn(
						`importProgress: ${skipped}件のマイポケモンデータが不正なためスキップしました`
					);
				}
				this.myPokemonList = valid;
				this.saveMyPokemonList();
				// リストが総入れ替えされるので、記録中の個体が残っているか確認する
				this.reconcileActiveMyPokemonId();
			}
			this.saveProgress();
		} else {
			throw new Error('進捗データの形式が不正です');
		}
	}

	/** アクティブなマイポケモンのリボン進捗をリセットする */
	resetProgress(): void {
		const key = this.activeMyPokemonId;
		if (!key) return;
		this.progress = { ...this.progress, [key]: [] };
		this.saveProgress();
	}

	/** 進捗データをlocalStorageに保存する */
	private saveProgress(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(this.progress));
		} catch {
			// 保存失敗時は無視
		}
	}

	/** マイポケモンリストをlocalStorageに保存する */
	private saveMyPokemonList(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(MY_POKEMON_STORAGE_KEY, JSON.stringify(this.myPokemonList));
		} catch {
			// 保存失敗時は無視
		}
	}

	/** 記録中の個体IDをlocalStorageに保存する（null のときはキーごと削除する） */
	private saveActiveMyPokemonId(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			if (this.activeMyPokemonId === null) {
				localStorage.removeItem(ACTIVE_MY_POKEMON_STORAGE_KEY);
			} else {
				localStorage.setItem(ACTIVE_MY_POKEMON_STORAGE_KEY, this.activeMyPokemonId);
			}
		} catch {
			// 保存失敗時は無視
		}
	}

	/** localStorageから進捗データを復元する */
	private loadProgress(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
			this.progress = saved ? (JSON.parse(saved) as Record<string, string[]>) : {};
		} catch {
			this.progress = {};
		}
	}

	/** localStorageからマイポケモンリストを復元する */
	private loadMyPokemonList(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const saved = localStorage.getItem(MY_POKEMON_STORAGE_KEY);
			const parsed: unknown = saved ? JSON.parse(saved) : [];
			if (!Array.isArray(parsed)) {
				this.myPokemonList = [];
				return;
			}
			// 欠損フィールドの補完 → 検証 の順。
			// 逆にすると transferConfirmations 等を持たない旧データが不正判定で全消えする。
			const patched: unknown[] = (parsed as unknown[]).map(withMyPokemonDefaults);
			const valid: MyPokemon[] = patched.filter(isValidMyPokemon);
			const skipped = patched.length - valid.length;
			if (skipped > 0) {
				console.warn(
					`loadMyPokemonList: ${skipped}件のマイポケモンデータが不正なためスキップしました`
				);
			}
			this.myPokemonList = valid;
		} catch {
			this.myPokemonList = [];
		}
	}

	/** localStorageから記録中の個体IDを復元する（loadMyPokemonList の後に呼ぶこと） */
	private loadActiveMyPokemonId(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			this.activeMyPokemonId = localStorage.getItem(ACTIVE_MY_POKEMON_STORAGE_KEY);
		} catch {
			this.activeMyPokemonId = null;
		}
		// 削除済み・破損で弾かれた個体のIDが残っていることがあるので実在チェックする
		this.reconcileActiveMyPokemonId();
		// 復元できたら見てる種族も合わせる（switchMyPokemon 直後と同じ状態にするため）
		const restored = this.myPokemonList.find((mp) => mp.id === this.activeMyPokemonId);
		if (restored) {
			this.syncSelectedPokemon(restored);
		}
	}

	/** 記録中の個体がマイポケモンリストに実在するか検証し、無ければ null に落とす */
	private reconcileActiveMyPokemonId(): void {
		if (this.activeMyPokemonId === null) return;
		const exists = this.myPokemonList.some((mp) => mp.id === this.activeMyPokemonId);
		if (exists) return;
		this.activeMyPokemonId = null;
		// ストレージ側にも残骸を残さない
		this.saveActiveMyPokemonId();
	}
}

export const ribbonProgress = new RibbonProgressStore();
