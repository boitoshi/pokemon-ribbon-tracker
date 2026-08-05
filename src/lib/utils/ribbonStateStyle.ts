import type { RibbonState } from '$lib/types';

/**
 * 6状態 → 表現の対応表。
 *
 * 改訂前は状態を「色」と「opacity」だけに載せていたため、
 * available / future / locked がグレー3段の濃淡差しかなく、
 * 色覚特性や屋外の画面で潰れていた。
 *
 * ここでは塗り・枠線・地の処理・記号の4チャンネルに分けて割り当てる。
 * 実線＝押せる、破線＝まだ、斜線ハッチ＝原理的に不可、斜め一本線＝取り逃し。
 * 色を抜いても6状態が判別できることが、この表の設計条件。
 */
export interface RibbonStateStyle {
	/** グリッドの丸バッジに当てるクラス */
	cellClass: string;
	/** 角のチップ（記号）。null なら出さない */
	chip: { text: string; class: string; label: string } | null;
	/** missed の斜め一本線を出すか */
	strike: boolean;
	/** グリッドのリボン名ラベルに当てるクラス */
	labelClass: string;
}

const STATE_STYLE: Record<RibbonState, RibbonStateStyle> = {
	obtained: {
		cellClass: 'ribbon-cell--obtained',
		chip: { text: '✓', class: 'ribbon-cell__chip--check', label: '取得済み' },
		strike: false,
		labelClass: 'font-semibold text-state-obtained-text'
	},
	urgent: {
		cellClass: 'ribbon-cell--urgent',
		chip: { text: '！', class: 'ribbon-cell__chip--bang', label: '今すぐ取得必須' },
		strike: false,
		labelClass: 'font-semibold text-state-urgent-text'
	},
	available: {
		cellClass: 'ribbon-cell--available',
		chip: null,
		strike: false,
		labelClass: 'text-state-available-text'
	},
	missed: {
		cellClass: 'ribbon-cell--missed',
		chip: null,
		strike: true,
		labelClass: 'font-medium text-state-missed-text'
	},
	future: {
		cellClass: 'ribbon-cell--future',
		chip: null,
		strike: false,
		labelClass: 'text-state-future-text'
	},
	locked: {
		cellClass: 'ribbon-cell--locked',
		chip: null,
		strike: false,
		labelClass: 'text-state-future-text'
	}
};

/** 状態からグリッド表現を引く */
export function getRibbonStateStyle(state: RibbonState): RibbonStateStyle {
	return STATE_STYLE[state] ?? STATE_STYLE.available;
}

/**
 * リストビューの行の枠。
 * opacity による減光はやめ、コントラストを保ったまま後退させる。
 * future は破線、locked は薄地で、グリッドの手がかりと揃えている。
 */
const LIST_WRAPPER_CLASS: Record<RibbonState, string> = {
	obtained: 'border-green-200 bg-green-50',
	urgent: 'border-orange-300 bg-orange-50 border-l-4 border-l-orange-500',
	available: 'border-gray-200 bg-white',
	future: 'border-dashed border-gray-300 bg-white',
	// 地は白に戻す。赤は「左の罫・バッジ・斜線」の3点だけに絞る
	missed: 'border-red-200 bg-white border-l-4 border-l-red-600',
	locked: 'border-gray-200 bg-gray-50'
};

/** 状態からリスト行の枠クラスを引く */
export function getListWrapperClass(state: RibbonState): string {
	return LIST_WRAPPER_CLASS[state] ?? LIST_WRAPPER_CLASS.available;
}

/**
 * 状態バッジ（3階層のうち「状態＝ベタ塗り」）。
 * 1行に必ず1個だけ出す。null なら出さない。
 * obtained はチェックボックスと行の地で足りているのでバッジを持たない。
 */
const STATE_BADGE: Record<RibbonState, { text: string; class: string } | null> = {
	obtained: null,
	urgent: { text: '⚡ 今すぐ！', class: 'bg-state-urgent text-white' },
	available: null,
	missed: { text: '❌ 取り逃し', class: 'bg-state-missed-mark text-white' },
	future: { text: '🔒 未来', class: 'bg-gray-300 text-gray-700' },
	// 取得不可は失敗ではないので赤を使わない
	locked: { text: '🚫 取得不可', class: 'bg-gray-400 text-white' }
};

/** 状態からリスト行の状態バッジを引く */
export function getStateBadge(state: RibbonState): { text: string; class: string } | null {
	return STATE_BADGE[state] ?? null;
}

/** 長押し Toast 用の状態ラベル */
const STATE_LABEL: Record<RibbonState, string> = {
	urgent: '⚡ 今すぐ取得必須！',
	missed: '❌ 取り逃し',
	locked: '🚫 取得不可',
	obtained: '✅ 取得済み',
	available: '🎯 取得可能',
	future: '🔜 将来のリボン'
};

/** 状態から Toast 用ラベルを引く */
export function getStateLabel(state: RibbonState): string {
	return STATE_LABEL[state] ?? '';
}
