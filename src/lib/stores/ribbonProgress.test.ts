import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RibbonProgressStore } from '$lib/stores/ribbonProgress.svelte';
import type { MyPokemon, PokemonDetail } from '$lib/types';

// ---- localStorageキー（ストア側の定数と一致させること） ----

const MY_POKEMON_STORAGE_KEY = 'rt_my_pokemon';
const ACTIVE_MY_POKEMON_STORAGE_KEY = 'rt_active_my_pokemon';

/**
 * まっさらなストアを作って init() する（＝アプリ起動時と同じ復元処理を走らせる）。
 * 実アプリはシングルトンだが init() に再呼び出しガードがあるため、
 * テストではインスタンスを作り直して「リロード」を再現する。
 */
function createInitializedStore(): RibbonProgressStore {
	const store = new RibbonProgressStore();
	store.init();
	return store;
}

/** 現行形式の有効なマイポケモン1件 */
function myPokemonEntry(overrides: Partial<MyPokemon> = {}): MyPokemon {
	return {
		id: 'mp-001',
		pokemonId: 'bulbasaur',
		nickname: 'ふしぎくん',
		originGame: 'ruby',
		currentGame: 'ruby',
		level: 30,
		isTransferredToHome: false,
		transferConfirmations: {},
		manualRibbonOverrides: {},
		memo: '',
		createdAt: '2026-01-01T00:00:00.000Z',
		...overrides
	};
}

/** 旧形式（transferConfirmations / manualRibbonOverrides を持たない）のマイポケモン1件 */
function legacyMyPokemonEntry(id: string = 'mp-legacy'): unknown {
	const {
		transferConfirmations: _tc,
		manualRibbonOverrides: _mo,
		...rest
	} = myPokemonEntry({ id });
	return rest;
}

function seedMyPokemonList(entries: unknown): void {
	localStorage.setItem(MY_POKEMON_STORAGE_KEY, JSON.stringify(entries));
}

function seedActiveMyPokemonId(id: string): void {
	localStorage.setItem(ACTIVE_MY_POKEMON_STORAGE_KEY, id);
}

/** ストアが保持しているマスターデータからポケモンを引く */
function getPokemon(store: RibbonProgressStore, pokemonId: string): PokemonDetail {
	const pokemon = store.allPokemon.find((p) => p.id === pokemonId);
	if (!pokemon) throw new Error(`テストデータにポケモン ${pokemonId} が見つかりません`);
	return pokemon;
}

/** 世代別進捗の分母合計（＝「見てる種族」依存の集計。比較対象として使う） */
function generationTotal(store: RibbonProgressStore): number {
	return Object.values(store.generationProgress).reduce((sum, gen) => sum + gen.total, 0);
}

beforeEach(() => {
	localStorage.clear();
});

describe('selectPokemon と activeMyPokemonId の分離', () => {
	it('selectPokemon を呼んでも記録中の個体は解除されない', () => {
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();
		store.switchMyPokemon('mp-001');

		// 別の種族をただ閲覧しただけ
		store.selectPokemon(getPokemon(store, 'charmander'));

		expect(store.activeMyPokemonId).toBe('mp-001');
		expect(store.activeMyPokemon?.id).toBe('mp-001');
		expect(store.selectedPokemon?.id).toBe('charmander');
	});

	it('selectPokemon を連続で呼んでも記録中の個体は維持される', () => {
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();
		store.switchMyPokemon('mp-001');

		store.selectPokemon(getPokemon(store, 'charmander'));
		store.selectPokemon(getPokemon(store, 'squirtle'));
		store.selectPokemon(getPokemon(store, 'bulbasaur'));

		expect(store.activeMyPokemonId).toBe('mp-001');
	});

	it('記録中の個体がいない状態で selectPokemon を呼んでも null のまま', () => {
		const store = createInitializedStore();

		store.selectPokemon(getPokemon(store, 'charmander'));

		expect(store.activeMyPokemonId).toBeNull();
	});

	it('selectPokemon 後もリボンのトグルは記録中の個体に対して効く', () => {
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();
		store.switchMyPokemon('mp-001');

		store.selectPokemon(getPokemon(store, 'charmander'));
		store.toggleRibbon('champion-hoenn');

		expect(store.progress['mp-001']).toEqual(['champion-hoenn']);
	});
});

describe('activeMyPokemonId の永続化', () => {
	it('switchMyPokemon で localStorage に保存される', () => {
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();

		store.switchMyPokemon('mp-001');

		expect(localStorage.getItem(ACTIVE_MY_POKEMON_STORAGE_KEY)).toBe('mp-001');
	});

	it('存在しないIDで switchMyPokemon しても保存されない', () => {
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();

		store.switchMyPokemon('mp-unknown');

		expect(store.activeMyPokemonId).toBeNull();
		expect(localStorage.getItem(ACTIVE_MY_POKEMON_STORAGE_KEY)).toBeNull();
	});

	it('init() で localStorage から復元される', () => {
		seedMyPokemonList([myPokemonEntry()]);
		seedActiveMyPokemonId('mp-001');

		const store = createInitializedStore();

		expect(store.activeMyPokemonId).toBe('mp-001');
		expect(store.activeMyPokemon?.nickname).toBe('ふしぎくん');
	});

	it('復元時は見てる種族も記録中の個体に合わせられる', () => {
		seedMyPokemonList([myPokemonEntry({ pokemonId: 'charmander' })]);
		seedActiveMyPokemonId('mp-001');

		const store = createInitializedStore();

		expect(store.selectedPokemon?.id).toBe('charmander');
	});

	it('リロードをまたいでも記録中の個体が残る（保存→復元の往復）', () => {
		seedMyPokemonList([myPokemonEntry({ id: 'mp-a' }), myPokemonEntry({ id: 'mp-b' })]);
		const first = createInitializedStore();
		first.switchMyPokemon('mp-b');

		// 同じ localStorage を使ったまま「リロード」する
		const second = createInitializedStore();

		expect(second.activeMyPokemonId).toBe('mp-b');
	});

	it('保存されたIDがマイポケモンリストに存在しない場合は null になる', () => {
		seedMyPokemonList([myPokemonEntry()]);
		seedActiveMyPokemonId('mp-deleted');

		const store = createInitializedStore();

		expect(store.activeMyPokemonId).toBeNull();
		expect(store.activeMyPokemon).toBeNull();
		// ストレージ側の残骸も掃除される
		expect(localStorage.getItem(ACTIVE_MY_POKEMON_STORAGE_KEY)).toBeNull();
	});

	it('マイポケモンリストが空なら復元しても null', () => {
		seedActiveMyPokemonId('mp-001');

		const store = createInitializedStore();

		expect(store.activeMyPokemonId).toBeNull();
	});

	it('removeMyPokemon で記録中の個体を消すと null になり、キーも削除される', () => {
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();
		store.switchMyPokemon('mp-001');

		store.removeMyPokemon('mp-001');

		expect(store.activeMyPokemonId).toBeNull();
		expect(localStorage.getItem(ACTIVE_MY_POKEMON_STORAGE_KEY)).toBeNull();
	});

	it('記録中でない個体を消しても記録中の個体は維持される', () => {
		seedMyPokemonList([myPokemonEntry({ id: 'mp-a' }), myPokemonEntry({ id: 'mp-b' })]);
		const store = createInitializedStore();
		store.switchMyPokemon('mp-a');

		store.removeMyPokemon('mp-b');

		expect(store.activeMyPokemonId).toBe('mp-a');
		expect(localStorage.getItem(ACTIVE_MY_POKEMON_STORAGE_KEY)).toBe('mp-a');
	});
});

describe('主役固定のリボン集計（activeRibbonCount）', () => {
	it('主役が居ないときは 0/0', () => {
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();

		expect(store.activeMyPokemon).toBeNull();
		expect(store.activeRibbonCount).toEqual({ obtained: 0, total: 0 });
	});

	it('主役の種族データが引ける（集計が種族に固定されている前提）', () => {
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();
		store.switchMyPokemon('mp-001');

		store.selectPokemon(getPokemon(store, 'sprigatito'));

		// 見てる種族が変わっても activeSpecies は主役の種族のまま
		expect(store.activeSpecies?.id).toBe('bulbasaur');
		expect(store.selectedPokemon?.id).toBe('sprigatito');
	});

	it('別の種族を閲覧しても主役の集計は分子・分母とも変わらない', () => {
		// bulbasaur（Gen1）/ ルビー / Lv30
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();
		store.switchMyPokemon('mp-001');

		const before = { ...store.activeRibbonCount };
		// 分母が 0 だと「変わらない」ことが自明になり、テストの意味がなくなる
		expect(before.total).toBeGreaterThan(0);

		// Gen9 の種族をただ閲覧しただけ（selectedPokemon だけが変わる）
		store.selectPokemon(getPokemon(store, 'sprigatito'));

		expect(store.activeRibbonCount).toEqual(before);
	});

	it('見てる種族に依存する generationProgress とは独立している', () => {
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();
		store.switchMyPokemon('mp-001');

		const genTotalBefore = generationTotal(store);
		const activeBefore = { ...store.activeRibbonCount };

		// Gen9 の種族を見ると Gen3〜8 のリボンが軒並み locked になり、
		// selectedPokemon 依存の集計は分母が縮む
		store.selectPokemon(getPokemon(store, 'sprigatito'));

		expect(generationTotal(store)).toBeLessThan(genTotalBefore);
		// それでも主役バーの数字（＝この derived）は動かない
		expect(store.activeRibbonCount).toEqual(activeBefore);
	});

	it('リボンをトグルすると分子だけが増減する', () => {
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();
		store.switchMyPokemon('mp-001');

		const before = { ...store.activeRibbonCount };

		// champion-hoenn はルビー（Gen3）で取得可能なので、もともと分母に入っている
		store.toggleRibbon('champion-hoenn');
		expect(store.activeRibbonCount.obtained).toBe(before.obtained + 1);
		expect(store.activeRibbonCount.total).toBe(before.total);

		store.toggleRibbon('champion-hoenn');
		expect(store.activeRibbonCount).toEqual(before);
	});

	it('まだ到達していない世代のリボン（future）も分母に含む', () => {
		// ルビー（Gen3）にいる個体。Gen4 以降のリボンは future 状態になる。
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();
		store.switchMyPokemon('mp-001');

		// generationProgress は Record<世代, {obtained,total}>。
		// 「その世代で今狙えるもの」だけを分母にするので future を含まない
		const nowReachableTotal = Object.values(store.generationProgress).reduce(
			(sum: number, g) => sum + g.total,
			0
		);

		// activeRibbonCount は「最終的に到達できる総数」なので future のぶんだけ大きくなる。
		// ここが同値になると、転送すれば取れるリボンが残っているのに
		// 「100% 完了」と表示される回帰（実機で確認された不具合）に戻る。
		expect(nowReachableTotal).toBeGreaterThan(0);
		expect(store.activeRibbonCount.total).toBeGreaterThan(nowReachableTotal);
	});

	it('手動で「取り逃し」にしたリボンは分母から外れる', () => {
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();
		store.switchMyPokemon('mp-001');

		const before = { ...store.activeRibbonCount };

		store.toggleManualMissed('mp-001', 'champion-hoenn');

		expect(store.activeRibbonCount.total).toBe(before.total - 1);
		expect(store.activeRibbonCount.obtained).toBe(before.obtained);
	});

	it('取得済みのリボンは手動で「取り逃し」にしても取得済みとして数える', () => {
		seedMyPokemonList([myPokemonEntry()]);
		const store = createInitializedStore();
		store.switchMyPokemon('mp-001');

		const before = { ...store.activeRibbonCount };

		store.toggleRibbon('champion-hoenn');
		store.toggleManualMissed('mp-001', 'champion-hoenn');

		expect(store.activeRibbonCount.obtained).toBe(before.obtained + 1);
		expect(store.activeRibbonCount.total).toBe(before.total);
	});

	it('主役を切り替えるとその個体の集計になる', () => {
		seedMyPokemonList([
			myPokemonEntry({ id: 'mp-a' }),
			myPokemonEntry({ id: 'mp-b', currentGame: 'scarlet' })
		]);
		const store = createInitializedStore();

		store.switchMyPokemon('mp-a');
		store.toggleRibbon('champion-hoenn');
		const countA = { ...store.activeRibbonCount };

		store.switchMyPokemon('mp-b');

		// mp-b はまだ何も取得していない = 集計が mp-a のものではなく mp-b のものになっている
		expect(store.activeRibbonCount.obtained).toBe(0);
		// 分母が個体ごとに何件違うかは現在ゲーム依存で、リボンデータの再生成で動きうる。
		// ここでは差を断定せず、後段の往復チェックが「0同士で自明に一致」する退化だけを防ぐ。
		expect(countA.total).toBeGreaterThan(0);
		expect(store.activeRibbonCount.total).toBeGreaterThan(0);

		store.switchMyPokemon('mp-a');
		expect(store.activeRibbonCount).toEqual(countA);
	});
});

describe('ロード時のマイポケモンデータ検証', () => {
	/** 不正データのログでテスト出力が汚れるのを防ぎつつ、呼び出しを検証できるようにする */
	function silenceWarn() {
		return vi.spyOn(console, 'warn').mockImplementation(() => {});
	}

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('旧形式（欠損フィールドあり）のデータが消えずにデフォルト補完される', () => {
		const warnSpy = silenceWarn();
		// 補完より先に検証してしまうと、このデータが丸ごと消える（回帰テスト）
		seedMyPokemonList([legacyMyPokemonEntry()]);

		const store = createInitializedStore();

		expect(store.myPokemonList).toHaveLength(1);
		expect(store.myPokemonList[0].id).toBe('mp-legacy');
		expect(store.myPokemonList[0].transferConfirmations).toEqual({});
		expect(store.myPokemonList[0].manualRibbonOverrides).toEqual({});
		expect(warnSpy).not.toHaveBeenCalled();
	});

	it('旧形式データでも記録中の個体として復元できる', () => {
		silenceWarn();
		seedMyPokemonList([legacyMyPokemonEntry('mp-legacy')]);
		seedActiveMyPokemonId('mp-legacy');

		const store = createInitializedStore();

		expect(store.activeMyPokemonId).toBe('mp-legacy');
	});

	it('壊れたエントリだけが除去され、正常なエントリは残る', () => {
		const warnSpy = silenceWarn();
		seedMyPokemonList([
			myPokemonEntry({ id: 'mp-ok' }),
			{ id: 'mp-broken' },
			null,
			'こわれたデータ'
		]);

		const store = createInitializedStore();

		expect(store.myPokemonList).toHaveLength(1);
		expect(store.myPokemonList[0].id).toBe('mp-ok');
		expect(warnSpy).toHaveBeenCalled();
	});

	it('型違いのフィールドを持つエントリは除去される', () => {
		silenceWarn();
		seedMyPokemonList([{ ...myPokemonEntry({ id: 'mp-bad' }), level: '30' }]);

		const store = createInitializedStore();

		expect(store.myPokemonList).toHaveLength(0);
	});

	it('配列でないデータが保存されていても空リストで復帰する', () => {
		seedMyPokemonList({ broken: true });

		const store = createInitializedStore();

		expect(store.myPokemonList).toEqual([]);
	});

	it('JSONとして壊れていても空リストで復帰する', () => {
		localStorage.setItem(MY_POKEMON_STORAGE_KEY, '{壊れたJSON');

		const store = createInitializedStore();

		expect(store.myPokemonList).toEqual([]);
	});

	it('記録中の個体が検証で弾かれた場合は activeMyPokemonId は null になる', () => {
		silenceWarn();
		seedMyPokemonList([{ id: 'mp-broken' }]);
		seedActiveMyPokemonId('mp-broken');

		const store = createInitializedStore();

		expect(store.myPokemonList).toHaveLength(0);
		expect(store.activeMyPokemonId).toBeNull();
	});
});
