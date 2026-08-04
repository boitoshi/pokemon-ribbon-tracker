import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';

/**
 * 旧 /quick（クイックチェック）は /box に統合済み。
 *
 * prerender を有効にしておくと adapter-static のビルド時に
 * `quick/index.html`（location.href + meta refresh）が生成されるので、
 * 静的ホスティングでもリダイレクトが効く。
 */
export const prerender = true;

export const load: PageLoad = () => {
	// base は本番の /ribbon-tracker 配下に配信されるため必須。
	// 末尾スラッシュは src/routes/+layout.ts の trailingSlash = 'always' に合わせる。
	redirect(308, `${base}/box/`);
};
