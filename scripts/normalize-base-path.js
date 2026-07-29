/**
 * BASE_PATH 環境変数を SvelteKit の paths.base が要求する形式（'' または '/foo'）に正規化する。
 * 例: 'ribbon-tracker' / '/ribbon-tracker/' / '/ribbon-tracker' → '/ribbon-tracker'、未設定・'/' → ''
 * @param {string | undefined} value
 * @returns {string}
 */
export function normalizeBasePath(value) {
	if (!value) return '';
	const trimmed = value.replace(/\/+$/, '');
	if (trimmed === '') return '';
	return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
