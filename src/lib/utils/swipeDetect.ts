/**
 * スワイプ方向を判定する純粋関数。
 * - 水平移動が垂直移動より大きく、かつ閾値を超えた場合にのみ方向を返す。
 * - 閾値以下または垂直スクロールの場合は null（スワイプなし）を返す。
 */
export type SwipeDirection = 'prev' | 'next' | null;

export function detectSwipe(
	deltaX: number,
	deltaY: number,
	threshold: number = 50
): SwipeDirection {
	if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
		return deltaX < 0 ? 'next' : 'prev';
	}
	return null;
}
