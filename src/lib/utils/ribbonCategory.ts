import type { Ribbon } from '$lib/types';

/**
 * リボンカテゴリの表示定義。
 *
 * 改訂前はカテゴリ色を丸バッジの「塗り」に使っていたため、
 * bg-red-500 が「バトル施設の取得済み」と「取り逃し」の両方を指していた。
 * 塗りは状態に一任し、カテゴリは外周リング（--ribbon-ring）へ退避させている。
 */
export interface CategoryStyle {
	/** リボン画像が落ちたときの絵文字フォールバック */
	emoji: string;
	/** 外周リングの色。状態より一段弱い表現として使う */
	ring: string;
}

/** カテゴリ名 → 表示定義。値は改訂前の bg-* と同じ色を使っている */
const CATEGORY_STYLE: Record<string, CategoryStyle> = {
	チャンピオン: { emoji: '🏆', ring: '#f59e0b' }, // amber-500
	コンテスト: { emoji: '🎭', ring: '#ec4899' }, // pink-500
	バトル施設: { emoji: '⚔️', ring: '#ef4444' }, // red-500
	思い出: { emoji: '💫', ring: '#06b6d4' }, // cyan-500
	イベント: { emoji: '✨', ring: '#8b5cf6' }, // violet-500
	特殊: { emoji: '🌟', ring: '#22c55e' }, // green-500
	あかし: { emoji: '🔖', ring: '#c084fc' } // purple-400
};

/** カテゴリ未定義時のフォールバック */
const FALLBACK_STYLE: CategoryStyle = { emoji: '🎀', ring: '#60a5fa' }; // blue-400

/**
 * リボンからカテゴリ表示定義を引く。
 * type === 'mark' は category も 'あかし' なので、カテゴリ表から解決できる。
 */
export function getCategoryStyle(ribbon: Ribbon): CategoryStyle {
	return CATEGORY_STYLE[ribbon.category] ?? FALLBACK_STYLE;
}
