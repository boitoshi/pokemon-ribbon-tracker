import type { Hardware, TransferRoute, TransferRequirementOption } from '$lib/types';

/** セットアップストアのlocalStorageキー */
const SETUP_STORAGE_KEY = 'rt_setup';

/** セットアップ設定の永続化データ型 */
interface SetupData {
	ownedGames: string[];
	ownedHardware: Hardware[];
	setupCompleted: boolean;
}

interface RouteAvailability {
	available: boolean;
	satisfiedOption: TransferRequirementOption | null;
	missingByOption: Hardware[][];
}

const EMPTY_AVAILABILITY: RouteAvailability = {
	available: false,
	satisfiedOption: null,
	missingByOption: []
};

/** 所持ゲーム・ハード設定を管理するストア */
class SetupStore {
	ownedGames = $state<string[]>([]);
	ownedHardware = $state<Hardware[]>([]);
	setupCompleted = $state<boolean>(false);

	private normalizeHardware(hardware: Hardware[]): Hardware[] {
		const order: Hardware[] = ['gba', 'ds_lite', 'dsi', '3ds', 'switch'];
		const unique = Array.from(new Set(hardware));
		return order.filter((hw) => unique.includes(hw));
	}

	private hasRequiredUnits(required: Hardware[], owned: Hardware[]): boolean {
		const requiredCount = required.reduce<Record<Hardware, number>>(
			(acc, hw) => ({ ...acc, [hw]: (acc[hw] ?? 0) + 1 }),
			{} as Record<Hardware, number>
		);

		const ownedCount = owned.reduce<Record<Hardware, number>>(
			(acc, hw) => ({ ...acc, [hw]: (acc[hw] ?? 0) + 1 }),
			{} as Record<Hardware, number>
		);

		return Object.entries(requiredCount).every(([key, count]) => {
			const hw = key as Hardware;
			return (ownedCount[hw] ?? 0) >= count;
		});
	}

	private getMissingHardware(required: Hardware[], owned: Hardware[]): Hardware[] {
		const ownedCount = owned.reduce<Record<Hardware, number>>(
			(acc, hw) => ({ ...acc, [hw]: (acc[hw] ?? 0) + 1 }),
			{} as Record<Hardware, number>
		);

		const missing: Hardware[] = [];
		for (const hw of required) {
			if ((ownedCount[hw] ?? 0) > 0) {
				ownedCount[hw] -= 1;
			} else {
				missing.push(hw);
			}
		}
		return missing;
	}

	/** localStorageから設定を復元する */
	init(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const saved = localStorage.getItem(SETUP_STORAGE_KEY);
			if (saved) {
				const data = JSON.parse(saved) as SetupData;
				this.ownedGames = data.ownedGames ?? [];
				this.ownedHardware = this.normalizeHardware(data.ownedHardware ?? []);
				this.setupCompleted = data.setupCompleted ?? false;
			}
		} catch {
			// 読み込み失敗時はデフォルト値のまま
		}
	}

	/** 所持ゲームを一括設定する */
	setOwnedGames(games: string[]): void {
		this.ownedGames = games;
		this.save();
	}

	/** ゲームの所持状態をトグルする */
	toggleGame(gameId: string): void {
		const idx = this.ownedGames.indexOf(gameId);
		if (idx === -1) {
			this.ownedGames = [...this.ownedGames, gameId];
		} else {
			this.ownedGames = this.ownedGames.filter((g) => g !== gameId);
		}
		this.save();
	}

	/** 所持ハードを一括設定する */
	setOwnedHardware(hardware: Hardware[]): void {
		this.ownedHardware = this.normalizeHardware(hardware);
		this.save();
	}

	/** ハードの所持状態をトグルする */
	toggleHardware(hw: Hardware): void {
		const idx = this.ownedHardware.indexOf(hw);
		if (idx === -1) {
			this.ownedHardware = this.normalizeHardware([...this.ownedHardware, hw]);
		} else {
			this.ownedHardware = this.normalizeHardware(this.ownedHardware.filter((h) => h !== hw));
		}
		this.save();
	}

	evaluateRouteAvailability(route: TransferRoute): RouteAvailability {
		const options = route.requirements?.anyOf ?? [];
		if (options.length === 0) return EMPTY_AVAILABILITY;

		for (const option of options) {
			if (this.hasRequiredUnits(option.allOf, this.ownedHardware)) {
				return {
					available: true,
					satisfiedOption: option,
					missingByOption: []
				};
			}
		}

		return {
			available: false,
			satisfiedOption: null,
			missingByOption: options.map((option) => this.getMissingHardware(option.allOf, this.ownedHardware))
		};
	}

	getRouteMissingHardware(route: TransferRoute): Hardware[] {
		const result = this.evaluateRouteAvailability(route);
		if (result.available || result.missingByOption.length === 0) return [];

		return result.missingByOption.reduce((best, current) =>
			current.length < best.length ? current : best
		);
	}

	/** セットアップを完了済みにする */
	completeSetup(): void {
		this.setupCompleted = true;
		this.save();
	}

	/** セットアップをリセットする */
	resetSetup(): void {
		this.ownedGames = [];
		this.ownedHardware = [];
		this.setupCompleted = false;
		this.save();
	}

	/** localStorageに保存する */
	private save(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const data: SetupData = {
				ownedGames: this.ownedGames,
				ownedHardware: this.ownedHardware,
				setupCompleted: this.setupCompleted
			};
			localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(data));
		} catch {
			// 保存失敗時は無視
		}
	}
}

export const setup = new SetupStore();
