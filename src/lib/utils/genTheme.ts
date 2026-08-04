/** 世代ごとの配色テーマ（Tailwind クラス名） */
export interface GenTheme {
	/** 背景グラデーション（from-* to-*） */
	gradient: string;
	/** 枠線色 */
	border: string;
	/** 見出し・強調テキスト色 */
	accent: string;
}

/** 世代カラーテーママップ */
export const GEN_THEME: Record<number, GenTheme> = {
	3: { gradient: 'from-red-50 to-orange-50', border: 'border-red-200', accent: 'text-red-700' },
	4: {
		gradient: 'from-blue-50 to-indigo-50',
		border: 'border-blue-200',
		accent: 'text-blue-700'
	},
	5: {
		gradient: 'from-gray-50 to-slate-100',
		border: 'border-gray-300',
		accent: 'text-gray-700'
	},
	6: { gradient: 'from-sky-50 to-blue-50', border: 'border-sky-200', accent: 'text-sky-700' },
	7: {
		gradient: 'from-amber-50 to-yellow-50',
		border: 'border-amber-200',
		accent: 'text-amber-700'
	},
	8: { gradient: 'from-rose-50 to-red-50', border: 'border-rose-200', accent: 'text-rose-700' },
	9: {
		gradient: 'from-violet-50 to-purple-50',
		border: 'border-violet-200',
		accent: 'text-violet-700'
	}
};

/** 未知の世代に使うフォールバックテーマ */
export const DEFAULT_GEN_THEME: GenTheme = {
	gradient: 'from-gray-50 to-slate-50',
	border: 'border-gray-200',
	accent: 'text-gray-700'
};

/** 世代番号から配色テーマを取得する（未知の世代は DEFAULT_GEN_THEME） */
export function getGenTheme(generation: number): GenTheme {
	return GEN_THEME[generation] ?? DEFAULT_GEN_THEME;
}
