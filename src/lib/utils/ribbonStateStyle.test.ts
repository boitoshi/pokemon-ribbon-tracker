import { describe, it, expect } from 'vitest';
import type { Ribbon, RibbonState } from '$lib/types';
import {
	getRibbonStateStyle,
	getListWrapperClass,
	getStateBadge,
	getStateLabel
} from './ribbonStateStyle';
import { getCategoryStyle } from './ribbonCategory';

const ALL_STATES: RibbonState[] = ['obtained', 'urgent', 'available', 'missed', 'future', 'locked'];

function makeRibbon(overrides: Partial<Ribbon> = {}): Ribbon {
	return {
		id: 'test',
		name: 'テストリボン',
		description: '',
		generation: 3,
		games: [],
		category: 'チャンピオン',
		...overrides
	};
}

describe('getRibbonStateStyle', () => {
	it('6状態すべてに固有のセルクラスを返す', () => {
		const classes = ALL_STATES.map((s) => getRibbonStateStyle(s).cellClass);
		expect(new Set(classes).size).toBe(ALL_STATES.length);
	});

	it('色を抜いても判別できるよう、状態ごとに非色の手がかりを持つ', () => {
		// obtained / urgent は記号（チップ）、missed は斜め一本線を持つ
		expect(getRibbonStateStyle('obtained').chip?.text).toBe('✓');
		expect(getRibbonStateStyle('urgent').chip?.text).toBe('！');
		expect(getRibbonStateStyle('missed').strike).toBe(true);

		// 押せない3状態はチップを持たない
		expect(getRibbonStateStyle('available').chip).toBeNull();
		expect(getRibbonStateStyle('future').chip).toBeNull();
		expect(getRibbonStateStyle('locked').chip).toBeNull();
	});

	it('斜め一本線は missed だけに出る（取り消し線の比喩）', () => {
		const striking = ALL_STATES.filter((s) => getRibbonStateStyle(s).strike);
		expect(striking).toEqual(['missed']);
	});

	it('未知の状態は available にフォールバックする', () => {
		const unknown = 'nonexistent' as RibbonState;
		expect(getRibbonStateStyle(unknown)).toEqual(getRibbonStateStyle('available'));
	});
});

describe('getListWrapperClass', () => {
	it('opacity による減光を使わない（コントラストを保ったまま後退させる）', () => {
		for (const state of ALL_STATES) {
			expect(getListWrapperClass(state)).not.toMatch(/opacity-/);
		}
	});

	it('取り逃しの行は地を白に戻し、赤は左の罫だけに絞る', () => {
		const missed = getListWrapperClass('missed');
		expect(missed).toContain('bg-white');
		expect(missed).toContain('border-l-red-600');
	});

	it('future は破線でグリッドの手がかりと揃える', () => {
		expect(getListWrapperClass('future')).toContain('border-dashed');
	});
});

describe('getStateBadge', () => {
	it('状態バッジはベタ塗りで、1行に1個だけ（obtained は持たない）', () => {
		expect(getStateBadge('obtained')).toBeNull();
		expect(getStateBadge('available')).toBeNull();
		expect(getStateBadge('urgent')?.text).toBe('⚡ 今すぐ！');
		expect(getStateBadge('missed')?.text).toBe('❌ 取り逃し');
	});

	it('取得不可は失敗ではないので赤を使わない', () => {
		expect(getStateBadge('locked')?.class).not.toMatch(/red/);
		expect(getStateBadge('future')?.class).not.toMatch(/red/);
	});
});

describe('getStateLabel', () => {
	it('6状態すべてにラベルがある', () => {
		for (const state of ALL_STATES) {
			expect(getStateLabel(state)).not.toBe('');
		}
	});
});

describe('getCategoryStyle', () => {
	it('データに存在する全カテゴリを解決できる', () => {
		const categories = [
			'チャンピオン',
			'コンテスト',
			'バトル施設',
			'思い出',
			'イベント',
			'特殊',
			'あかし'
		];
		const rings = categories.map((category) => getCategoryStyle(makeRibbon({ category })).ring);
		// フォールバック色に落ちていない＝全カテゴリが表に載っている
		expect(rings).not.toContain(getCategoryStyle(makeRibbon({ category: '未定義' })).ring);
	});

	it('あかしは category から解決でき、type の分岐に依存しない', () => {
		const mark = makeRibbon({ category: 'あかし', type: 'mark' });
		expect(getCategoryStyle(mark).emoji).toBe('🔖');
	});

	it('未知のカテゴリはフォールバックを返す', () => {
		expect(getCategoryStyle(makeRibbon({ category: '知らない分類' })).emoji).toBe('🎀');
	});
});
