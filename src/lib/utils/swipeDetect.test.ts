// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { detectSwipe } from '$lib/utils/swipeDetect';

// ---- detectSwipe: スワイプ方向判定の仕様 ----
//
// t-wada 式: テストは「仕様のドキュメント」
// - 関数の振る舞いを日本語で記述し、コードと仕様を一致させる

describe('detectSwipe', () => {
	// --- スワイプ成立: 方向を返す ---

	it('左スワイプ (deltaX < 0, 閾値超え) → next', () => {
		expect(detectSwipe(-60, 0)).toBe('next');
	});

	it('右スワイプ (deltaX > 0, 閾値超え) → prev', () => {
		expect(detectSwipe(60, 0)).toBe('prev');
	});

	it('閾値ちょうど超えた水平スワイプ → 方向を返す', () => {
		expect(detectSwipe(-51, 0)).toBe('next');
		expect(detectSwipe(51, 0)).toBe('prev');
	});

	it('閾値に customThreshold を渡せる', () => {
		expect(detectSwipe(-30, 0, 20)).toBe('next');
		expect(detectSwipe(30, 0, 20)).toBe('prev');
	});

	// --- スワイプ不成立: null を返す ---

	it('移動量が閾値以下 → null（誤検知しない）', () => {
		expect(detectSwipe(-49, 0)).toBeNull();
		expect(detectSwipe(49, 0)).toBeNull();
	});

	it('閾値ちょうど → null（境界は成立しない）', () => {
		expect(detectSwipe(-50, 0)).toBeNull();
		expect(detectSwipe(50, 0)).toBeNull();
	});

	it('垂直移動が水平より大きい → null（縦スクロールをスワイプと誤認しない）', () => {
		expect(detectSwipe(60, 80)).toBeNull();
		expect(detectSwipe(-60, -80)).toBeNull();
	});

	it('水平と垂直が同量 → null（優位性なし）', () => {
		expect(detectSwipe(60, 60)).toBeNull();
	});

	it('移動なし → null', () => {
		expect(detectSwipe(0, 0)).toBeNull();
	});

	// --- swipeHandled パターン: onClick 抑止の仕様 ---
	// スワイプ成立後は必ず direction !== null になるため、
	// コンポーネント側で "if (direction !== null) swipeHandled = true" の
	// ガードが機能することを間接的に保証する。

	it('スワイプ成立時は null 以外を返す → コンポーネントでの onClick 抑止が機能する', () => {
		const result = detectSwipe(-80, 5);
		expect(result).not.toBeNull(); // swipeHandled = true の条件が成立する
	});

	it('スワイプ不成立時は null → onClick は通常通り発火する', () => {
		const result = detectSwipe(-10, 0);
		expect(result).toBeNull(); // swipeHandled はセットされない
	});
});
