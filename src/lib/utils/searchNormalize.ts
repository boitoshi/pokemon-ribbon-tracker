/**
 * 検索用テキスト正規化ユーティリティ。
 * ひらがな/カタカナ揺れ・大文字小文字の違いによる検索漏れを防ぐ。
 *
 * 変換内容:
 * 1. 全体を小文字化（英字の大小文字統一）
 * 2. ひらがな → カタカナ（ポケモン名はカタカナ表記のため）
 */
export function normalizeForSearch(text: string): string {
	return text
		.toLowerCase()
		.replace(/[\u3041-\u3096]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
}
