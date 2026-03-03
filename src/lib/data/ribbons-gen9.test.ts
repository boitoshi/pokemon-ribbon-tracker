// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { RIBBONS_GEN9 } from '$lib/data/ribbons-gen9';

// ---- Gen9リボンデータの仕様 ----
//
// t-wada 式: データ仕様もテストで固定し、「存在しないこと」を明文化する。
// 手動でデータ行を削除しても、誤って復元されないようにする防壁。

describe('RIBBONS_GEN9 — データ整合性', () => {
	// --- 存在してはいけないリボン（ゲーム上存在しない） ---

	it('アンディフィーテッドリボン は Gen9 に存在しない', () => {
		const ids = RIBBONS_GEN9.map((r) => r.id);
		expect(ids).not.toContain('undefeated-ribbon');
	});

	it('マスターリボン は Gen9 に存在しない', () => {
		const ids = RIBBONS_GEN9.map((r) => r.id);
		expect(ids).not.toContain('master-ribbon');
	});

	it('ベストフレンドリボン (gen9) は Gen9 に存在しない', () => {
		const ids = RIBBONS_GEN9.map((r) => r.id);
		expect(ids).not.toContain('best-friends-ribbon-g9');
	});

	// --- 存在すべきリボン ---

	it('パルデアチャンプリボン が含まれる', () => {
		const ids = RIBBONS_GEN9.map((r) => r.id);
		expect(ids).toContain('champion-paldea');
	});

	it('パートナーリボン (sv) が含まれる', () => {
		const ids = RIBBONS_GEN9.map((r) => r.id);
		expect(ids).toContain('partner-ribbon-sv');
	});

	// --- データ構造の整合性 ---

	it('全リボンに必須フィールドが揃っている', () => {
		for (const ribbon of RIBBONS_GEN9) {
			expect(ribbon.id, `${ribbon.id}: id が空`).toBeTruthy();
			expect(ribbon.name, `${ribbon.id}: name が空`).toBeTruthy();
			expect(ribbon.generation, `${ribbon.id}: generation が未定義`).toBeDefined();
			expect(ribbon.games.length, `${ribbon.id}: games が空配列`).toBeGreaterThan(0);
			expect(ribbon.category, `${ribbon.id}: category が空`).toBeTruthy();
		}
	});

	it('全リボンの generation は 9', () => {
		for (const ribbon of RIBBONS_GEN9) {
			expect(ribbon.generation).toBe(9);
		}
	});

	it('全リボンの games に scarlet または violet が含まれる', () => {
		for (const ribbon of RIBBONS_GEN9) {
			const hasGen9Game = ribbon.games.some((g) => g === 'scarlet' || g === 'violet');
			expect(hasGen9Game, `${ribbon.id}: games に Gen9 タイトルがない`).toBe(true);
		}
	});
});
