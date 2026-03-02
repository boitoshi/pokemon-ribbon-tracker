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

/** localStorageキー定数 */
const PROGRESS_STORAGE_KEY = 'rt_progress';
const MY_POKEMON_STORAGE_KEY = 'rt_my_pokemon';

/** 世代別進捗データ型 */
export interface GenerationProgress {
	obtained: number;
	total: number;
}

/** リボン進捗を管理するメインストア */
class RibbonProgressStore {
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

	/** ゲームID → 世代番号のマップ */
	private gameGenMap: ReadonlyMap<string, number> = $derived(
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
					this.currentCheckedRibbons.includes(ribbon.id),
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
						this.currentCheckedRibbons.includes(ribbon.id),
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
		const { pokemonData, ribbonData, gameData } = loadAllData();
		this.allPokemon = pokemonData;
		this.allRibbons = ribbonData;
		this.allGames = gameData;
		this.loadProgress();
		this.loadMyPokemonList();
	}

	/** ポケモンを選択する */
	selectPokemon(pokemon: PokemonDetail): void {
		this.selectedPokemon = pokemon;
		this.activeMyPokemonId = null;
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
		}
	}

	/** アクティブなマイポケモンを切り替え、対応するポケモンを選択する */
	switchMyPokemon(id: string): void {
		const mp = this.myPokemonList.find((m) => m.id === id);
		if (!mp) return;
		this.activeMyPokemonId = id;
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
		return this.ribbonEvaluationMap.get(ribbon.id) ?? { state: 'available', reasons: ['available_now'] };
	}

	getRibbonReasonLabels(ribbon: Ribbon): string[] {
		const evaluation = this.getRibbonEvaluation(ribbon);
		return evaluation.reasons.map((reason) => getRibbonReasonLabel(reason));
	}

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
				this.myPokemonList = data.myPokemonList.map((mp) => ({
					...mp,
					transferConfirmations: mp.transferConfirmations ?? {},
					manualRibbonOverrides: mp.manualRibbonOverrides ?? {}
				}));
				this.saveMyPokemonList();
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
			this.myPokemonList = saved
				? (JSON.parse(saved) as MyPokemon[]).map((mp) => ({
						...mp,
						transferConfirmations: mp.transferConfirmations ?? {},
						manualRibbonOverrides: mp.manualRibbonOverrides ?? {}
					}))
				: [];
		} catch {
			this.myPokemonList = [];
		}
	}
}

export const ribbonProgress = new RibbonProgressStore();
