/**
 * フォーカストラップ用ユーティリティ（純粋関数）
 * テスト可能な形で分離し、Svelte action / コンポーネントから参照する。
 */

/** フォーカス可能要素のセレクタ */
export const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), ' +
	'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Tab / Shift+Tab で次にフォーカスすべきインデックスを返す。
 * リストの端に達したら反対端にループする。
 *
 * @param currentIndex - 現在フォーカスされている要素のインデックス（-1 = リスト外）
 * @param total        - フォーカス可能要素の総数
 * @param isShiftTab   - Shift+Tab（逆方向）なら true
 * @returns 次のインデックス
 */
export function getNextFocusIndex(
	currentIndex: number,
	total: number,
	isShiftTab: boolean
): number {
	if (total === 0) return 0;
	if (isShiftTab) {
		// 先頭またはリスト外 → 末尾へ
		return currentIndex <= 0 ? total - 1 : currentIndex - 1;
	} else {
		// 末尾またはリスト外 → 先頭へ
		return currentIndex >= total - 1 ? 0 : currentIndex + 1;
	}
}
