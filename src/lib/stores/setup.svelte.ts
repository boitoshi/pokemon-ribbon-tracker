import type { Hardware } from '$lib/types';

/** セットアップストアのlocalStorageキー */
const SETUP_STORAGE_KEY = 'rt_setup';

/** セットアップ設定の永続化データ型 */
interface SetupData {
	ownedGames: string[];
	ownedHardware: Hardware[];
	setupCompleted: boolean;
}

/** 所持ゲーム・ハード設定を管理するストア */
class SetupStore {
	ownedGames = $state<string[]>([]);
	ownedHardware = $state<Hardware[]>([]);
	setupCompleted = $state<boolean>(false);

	/** localStorageから設定を復元する */
	init(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const saved = localStorage.getItem(SETUP_STORAGE_KEY);
			if (saved) {
				const data = JSON.parse(saved) as SetupData;
				this.ownedGames = data.ownedGames ?? [];
				this.ownedHardware = data.ownedHardware ?? [];
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
		this.ownedHardware = hardware;
		this.save();
	}

	/** ハードの所持状態をトグルする */
	toggleHardware(hw: Hardware): void {
		const idx = this.ownedHardware.indexOf(hw);
		if (idx === -1) {
			this.ownedHardware = [...this.ownedHardware, hw];
		} else {
			this.ownedHardware = this.ownedHardware.filter((h) => h !== hw);
		}
		this.save();
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
