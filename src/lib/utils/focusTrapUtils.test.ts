// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { getNextFocusIndex } from '$lib/utils/focusTrapUtils';

// ---- getNextFocusIndex: フォーカストラップのナビゲーション仕様 ----
//
// t-wada 式: 境界値を中心に「何が起きるべきか」を日本語で明示する。
// - フォーカス可能要素のリスト内で Tab/Shift+Tab がループすることを保証する。
// - コンポーネントからロジックを分離することで、DOM なしで検証できる。

describe('getNextFocusIndex — Tab キーナビゲーション', () => {
	// --- Tab（前進） ---

	it('先頭要素から Tab → インデックス 1 に進む', () => {
		expect(getNextFocusIndex(0, 3, false)).toBe(1);
	});

	it('中間要素から Tab → 次のインデックスに進む', () => {
		expect(getNextFocusIndex(1, 3, false)).toBe(2);
	});

	it('末尾要素から Tab → 先頭（0）にループする', () => {
		expect(getNextFocusIndex(2, 3, false)).toBe(0);
	});

	it('リスト外（-1）から Tab → 先頭（0）に進む', () => {
		expect(getNextFocusIndex(-1, 3, false)).toBe(0);
	});

	// --- Shift+Tab（後退） ---

	it('末尾要素から Shift+Tab → 1つ前に戻る', () => {
		expect(getNextFocusIndex(2, 3, true)).toBe(1);
	});

	it('中間要素から Shift+Tab → 1つ前に戻る', () => {
		expect(getNextFocusIndex(1, 3, true)).toBe(0);
	});

	it('先頭要素から Shift+Tab → 末尾（total-1）にループする', () => {
		expect(getNextFocusIndex(0, 3, true)).toBe(2);
	});

	it('リスト外（-1）から Shift+Tab → 末尾にループする', () => {
		expect(getNextFocusIndex(-1, 3, true)).toBe(2);
	});

	// --- 要素が1件のみ ---

	it('要素が1件のとき Tab → 先頭（0）にループ', () => {
		expect(getNextFocusIndex(0, 1, false)).toBe(0);
	});

	it('要素が1件のとき Shift+Tab → 先頭（0）にループ', () => {
		expect(getNextFocusIndex(0, 1, true)).toBe(0);
	});

	// --- 要素が0件（フォーカス不能なモーダル） ---

	it('total=0 のとき Tab → 0 を返す（クラッシュしない）', () => {
		expect(getNextFocusIndex(0, 0, false)).toBe(0);
	});

	it('total=0 のとき Shift+Tab → 0 を返す（クラッシュしない）', () => {
		expect(getNextFocusIndex(0, 0, true)).toBe(0);
	});
});
