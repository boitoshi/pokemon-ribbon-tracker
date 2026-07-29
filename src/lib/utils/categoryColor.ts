/** リボンカテゴリ → タグ色クラスのマッピング（guide 系 UI 共通） */
const CATEGORY_COLOR: Record<string, string> = {
	コンテスト: 'bg-pink-100 text-pink-700',
	バトル: 'bg-red-100 text-red-700',
	チャンピオン: 'bg-yellow-100 text-yellow-700',
	思い出: 'bg-cyan-100 text-cyan-700',
	購入: 'bg-purple-100 text-purple-700',
	イベント: 'bg-indigo-100 text-indigo-700',
	バトルフロンティア: 'bg-orange-100 text-orange-700'
};

/** カテゴリ名からタグ色クラスを取得する */
export function getCategoryColor(category: string): string {
	return CATEGORY_COLOR[category] ?? 'bg-gray-100 text-gray-600';
}
