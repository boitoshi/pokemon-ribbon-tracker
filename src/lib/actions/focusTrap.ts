import { FOCUSABLE_SELECTOR, getNextFocusIndex } from '$lib/utils/focusTrapUtils';

/**
 * フォーカストラップ Svelte action。
 *
 * モーダル・ボトムシートなど「フォーカスを閉じ込めたいコンテナ」に適用する。
 *
 * - マウント時: コンテナ内の最初のフォーカス可能要素へフォーカスを移動。
 * - Tab / Shift+Tab: コンテナ内でループさせ、外へ出ない。
 * - Escape: onEscape コールバックを呼ぶ（省略可）。
 *
 * 使い方:
 * ```svelte
 * <div use:focusTrap={{ onEscape: closePanel }}>...</div>
 * ```
 */
export interface FocusTrapOptions {
	onEscape?: () => void;
}

export function focusTrap(
	node: HTMLElement,
	options: FocusTrapOptions = {}
): { destroy(): void } {
	function getFocusable(): HTMLElement[] {
		return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
	}

	// マウント時に最初のフォーカス可能要素へ移動
	const focusable = getFocusable();
	if (focusable.length > 0) {
		// rAF で DOM 確定後にフォーカスを当てる
		requestAnimationFrame(() => focusable[0].focus());
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'Escape') {
			options.onEscape?.();
			return;
		}
		if (e.key !== 'Tab') return;

		const focusableNow = getFocusable();
		if (focusableNow.length === 0) return;

		const currentIndex = focusableNow.indexOf(document.activeElement as HTMLElement);
		const nextIndex = getNextFocusIndex(currentIndex, focusableNow.length, e.shiftKey);

		e.preventDefault();
		focusableNow[nextIndex].focus();
	}

	node.addEventListener('keydown', handleKeydown);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
		}
	};
}
